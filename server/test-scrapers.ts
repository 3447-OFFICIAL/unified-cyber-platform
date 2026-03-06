import * as cheerio from "cheerio";

async function testHKCERT() {
    console.log("\n--- Testing HKCERT ---");
    try {
        const response = await fetch("https://www.hkcert.org/security-bulletin", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const articles = [];
        $('.list-item').each((i, el) => {
            if (i > 3) return; // limit to 4
            const titleEl = $(el).find('.title a, h3 a');
            const title = titleEl.text().trim() || $(el).find('a').first().text().trim();
            const link = titleEl.attr('href') || $(el).find('a').first().attr('href');

            if (title && link) {
                articles.push({
                    title,
                    link: link.startsWith('http') ? link : `https://www.hkcert.org${link}`
                });
            }
        });
        console.log(articles);
    } catch (e: any) {
        console.error("HKCERT Error:", e.message);
    }
}

async function testRIA() {
    console.log("\n--- Testing RIA Estonia ---");
    try {
        const response = await fetch("https://www.ria.ee/en/news", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const articles = [];
        $('.news-list .news-item, .views-row').each((i, el) => {
            if (i > 3) return;
            const titleEl = $(el).find('h3 a, .title a, a');
            const title = titleEl.text().trim();
            const link = titleEl.attr('href');

            if (title && link) {
                articles.push({
                    title,
                    link: link.startsWith('http') ? link : `https://www.ria.ee${link}`
                });
            }
        });
        console.log(articles);
    } catch (e: any) {
        console.error("RIA Error:", e.message);
    }
}

async function run() {
    await testHKCERT();
    await testRIA();
}

run();
