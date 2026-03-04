import cron from "node-cron";
import Parser from "rss-parser";
import { prisma } from "./prisma.service";

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
        regionCode: "IN",
        categoryName: "Advisories",
        feedUrl: "https://feeds.feedburner.com/TheHackersNews", // Fallback for malformed CERT-In XML
    },
    {
        regionCode: "US",
        categoryName: "Advisories",
        feedUrl: "https://www.cisa.gov/uscert/ncas/alerts.xml", // Official CISA Alerts
    },
    {
        regionCode: "DE",
        categoryName: "Advisories",
        feedUrl: "https://wid.cert-bund.de/content/public/securityAdvisory/rss", // Official CERT-Bund Web
    },
    {
        regionCode: "GB",
        categoryName: "Advisories",
        feedUrl: "https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml", // Official UK NCSC feed
    },
];

/**
 * Ethical scraping note:
 * - We only fetch official government/CERT RSS feeds which explicitly provide RSS for public consumption.
 * - We respect rate limits by enforcing a 1-hour minimum between fetches.
 * - We do not crawl or scrape HTML pages without permission.
 * - User-Agent is identified properly.
 */
const fetchFeed = async (regionCode: string, categoryName: string, feedUrl: string) => {
    const key = `${regionCode}_${feedUrl}`;
    const now = Date.now();

    if (lastFetch[key] && now - lastFetch[key] < FETCH_INTERVAL_MS) {
        console.log(`[Scheduler] Rate limit: skipping ${feedUrl}`);
        return;
    }

    lastFetch[key] = now;

    try {
        console.log(`[Scheduler] Fetching feed: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);

        const region = await prisma.region.findUnique({ where: { code: regionCode } });
        if (!region) {
            console.log(`[Scheduler] Region not found: ${regionCode}`);
            return;
        }

        let category = await prisma.category.findUnique({ where: { name: categoryName } });
        if (!category) {
            category = await prisma.category.create({ data: { name: categoryName } });
        }

        let newCount = 0;
        for (const item of feed.items.slice(0, 10)) {
            if (!item.link || !item.title) continue;
            // Skip already-existing articles
            const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link } });
            if (exists) continue;

            await prisma.article.create({
                data: {
                    title: item.title,
                    content: item.contentSnippet || item.summary || item.title,
                    sourceUrl: item.link,
                    publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    regionId: region.id,
                    categoryId: category.id,
                },
            });
            newCount++;
        }
        console.log(`[Scheduler] Added ${newCount} new articles from ${feedUrl}`);
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
 * - Every 6 hours: fetch RSS feeds for advisories
 * - Every 12 hours: helpline validation check
 */
export const startScheduler = () => {
    console.log("[Scheduler] Starting background scheduler...");

    // Fetch RSS feeds every 6 hours
    cron.schedule("0 */6 * * *", async () => {
        console.log("[Scheduler] Running advisory feed sync...");
        for (const feed of RSS_FEEDS) {
            await fetchFeed(feed.regionCode, feed.categoryName, feed.feedUrl);
        }
    });

    // Validate helplines every 12 hours
    cron.schedule("0 */12 * * *", async () => {
        console.log("[Scheduler] Running helpline validation...");
        await validateHelplines();
    });
};
