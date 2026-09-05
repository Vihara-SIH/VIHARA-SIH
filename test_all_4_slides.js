import puppeteer from 'puppeteer-core';

async function testAllSlides() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './screenshots/exact_slide1_amritsar.png' });

  // Click Next for slide 2
  await page.click('#next-slide');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/exact_slide2_jaipur.png' });

  // Click Next for slide 3
  await page.click('#next-slide');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/exact_slide3_munnar.png' });

  // Click Next for slide 4
  await page.click('#next-slide');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/exact_slide4_himalayas.png' });

  await browser.close();
  console.log('Captured all 4 exact slides.');
}

testAllSlides().catch(console.error);
