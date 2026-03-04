import { PrismaClient } from "@prisma/client";
import Parser from "rss-parser";

const prisma = new PrismaClient();
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
});

const feeds = [
    { code: "IN", url: "https://feeds.feedburner.com/TheHackersNews" },
    { code: "US", url: "https://www.cisa.gov/uscert/ncas/alerts.xml" },
    { code: "DE", url: "https://wid.cert-bund.de/content/public/securityAdvisory/rss" },
    { code: "GB", url: "https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml" }
];

async function main() {
    let category = await prisma.category.findUnique({ where: { name: "Advisories" } });
    if (!category) {
        category = await prisma.category.create({ data: { name: "Advisories" } });
    }

    for (const feed of feeds) {
        console.log(`Fetching [${feed.code}] from ${feed.url}`);
        try {
            const parsed = await parser.parseURL(feed.url);
            const region = await prisma.region.findUnique({ where: { code: feed.code } });

            if (!region) {
                console.log(`Region ${feed.code} not found in DB, skipping.`);
                continue;
            }

            let added = 0;
            // Limit to max 20 to avoid overwhelming the UI initially
            for (const item of parsed.items.slice(0, 20)) {
                if (!item.link || !item.title) continue;

                const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link } });
                if (!exists) {
                    await prisma.article.create({
                        data: {
                            title: item.title,
                            content: String(item.contentSnippet || item.summary || item.title).substring(0, 1000),
                            sourceUrl: item.link,
                            publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                            regionId: region.id,
                            categoryId: category.id,
                        }
                    });
                    added++;
                }
            }
            console.log(`-> Added ${added} new advisories for ${feed.code}`);
        } catch (err: any) {
            console.error(`-> Error fetching ${feed.code}: ${err.message}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
