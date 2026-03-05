import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Platform Database Health...");

    const regions = await prisma.region.findMany({
        include: { _count: { select: { articles: true } } }
    });

    console.log("\nArticle Counts by Region:");
    for (const r of regions) {
        console.log(`- ${r.name} (${r.code}): ${r._count.articles} articles`);
        if (r.code === 'IN') {
            const samples = await prisma.article.findMany({
                where: { regionId: r.id },
                take: 3,
                orderBy: { publishDate: 'desc' }
            });
            samples.forEach(s => console.log(`  > [SAMPLE] ${s.title}`));
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
