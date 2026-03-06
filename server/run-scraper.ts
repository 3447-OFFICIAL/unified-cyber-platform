import { startScheduler } from "./src/services/scheduler.service";
import Parser from "rss-parser";
import { prisma } from "./src/services/prisma.service";
import * as cheerio from "cheerio";

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
});

async function fetchCISA() {
    console.log("Fetching USA (CISA Official Feed)...");
    const usRegion = await prisma.region.findUnique({ where: { code: 'US' } });
    if (!usRegion) return;
    const advisoryCat = await prisma.category.findUnique({ where: { name: 'Advisories' } });
    try {
        const feed = await parser.parseURL("https://www.cisa.gov/cybersecurity-advisories/all.xml");
        let added = 0;
        for (const item of feed.items.slice(0, 10)) {
            const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link! } });
            if (exists) continue;
            await prisma.article.create({
                data: {
                    title: `[CISA Official] ${item.title}`,
                    content: (item.contentSnippet || item.summary || "").substring(0, 1000),
                    sourceUrl: item.link!,
                    publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    regionId: usRegion.id,
                    categoryId: advisoryCat!.id
                }
            });
            added++;
        }
        console.log(`Saved ${added} new official US advisories.`);
    } catch (e: any) { console.error("US Error:", e.message); }
}

async function fetchCERTBund() {
    console.log("Fetching Germany (CERT-Bund Official Feed)...");
    const deRegion = await prisma.region.findUnique({ where: { code: 'DE' } });
    if (!deRegion) return;
    const advisoryCat = await prisma.category.findUnique({ where: { name: 'Advisories' } });
    try {
        const feed = await parser.parseURL("https://wid.cert-bund.de/content/public/securityAdvisory/rss");
        let added = 0;
        for (const item of feed.items.slice(0, 10)) {
            const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link! } });
            if (exists) continue;
            await prisma.article.create({
                data: {
                    title: `[CERT-Bund Official] ${item.title}`,
                    content: (item.contentSnippet || item.summary || "").substring(0, 1000),
                    sourceUrl: item.link!,
                    publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    regionId: deRegion.id,
                    categoryId: advisoryCat!.id
                }
            });
            added++;
        }
        console.log(`Saved ${added} new official DE advisories.`);
    } catch (e: any) { console.error("DE Error:", e.message); }
}

async function fetchNCSC() {
    console.log("Fetching UK (NCSC Official Feed)...");
    const gbRegion = await prisma.region.findUnique({ where: { code: 'GB' } });
    if (!gbRegion) return;
    const advisoryCat = await prisma.category.findUnique({ where: { name: 'Advisories' } });
    try {
        const feed = await parser.parseURL("https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml");
        let added = 0;
        for (const item of feed.items.slice(0, 10)) {
            const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link! } });
            if (exists) continue;
            await prisma.article.create({
                data: {
                    title: `[NCSC Official] ${item.title}`,
                    content: (item.contentSnippet || item.summary || "").substring(0, 1000),
                    sourceUrl: item.link!,
                    publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    regionId: gbRegion.id,
                    categoryId: advisoryCat!.id
                }
            });
            added++;
        }
        console.log(`Saved ${added} new official GB advisories.`);
    } catch (e: any) { console.error("GB Error:", e.message); }
}

async function fetchCERTIn() {
    console.log("Fetching India (CERT-In) Official Advisories via Cheerio...");
    try {
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
        const links: any[] = [];

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
                    content: `Official technical advisory from the Indian Computer Emergency Response Team (CERT-In). Access official documentation for mitigation steps.`,
                    sourceUrl,
                    publishDate: new Date(),
                    regionId: region.id,
                    categoryId: advisoryCat.id
                }
            });
            added++;
        }
        console.log(`Saved ${added} official India (CERT-In) advisories.`);
    } catch (e: any) { console.error("IN Error:", e.message); }
}

async function fetchHKCERT() {
    console.log("Fetching Hong Kong (HKCERT) Official Advisories via Cheerio...");
    try {
        const response = await fetch("https://www.hkcert.org/security-bulletin", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const region = await prisma.region.findUnique({ where: { code: 'HK' } });
        const advisoryCat = await prisma.category.findUnique({ where: { name: 'Advisories' } });
        if (!region || !advisoryCat) return;

        let added = 0;
        const links: any[] = [];
        const seen = new Set();

        $("a").each((_, el) => {
            const href = $(el).attr("href");
            let text = $(el).text().trim().replace(/\s+/g, ' ');
            if (href && href.includes("/security-bulletin/") && !href.includes("page=") && text.length > 10) {
                if (!seen.has(href)) {
                    seen.add(href);
                    links.push({ href, text });
                }
            }
        });

        for (const link of links) {
            if (added >= 10) break;
            const sourceUrl = link.href.startsWith('http') ? link.href : `https://www.hkcert.org${link.href}`;
            const exists = await prisma.article.findUnique({ where: { sourceUrl } });
            if (exists) continue;

            await prisma.article.create({
                data: {
                    title: `[HKCERT Official] ${link.text.substring(0, 150)}`,
                    content: `Official technical advisory from the Hong Kong Computer Emergency Response Team (HKCERT).`,
                    sourceUrl,
                    publishDate: new Date(),
                    regionId: region.id,
                    categoryId: advisoryCat.id
                }
            });
            added++;
        }
        console.log(`Saved ${added} official HK advisories.`);
    } catch (e: any) { console.error("HK Error:", e.message); }
}

async function runNow() {
    console.log("Starting full manual sync for Official Government sources...");
    await fetchCERTIn(); // India
    await fetchCISA();   // USA
    await fetchCERTBund(); // Germany
    await fetchNCSC();    // UK
    await fetchHKCERT();  // Hong Kong
    console.log("Full sync complete.");
}

runNow()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
