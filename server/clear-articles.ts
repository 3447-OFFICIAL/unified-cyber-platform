import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Purging all non-government tactical data...");

    // Delete all articles from Hacker News specifically
    const hnDeleted = await prisma.article.deleteMany({
        where: {
            sourceUrl: { contains: "thehackernews.com" }
        }
    });
    console.log(`Removed ${hnDeleted.count} articles from thehackernews.com`);

    // Delete any remaining legacy data that doesn't follow official naming conventions
    const legacyDeleted = await prisma.article.deleteMany({
        where: {
            NOT: [
                { title: { contains: "[CERT-In Official]" } },
                { title: { contains: "[Official Output]" } },
                { title: { contains: "[CISA Official]" } },
                { title: { contains: "[CERT-Bund Official]" } },
                { title: { contains: "[NCSC Official]" } }
            ]
        }
    });
    console.log(`Removed ${legacyDeleted.count} remaining legacy/unverified articles.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
