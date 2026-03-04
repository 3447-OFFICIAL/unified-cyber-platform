import { startScheduler } from "./src/services/scheduler.service";
import Parser from "rss-parser";
import { prisma } from "./src/services/prisma.service";

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
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
        for (const item of feed.items) {
            const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link! } });
            if (exists) continue;

            await prisma.article.create({
                data: {
                    title: item.title?.replace("CISA Adds", "[CISA Govt Alert] Adds") || "US Govt Advisory",
                    content: (item.contentSnippet || item.summary || "").substring(0, 1500),
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
        for (const item of feed.items.slice(0, 30)) {
            const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link! } });
            if (exists) continue;

            await prisma.article.create({
                data: {
                    title: item.title || "CERT-Bund Advisory",
                    content: (item.contentSnippet || item.summary || "").substring(0, 1500),
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

async function runNow() {
    console.log("Starting manual scraper for Official Government sources...");
    await fetchCISA();
    await fetchCERTBund();
    console.log("Scraping complete.");
}

runNow()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
