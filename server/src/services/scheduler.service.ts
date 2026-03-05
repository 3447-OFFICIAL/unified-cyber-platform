import cron from "node-cron";
import Parser from "rss-parser";
import { prisma } from "./prisma.service";
import * as cheerio from "cheerio";

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    }
});


// Rate limiting: track last fetch time
const FETCH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour minimum between fetches
const lastFetch: Record<string, number> = {};

// RSS Feed sources per region
const RSS_FEEDS: Array<{ regionCode: string; categoryName: string; feedUrl: string }> = [
    {
        regionCode: "US",
        categoryName: "Advisories",
        feedUrl: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    },
    {
        regionCode: "US",
        categoryName: "Advisories",
        feedUrl: "https://www.cisa.gov/newsroom/all.xml", // Govt. News/Blogs
    },
    {
        regionCode: "DE",
        categoryName: "Advisories",
        feedUrl: "https://wid.cert-bund.de/content/public/securityAdvisory/rss",
    },
    {
        regionCode: "GB",
        categoryName: "Advisories",
        feedUrl: "https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml",
    },
];

/**
 * Custom scraper for CERT-In (India) since they don't provide a reliable RSS feed.
 * Parses their official advisory landing page.
 */
const fetchCERTIn = async () => {
    try {
        console.log("[Scheduler] Fetching India (CERT-In) Official Advisories via Cheerio...");
        const response = await fetch("https://www.cert-in.org.in/s2cMainServlet?pageid=PUBWEL01", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;'
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const region = await prisma.region.findUnique({ where: { code: 'IN' } });
        const advisoryCat = await prisma.category.findUnique({ where: { name: 'Advisories' } });
        if (!region || !advisoryCat) return;

        let added = 0;
        const links: { href: string; text: string }[] = [];

        $("a").each((_, el) => {
            const href = $(el).attr("href");
            const text = $(el).text().trim();
            if (href && (href.includes("pageid=PUBADV") || href.includes("pageid=PUBVL"))) {
                links.push({ href, text });
            }
        });

        for (const link of links) {
            if (added >= 15) break;
            const title = link.text;
            if (title.length < 10 || title.includes(">>")) continue;

            let urlPath = link.href;
            const artUrl = urlPath.startsWith('s') ? 'https://www.cert-in.org.in/' + urlPath : urlPath;
            const sourceUrl = (artUrl.startsWith('/') ? 'https://www.cert-in.org.in' + artUrl : artUrl).replace(/&amp;/g, '&');

            const exists = await prisma.article.findUnique({ where: { sourceUrl } });
            if (exists) continue;

            await prisma.article.create({
                data: {
                    title: `[CERT-In Official] ${title}`,
                    content: `Official technical advisory from the Computer Emergency Response Team (CERT-In). Access the official bulletin using the source link for mitigation instructions.`,
                    sourceUrl,
                    publishDate: new Date(),
                    regionId: region.id,
                    categoryId: advisoryCat.id
                }
            });
            added++;
        }
        console.log(`[Scheduler] Added ${added} official India (CERT-In) advisories.`);
    } catch (err) {
        console.error("[Scheduler] Error fetching CERT-In:", err);
    }
};

const fetchFeed = async (regionCode: string, categoryName: string, feedUrl: string) => {
    const key = `${regionCode}_${feedUrl}`;
    const now = Date.now();

    if (lastFetch[key] && now - lastFetch[key] < FETCH_INTERVAL_MS) {
        return;
    }

    lastFetch[key] = now;

    try {
        console.log(`[Scheduler] Fetching official feed: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);
        const region = await prisma.region.findUnique({ where: { code: regionCode } });
        if (!region) return;

        let category = await prisma.category.findUnique({ where: { name: categoryName } });
        if (!category) {
            category = await prisma.category.create({ data: { name: categoryName } });
        }

        let newCount = 0;
        for (const item of feed.items.slice(0, 10)) {
            if (!item.link || !item.title) continue;
            const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link } });
            if (exists) continue;

            // Prefix titles with [Official] if from gov
            const isGov = item.link.includes('.gov') || item.link.includes('.org.in');
            const displayTitle = isGov ? `[Official Output] ${item.title}` : item.title;

            await prisma.article.create({
                data: {
                    title: displayTitle,
                    content: item.contentSnippet || item.summary || item.title,
                    sourceUrl: item.link,
                    publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    regionId: region.id,
                    categoryId: category.id,
                },
            });
            newCount++;
        }
        console.log(`[Scheduler] Added ${newCount} articles from ${feedUrl}`);
    } catch (err) {
        console.error(`[Scheduler] Error fetching ${feedUrl}:`, err);
    }
};

// Helpline validation check — logs if contact field looks invalid
const validateHelplines = async () => {
    const helplines = await prisma.helpline.findMany();
    for (const h of helplines) {
        if (!h.contact || h.contact.trim().length < 3) {
            console.warn(`[Scheduler] Helpline "${h.name}" has potentially invalid contact: "${h.contact}"`);
            await prisma.updateLog.create({
                data: {
                    entityType: "Helpline",
                    entityId: h.id,
                    changes: JSON.stringify({ issue: "Invalid contact detected", contact: h.contact }),
                    helplineId: h.id,
                },
            });
        }
    }
};

/**
 * Start all scheduled cron jobs
 */
export const startScheduler = () => {
    console.log("[Scheduler] Starting background scheduler (Official Sources Only)...");

    cron.schedule("0 */6 * * *", async () => {
        console.log("[Scheduler] Running official region sync...");
        await fetchCERTIn(); // India Official
        for (const feed of RSS_FEEDS) {
            await fetchFeed(feed.regionCode, feed.categoryName, feed.feedUrl);
        }
    });

    cron.schedule("0 */12 * * *", async () => {
        await validateHelplines();
    });
};

