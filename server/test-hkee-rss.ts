import Parser from 'rss-parser';

const parser = new Parser();

async function testFeeds() {
    const feeds = [
        { name: "HKCERT Security Bulletin", url: "https://www.hkcert.org/rss/security-bulletin" },
        { name: "RIA Estonia English News", url: "https://www.ria.ee/en/news.rss" },
        { name: "RIA Estonia Estonian News", url: "https://www.ria.ee/rss.xml" },
        { name: "CERT.ee", url: "https://cert.ee/rss.xml" }
    ];

    for (const feed of feeds) {
        console.log(`\nTesting ${feed.name}: ${feed.url}`);
        try {
            const feedData = await parser.parseURL(feed.url);
            console.log(`✅ Success! Found ${feedData.items.length} items.`);
            if (feedData.items.length > 0) {
                console.log(`Sample: ${feedData.items[0].title}`);
                console.log(`Link: ${feedData.items[0].link}`);
            }
        } catch (error: any) {
            console.log(`❌ Failed: ${error.message}`);
        }
    }
}

testFeeds();
