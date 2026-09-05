import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function extract() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://stitch.withgoogle.com/preview/7408015761037757338?node-id=431f247c944d4e19b4b00790635bf189', {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  await new Promise(r => setTimeout(r, 5000));

  for (let frame of page.frames()) {
    const html = await frame.content();
    if (html.includes('One stop destination') || html.includes('Trip Planning')) {
      console.log('Found Stitch content in frame:', frame.url());
      fs.writeFileSync('stitch_exact.html', html);
      break;
    }
  }

  await browser.close();
  console.log('Extraction complete!');
}

extract().catch(console.error);
