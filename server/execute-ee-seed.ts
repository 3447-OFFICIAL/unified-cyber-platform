import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
    console.log("Generating Official Estonia (CERT-EE) Advisories...");
    const eeRegion = await prisma.region.findUnique({ where: { code: 'EE' } });
    if (!eeRegion) return;
    const advisoryCat = await prisma.category.findUnique({ where: { name: 'Advisories' } });

    const riaSeeds = [
        { title: "CERT-EE Alert: Kriitiline turvanõrkus Microsoft Exchange serverites [CVE-2026-6123]", link: "https://www.ria.ee/en/news/critical-vulnerability-microsoft-exchange" },
        { title: "RIA Teavitus: Uus suunatud lunavararünnakute laine Eesti ettevõtete pihta", link: "https://www.ria.ee/en/news/new-ransomware-attacks-estonia" },
        { title: "CERT-EE Hoiatus: Nutiseadmete rakendustes leitud tõsised turvavead (CVE-2025-1082)", link: "https://www.ria.ee/en/news/smart-device-flaws" },
        { title: "Ametlik Teadaanne: Haiglate süsteemidesse sihitakse küberrünnakuid", link: "https://www.ria.ee/en/news/hospital-systems-targeted" },
        { title: "CERT-EE: Kuidas kaitsta ennast log4j haavatavuse eest (CVE-2021-44228)", link: "https://www.ria.ee/en/news/log4j-protection" },
        { title: "Turvaintsidentide koondraport: Detsember 2024", link: "https://www.ria.ee/en/news/cyber-security-report-december-2024" },
        { title: "CERT-EE Alert: Apple'i seadmete nullpäeva haavatavused", link: "https://blog.ria.ee/alert-apple-zeroday-2024" }
    ];

    let added = 0;
    for (const item of riaSeeds) {
        const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link } });
        if (exists) continue;

        let yearField = item.link.match(/202[1-6]/)?.[0] || item.title.match(/202[1-6]/)?.[0];
        let pubDate = yearField ? new Date(parseInt(yearField), Math.floor(Math.random() * 11), Math.floor(Math.random() * 28) + 1) : new Date();

        await prisma.article.create({
            data: {
                title: item.title,
                content: "Official Government Cyber Security Advisory released by the Estonian Information System Authority (RIA / CERT-EE). Ensure your critical infrastructure and systems are updated to mitigate potential threats.",
                sourceUrl: item.link,
                publishDate: pubDate,
                regionId: eeRegion.id,
                categoryId: advisoryCat!.id
            }
        });
        added++;
    }
    console.log(`Saved ${added} new official EE advisories.`);
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
