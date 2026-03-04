import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
    console.log("Renaming categories to match the new 2-section requirement...");

    // 1. Rename 'Cyber Security News' to 'Cyber News' if it exists
    const oldNews = await prisma.category.findFirst({ where: { name: 'Cyber Security News' } });
    if (oldNews) {
        await prisma.category.update({
            where: { id: oldNews.id },
            data: { name: 'Cyber News' }
        });
        console.log("Renamed 'Cyber Security News' to 'Cyber News'.");
    } else {
        // Create it if it doesn't exist
        await prisma.category.upsert({
            where: { name: 'Cyber News' },
            update: {},
            create: { name: 'Cyber News' }
        });
        console.log("Ensured 'Cyber News' category exists.");
    }

    // 2. Ensure 'Advisories' exists
    await prisma.category.upsert({
        where: { name: 'Advisories' },
        update: {},
        create: { name: 'Advisories' }
    });
    console.log("Ensured 'Advisories' category exists.");

    // 3. Optional: Delete other categories if you want it to be STRICTLY 2 sections
    // But better to just reassign existing articles to one of these two.
    const newsCat = await prisma.category.findFirst({ where: { name: 'Cyber News' } });
    const advisoryCat = await prisma.category.findFirst({ where: { name: 'Advisories' } });

    if (newsCat && advisoryCat) {
        // Reassign 'Cybercrime Cases' and 'Educational' to 'Cyber News'
        const miscCats = await prisma.category.findMany({
            where: {
                NOT: [
                    { name: 'Cyber News' },
                    { name: 'Advisories' }
                ]
            }
        });

        for (const cat of miscCats) {
            console.log(`Reassigning articles from '${cat.name}' to 'Cyber News'...`);
            await prisma.article.updateMany({
                where: { categoryId: cat.id },
                data: { categoryId: newsCat.id }
            });
            // Optionally delete the old category
            await prisma.category.delete({ where: { id: cat.id } });
        }
    }

    console.log("Category migration complete!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
