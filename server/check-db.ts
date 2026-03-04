import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const cats = await prisma.category.findMany({
        include: {
            _count: {
                select: { articles: true }
            }
        }
    });

    console.log("Categories in DB:");
    for (const c of cats) {
        console.log(`- ${c.name} (${c._count.articles} articles)`);
    }

    const ukArticles = await prisma.article.findMany({
        where: { region: { code: 'GB' } },
        include: { category: true }
    });

    console.log(`\nUK Articles: ${ukArticles.length}`);
    const ukCats = new Set(ukArticles.map(a => a.category?.name));
    console.log(`UK Categories: ${Array.from(ukCats).join(', ')}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
