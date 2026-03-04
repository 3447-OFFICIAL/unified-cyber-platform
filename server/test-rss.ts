import Parser from "rss-parser";

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
});

async function run() {
    const feeds = [
        "https://www.cisa.gov/cybersecurity-advisories/all.xml",
        "https://wid.cert-bund.de/content/public/securityAdvisory/rss",
        "https://blog.ria.ee/feed/"
    ];
    for (const feed of feeds) {
        try {
            console.log("Fetching:", feed);
            const parsed = await parser.parseURL(feed);
            console.log(`Success! Found ${parsed.items.length} items.`);
            console.log(parsed.items[0].title);
        } catch (e) {
            console.error("Failed:", feed, e.message);
        }
    }
}

run();
