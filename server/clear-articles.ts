import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning up dummy articles...");
    await prisma.article.deleteMany({});
    console.log("All articles cleared.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
