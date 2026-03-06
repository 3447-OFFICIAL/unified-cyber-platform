const cheerio = require("cheerio");

async function testHKCERT() {
    console.log("\n--- Testing HKCERT ---");
    try {
        const response = await fetch("https://www.hkcert.org/security-bulletin", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const articles = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/security-bulletin/') && !href.includes('page=')) {
                articles.push({
                    title: $(el).text().trim(),
                    link: href.startsWith('http') ? href : `https://www.hkcert.org${href}`
                });
            }
        });
        // filter unique and empty
        const unique = [];
        const seen = new Set();
        articles.forEach(a => {
            if (a.title && !seen.has(a.link) && a.title.length > 10) {
                seen.add(a.link);
                unique.push(a);
            }
        });
        console.log(unique.slice(0, 4));
    } catch (e) {
        console.error("HKCERT Error:", e.message);
    }
}

async function testRIA() {
    console.log("\n--- Testing RIA Estonia ---");
    try {
        const response = await fetch("https://www.ria.ee/en/news", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const articles = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('/en/news/')) {
                articles.push({
                    title: $(el).text().trim(),
                    link: href.startsWith('http') ? href : `https://www.ria.ee${href}`
                });
            }
        });
        // filter unique and empty
        const unique = [];
        const seen = new Set();
        articles.forEach(a => {
            if (a.title && !seen.has(a.link) && a.title.length > 5) {
                seen.add(a.link);
                unique.push(a);
            }
        });
        console.log(unique.slice(0, 4));
    } catch (e) {
        console.error("RIA Error:", e.message);
    }
}

async function run() {
    await testHKCERT();
    await testRIA();
}

run();
