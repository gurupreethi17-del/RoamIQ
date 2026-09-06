const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer test run...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') console.error(`[BROWSER ERROR] ${msg.text()}`);
    });

    page.on('pageerror', err => {
        console.error(`[CRITICAL EXCEPTION] ${err.message}`);
        console.error(err.stack);
    });

    try {
        await page.goto('http://127.0.0.1:3000/plan', { waitUntil: 'networkidle0' });

        await page.type('input[placeholder*="Where do you want to go"]', 'Visakhapatnam', { delay: 50 });
        await page.waitForSelector('.glass-panel ul li', { timeout: 10000 });
        await page.click('.glass-panel ul li:first-child');

        console.log("Selected Visakhapatnam from autocomplete");

        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const genBtn = btns.find(b => b.textContent && b.textContent.includes('Generate Smart Itinerary') && b.offsetParent !== null);
            if (genBtn) {
                console.log("Found visible button", genBtn);
                genBtn.click();
            } else {
                console.log("NO VISIBLE BUTTON FOUND!");
            }
        });

        // Wait to see if /trip loads or error happens
        await new Promise(r => setTimeout(r, 6000));

        // Grab whatever text is inside the body
        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log("BODY TEXT EXTRACT:");
        console.log("==================");
        console.log(bodyText);
        console.log("==================");

    } catch (err) {
        console.error("Puppeteer Script Error:", err);
    } finally {
        await browser.close();
    }
})();
