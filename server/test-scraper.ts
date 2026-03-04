import axios from 'axios';
import * as cheerio from 'cheerio';

async function testEstoniaScrape() {
    try {
        console.log("Fetching Estonia RIA news...");
        const response = await axios.get('https://www.ria.ee/en/news', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        const $ = cheerio.load(response.data);
        const articles = [];

        // Find article links. This selector might need adjustment after seeing the HTML.
        $('.news-list .news-item, article, .views-row').each((i, el) => {
            if (i >= 5) return;
            const titleEl = $(el).find('h2, h3, .title').first();
            const linkEl = titleEl.find('a').length ? titleEl.find('a') : $(el).find('a').first();
            let link = linkEl.attr('href');
            if (link && link.startsWith('/')) {
                link = 'https://www.ria.ee' + link;
            }
            const title = titleEl.text().trim() || linkEl.text().trim();
            const summary = $(el).find('p, .summary, .content').first().text().trim();

            if (title && link) {
                articles.push({ title, link, summary });
            }
        });

        console.log("Estonia Articles:", articles);
    } catch (e) {
        console.error("Estonia Scrape Error:", e.message);
    }
}

async function testGermanyScrape() {
    try {
        console.log("\nFetching Germany BSI news...");
        const response = await axios.get('https://www.bsi.bund.de/DE/Service-Navi/Presse/Pressemitteilungen/pressemitteilungen_node.html', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        });

        const $ = cheerio.load(response.data);
        const articles = [];

        $('.c-teaser, .teaser, article').each((i, el) => {
            if (i >= 5) return;
            const titleEl = $(el).find('h2, h3, .c-teaser__headline').first();
            const linkEl = titleEl.find('a').length ? titleEl.find('a') : $(el).find('a').first();
            let link = linkEl.attr('href');
            if (link && !link.startsWith('http')) {
                link = 'https://www.bsi.bund.de/' + (link.startsWith('/') ? link.substring(1) : link);
            }
            const title = titleEl.text().trim();
            const summary = $(el).find('p, .c-teaser__text').first().text().trim();

            if (title && link) {
                articles.push({ title, link, summary });
            }
        });

        console.log("Germany Articles:", articles);
    } catch (e) {
        console.error("Germany Scrape Error:", e.message);
    }
}

async function run() {
    await testEstoniaScrape();
    await testGermanyScrape();
}

run();
