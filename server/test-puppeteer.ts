import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function runTest() {
    console.log("=== Testing India (CERT-In) VUL ===");
    const browser = await puppeteer.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.goto('https://www.cert-in.org.in/s2cMainServlet?pageid=VUL', { waitUntil: 'domcontentloaded', timeout: 60000 });
        const articles = await page.evaluate(() => {
            const results: any[] = [];
            document.querySelectorAll('a').forEach((a: HTMLAnchorElement) => {
                const text = a.textContent?.trim() || '';
                // Any link on the VUL page with substantial text
                if (text.length > 20) {
                    results.push({ title: text, link: a.href });
                }
            });
            return results;
        });
        console.log(`CERT-In VUL links found: ${articles.length}`);
        console.log("Example:", articles.slice(0, 5));
    } catch (e) { console.error("IN Error:", e); }

    await browser.close();
}

runTest();
