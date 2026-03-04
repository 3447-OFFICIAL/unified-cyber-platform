import { PrismaClient } from "@prisma/client";
import Parser from "rss-parser";

const prisma = new PrismaClient();
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
});

async function main() {
    const url = "https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml";
    console.log("Fetching", url);
    const feed = await parser.parseURL(url);

    const region = await prisma.region.findUnique({ where: { code: "GB" } });
    if (!region) {
        console.log("GB region not found!");
        return;
    }

    let category = await prisma.category.findUnique({ where: { name: "Advisories" } });
    if (!category) {
        category = await prisma.category.create({ data: { name: "Advisories" } });
    }

    let added = 0;
    for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link } });
        if (!exists) {
            await prisma.article.create({
                data: {
                    title: item.title,
                    content: (item.contentSnippet || item.summary || item.title).substring(0, 1000),
                    sourceUrl: item.link,
                    publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                    regionId: region.id,
                    categoryId: category.id,
                }
            });
            added++;
        }
    }
    console.log(`Added ${added} UK Advisories to DB!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
