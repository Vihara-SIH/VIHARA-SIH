import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function testSlideshow() {
  console.log('Testing Homepage Slideshow transition...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/slide_0.png' });
  console.log('Saved slide_0.png (Golden Temple)');

  // Click Next Slide button
  console.log('Clicking Next Slide...');
  const nextBtn = await page.$('.stitch-slideshow-controls button:last-child');
  if (nextBtn) {
    await nextBtn.click();
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: './screenshots/slide_1.png' });
    console.log('Saved slide_1.png (Hawa Mahal)');

    await nextBtn.click();
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: './screenshots/slide_2.png' });
    console.log('Saved slide_2.png (Munnar)');
  }

  await browser.close();
  console.log('Slideshow test finished.');
}

testSlideshow().catch(console.error);
