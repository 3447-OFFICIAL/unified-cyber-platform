import Parser from "rss-parser";

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
});

async function testScrape() {
    const url = "https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml";
    console.log("Fetching", url);
    try {
        const feed = await parser.parseURL(url);
        console.log(`Successfully fetched feed! Found ${feed.items.length} items`);
        if (feed.items.length > 0) {
            console.log("First item:", feed.items[0].title);
            console.log("Link:", feed.items[0].link);
        }
    } catch (e) {
        console.error("Error fetching feed:", e);
    }
}

testScrape();
