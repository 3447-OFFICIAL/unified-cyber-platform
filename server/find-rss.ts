import axios from 'axios';
import * as cheerio from 'cheerio';

async function findRss(url: string) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            }
        });
        const $ = cheerio.load(response.data);
        const links = $('link[type="application/rss+xml"]');
        console.log(`\nResults for ${url}:`);
        if (links.length === 0) {
            console.log('No RSS links found.');
        } else {
            links.each((i, el) => {
                console.log(`- ${$(el).attr('title')}: ${$(el).attr('href')}`);
            });
        }
    } catch (e: any) {
        console.log(`Failed for ${url}: ${e.message}`);
    }
}

async function run() {
    await findRss('https://www.hkcert.org/');
    await findRss('https://www.hkcert.org/security-bulletin');
    await findRss('https://www.ria.ee/en');
    await findRss('https://www.ria.ee/en/cyber-security');
    await findRss('https://cert.ee');
}

run();
