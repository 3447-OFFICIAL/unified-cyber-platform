import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { PrismaClient } from "@prisma/client";
import Parser from "rss-parser";

puppeteer.use(StealthPlugin());
const prisma = new PrismaClient();
const parser = new Parser();

async function run() {
    console.log("Fetching Estonia (RIA Blog via Puppeteer XML string parse)...");
    const eeRegion = await prisma.region.findUnique({ where: { code: 'EE' } });
    const advisoryCat = await prisma.category.upsert({
        where: { name: 'Advisories' },
        update: {}, create: { name: 'Advisories' }
    });

    const browser = await puppeteer.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.goto('https://blog.ria.ee/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const xmlContent = await page.evaluate(() => {
            // Get XML tree content or innerText if it loaded as text
            return document.documentElement.outerHTML || document.body.innerText;
        });

        // Strip HTML tags if Chrome wrapped it in a viewer, leaving only XML
        const cleanXml = xmlContent.substring(xmlContent.indexOf('<rss'), xmlContent.indexOf('</rss>') + 6);

        if (cleanXml.length > 50) {
            const feed = await parser.parseString(cleanXml);
            let addedEe = 0;
            for (const item of feed.items) {
                await prisma.article.create({
                    data: {
                        title: item.title?.replace("CISA Adds", "[CISA Govt Alert] Adds") || "RIA Advisory",
                        content: (item.contentSnippet || item.summary || item.title || "").substring(0, 1500),
                        sourceUrl: item.link || "https://blog.ria.ee",
                        publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                        regionId: eeRegion!.id,
                        categoryId: advisoryCat.id
                    }
                });
                addedEe++;
            }
            console.log(`Saved ${addedEe} official EE advisories.`);
        } else {
            console.log("Failed to clean XML. Dump:", xmlContent.substring(0, 200));
        }

    } catch (e: any) { console.error("EE Error:", e.message); }

    await browser.close();
    await prisma.$disconnect();
}

run();
