import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create Regions
    const india = await prisma.region.upsert({
        where: { code: "IN" },
        update: {},
        create: { name: "India", code: "IN" },
    });
    const usa = await prisma.region.upsert({
        where: { code: "US" },
        update: {},
        create: { name: "USA", code: "US" },
    });
    const germany = await prisma.region.upsert({
        where: { code: "DE" },
        update: {},
        create: { name: "Germany", code: "DE" },
    });
    const uk = await prisma.region.upsert({
        where: { code: "GB" },
        update: {},
        create: { name: "United Kingdom", code: "GB" },
    });

    // Create Categories
    const categoriesData = ["Cybercrime Cases", "Advisories", "Educational"];
    const categories: Record<string, any> = {};
    for (const name of categoriesData) {
        categories[name] = await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }

    // Seed Helplines - India
    await prisma.helpline.upsert({
        where: { id: "helpline-india-1" },
        update: {},
        create: {
            id: "helpline-india-1",
            name: "National Cyber Crime Helpline",
            purpose: "Report cybercrime incidents, financial fraud, and online abuse",
            contact: "1930",
            availability: "24/7",
            regionId: india.id,
        },
    });
    await prisma.helpline.upsert({
        where: { id: "helpline-india-2" },
        update: {},
        create: {
            id: "helpline-india-2",
            name: "CERT-In Helpline",
            purpose: "Report cyber security vulnerabilities and incidents",
            contact: "1800-11-4949",
            availability: "Mon–Fri, 9am–6pm IST",
            regionId: india.id,
        },
    });
    await prisma.helpline.upsert({
        where: { id: "helpline-india-3" },
        update: {},
        create: {
            id: "helpline-india-3",
            name: "Women Helpline (Online Harassment)",
            purpose: "Online harassment, cyberstalking, and threats against women",
            contact: "181",
            availability: "24/7",
            regionId: india.id,
        },
    });

    // Seed Helplines - USA
    await prisma.helpline.upsert({
        where: { id: "helpline-usa-1" },
        update: {},
        create: {
            id: "helpline-usa-1",
            name: "FBI Cyber Division",
            purpose: "Federal cybercrime investigations and reporting",
            contact: "1-800-CALL-FBI (1-800-225-5324)",
            availability: "24/7",
            regionId: usa.id,
        },
    });
    await prisma.helpline.upsert({
        where: { id: "helpline-usa-2" },
        update: {},
        create: {
            id: "helpline-usa-2",
            name: "FTC Consumer Protection",
            purpose: "Identity theft, scams, and consumer fraud",
            contact: "1-877-382-4357",
            availability: "Mon–Fri, 9am–5pm ET",
            regionId: usa.id,
        },
    });
    const usaPortals = [
        {
            id: "portal-us-1",
            crimeType: "Internet Crime / Online Fraud",
            portalName: "IC3 - Internet Crime Complaint Center",
            description: "FBI's portal for reporting internet-facilitated crimes",
            officialUrl: "https://www.ic3.gov",
            regionId: usa.id,
        },
        {
            id: "portal-us-2",
            crimeType: "Identity Theft",
            portalName: "FTC Identity Theft Portal",
            description: "Report identity theft and get a recovery plan",
            officialUrl: "https://www.identitytheft.gov",
            regionId: usa.id,
        },
        {
            id: "portal-us-3",
            crimeType: "Phishing / Email Scam",
            portalName: "US-CERT / CISA",
            description: "Report phishing and cybersecurity incidents to CISA",
            officialUrl: "https://www.cisa.gov/report",
            regionId: usa.id,
        },
        {
            id: "portal-us-4",
            crimeType: "Online Scam / Consumer Fraud",
            portalName: "FTC ReportFraud",
            description: "Report scams, fraud, and bad business practices to the FTC",
            officialUrl: "https://reportfraud.ftc.gov",
            regionId: usa.id,
        },
    ];

    for (const p of usaPortals) {
        await prisma.cyberPortal.upsert({ where: { id: p.id }, update: {}, create: p });
    }

    // Seed Helplines - Germany
    await prisma.helpline.upsert({
        where: { id: "helpline-de-1" },
        update: {},
        create: {
            id: "helpline-de-1",
            name: "BSI Cyber Security Helpline",
            purpose: "Federal office for information security reporting",
            contact: "+49 800 274 1000",
            availability: "Mon-Fri, 8am-6pm",
            regionId: germany.id,
        },
    });

    // Seed Portals - Germany
    const germanyPortals = [
        {
            id: "portal-de-1",
            crimeType: "Online Fraud / Cybercrime",
            portalName: "BSI Incident Reporting",
            description: "Report IT security incidents and cybercrime in Germany",
            officialUrl: "https://www.bsi.bund.de",
            regionId: germany.id,
        }
    ];
    for (const p of germanyPortals) {
        await prisma.cyberPortal.upsert({ where: { id: p.id }, update: {}, create: p });
    }

    // Seed Helplines - United Kingdom
    await prisma.helpline.upsert({
        where: { id: "helpline-uk-1" },
        update: {},
        create: {
            id: "helpline-uk-1",
            name: "Action Fraud",
            purpose: "National Fraud & Cyber Crime Reporting Centre",
            contact: "0300 123 2040",
            availability: "24/7",
            regionId: uk.id,
        },
    });

    // Seed Portals - United Kingdom
    const ukPortals = [
        {
            id: "portal-uk-1",
            crimeType: "Cybercrime / Fraud",
            portalName: "Action Fraud Reporting Tool",
            description: "Report fraud and cybercrime directly to the UK police",
            officialUrl: "https://www.actionfraud.police.uk",
            regionId: uk.id,
        }
    ];
    for (const p of ukPortals) {
        await prisma.cyberPortal.upsert({ where: { id: p.id }, update: {}, create: p });
    }

    // Seed Portals - India
    const indiaPortals = [
        {
            id: "portal-in-1",
            crimeType: "Online Financial Fraud",
            portalName: "National Cybercrime Reporting Portal",
            description: "Report cyber crimes, financial fraud, and social media crimes",
            officialUrl: "https://cybercrime.gov.in",
            regionId: india.id,
        },
        {
            id: "portal-in-2",
            crimeType: "Phishing / Email Scam",
            portalName: "CERT-In Incident Reporting",
            description: "Report phishing, malware, and security vulnerabilities to India's CERT",
            officialUrl: "https://www.cert-in.org.in",
            regionId: india.id,
        },
        {
            id: "portal-in-3",
            crimeType: "Social Media Abuse / Online Harassment",
            portalName: "National Cybercrime Reporting Portal",
            description: "Report online harassment, cyberbullying, and morphed images",
            officialUrl: "https://cybercrime.gov.in/Webform/crime_selectCrimeType.aspx",
            regionId: india.id,
        },
        {
            id: "portal-in-4",
            crimeType: "UPI / Banking Fraud",
            portalName: "RBI Ombudsman - Banking Fraud",
            description: "Report unauthorized UPI transactions and banking fraud",
            officialUrl: "https://rbi.org.in/",
            regionId: india.id,
        },
    ];

    for (const p of indiaPortals) {
        await prisma.cyberPortal.upsert({ where: { id: p.id }, update: {}, create: p });
    }


    // Seed Sample Articles
    const sampleArticles = [
        {
            id: "article-in-1",
            title: "CERT-In Issues Advisory on Ransomware Attacks Targeting Indian Organizations",
            content: "CERT-In has issued a high-severity advisory warning Indian organizations about a surge in ransomware attacks. Organizations are urged to implement offline backups, patch systems, and enable multi-factor authentication immediately.",
            sourceUrl: "https://www.cert-in.org.in/s2cMainServlet?pageid=PUBVLNOTES01&VLCODE=CIAD-2024-0001",
            regionId: india.id,
            categoryId: categories["Advisories"].id,
        },
        {
            id: "article-in-2",
            title: "India Sees 65% Rise in UPI Fraud Cases in 2024",
            content: "According to NPCI data, UPI-related fraud cases rose by 65% in 2024. Victims lost an average of ₹18,000 per incident. Citizens are advised to never share OTPs and to verify payee names before transactions.",
            sourceUrl: "https://cybercrime.gov.in/news/upi-fraud-2024",
            regionId: india.id,
            categoryId: categories["Cybercrime Cases"].id,
        },
        {
            id: "article-in-3",
            title: "How to Protect Yourself from Phishing Attacks: A Complete Guide",
            content: "Phishing remains the most common cybercrime vector. This guide covers: spotting fake URLs, avoiding suspicious email attachments, reporting to CERT-In, and using 2FA on all accounts.",
            sourceUrl: "https://cybercrime.gov.in/awareness/phishing-guide",
            regionId: india.id,
            categoryId: categories["Educational"].id,
        },
        {
            id: "article-us-1",
            title: "CISA Alert: Critical Vulnerability in Banking Software Exploited in the Wild",
            content: "CISA has added a critical remote code execution vulnerability (CVE-2024-XXXX) affecting major banking software to its Known Exploited Vulnerabilities catalog. Federal agencies must patch by January 2025.",
            sourceUrl: "https://www.cisa.gov/uscert/ncas/alerts/aa24-001",
            regionId: usa.id,
            categoryId: categories["Advisories"].id,
        },
        {
            id: "article-us-2",
            title: "FBI Reports $12.5 Billion in Cybercrime Losses in 2023",
            content: "The FBI's Internet Crime Complaint Center (IC3) recorded $12.5 billion in losses from cybercrime in 2023. Investment fraud and BEC schemes topped the list. Victims can file complaints at ic3.gov.",
            sourceUrl: "https://www.ic3.gov/annual-report-2023",
            regionId: usa.id,
            categoryId: categories["Cybercrime Cases"].id,
        },
        {
            id: "article-de-1",
            title: "BSI Warns of Targeted Phishing Attacks on German Businesses",
            content: "The Federal Office for Information Security (BSI) has issued a warning regarding a new wave of sophisticated phishing attacks targeting German SMEs. Attackers are using localized AI-generated emails.",
            sourceUrl: "https://www.bsi.bund.de/phishing-alert-2024",
            regionId: germany.id,
            categoryId: categories["Advisories"].id,
        },
        {
            id: "article-uk-1",
            title: "NCSC Issues Alert Over State-Sponsored Phishing Campaigns",
            content: "The National Cyber Security Centre (NCSC) has warned UK organizations about a sophisticated, state-sponsored spear-phishing campaign aiming to harvest credentials from government contractors.",
            sourceUrl: "https://www.ncsc.gov.uk/news/spear-phishing-alert",
            regionId: uk.id,
            categoryId: categories["Advisories"].id,
        },
    ];

    for (const a of sampleArticles) {
        await prisma.article.upsert({ where: { sourceUrl: a.sourceUrl }, update: {}, create: a });
    }

    console.log("✅ Database seeded successfully!");
    console.log(`   Regions: India, USA, Germany, United Kingdom`);
    console.log(`   Helplines: 7 (3 India, 2 USA, 1 Germany, 1 UK)`);
    console.log(`   Portals: 10 (4 India, 4 USA, 1 Germany, 1 UK)`);
    console.log(`   Articles: ${sampleArticles.length}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
