async function findRss(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });
        const html = await response.text();
        const matches = [...html.matchAll(/<link[^>]*rel="alternate"[^>]*type="application\/(rss\+xml|atom\+xml)"[^>]*href="([^"]+)"/gi)];

        console.log(`\nResults for ${url}:`);
        if (matches.length === 0) {
            console.log('No RSS links found.');
        } else {
            matches.forEach(m => {
                console.log(`- Found: ${m[2]}`);
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
    await findRss('https://cert.ee');
}

run();
