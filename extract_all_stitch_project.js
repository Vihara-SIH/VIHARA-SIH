import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function extractAllStitch() {
  console.log('Fetching exact Stitch project screens and DOM for 16569011295196178417...');
  
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  
  const interceptedUrls = [];
  const interceptedResponses = [];

  page.on('response', async (response) => {
    const url = response.url();
    interceptedUrls.push(url);
    if (url.includes('contribution.usercontent.google.com') || url.includes('download') || url.includes('preview') || url.includes('screens') || url.includes('html_')) {
      try {
        const text = await response.text();
        interceptedResponses.push({ url, text });
        console.log('Captured response from:', url, 'Length:', text.length);
      } catch (e) {}
    }
  });

  try {
    await page.goto('https://stitch.withgoogle.com/preview/16569011295196178417?pli=1', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
  } catch (err) {
    console.log('Navigation warning:', err.message);
  }

  await new Promise(r => setTimeout(r, 8000));

  // Inspect all frames
  const frames = page.frames();
  console.log(`Found ${frames.length} frames.`);

  if (!fs.existsSync('./extracted_stitch_raw')) {
    fs.mkdirSync('./extracted_stitch_raw');
  }

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const frameUrl = frame.url();
    console.log(`Frame ${i}: ${frameUrl}`);
    try {
      const content = await frame.content();
      fs.writeFileSync(`./extracted_stitch_raw/frame_${i}.html`, content);
      console.log(`Saved frame_${i}.html (${content.length} bytes)`);

      // Search for screen selectors or links inside this frame
      const screenLinks = await frame.evaluate(() => {
        const links = [];
        document.querySelectorAll('a, button, [data-screen-id], [data-node-id], iframe').forEach(el => {
          links.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            text: el.innerText ? el.innerText.slice(0, 50) : '',
            href: el.href || el.getAttribute('data-url') || el.src || ''
          });
        });
        return links;
      });
      fs.writeFileSync(`./extracted_stitch_raw/frame_${i}_elements.json`, JSON.stringify(screenLinks, null, 2));
    } catch (e) {
      console.error(`Error in frame ${i}:`, e.message);
    }
  }

  fs.writeFileSync('./extracted_stitch_raw/intercepted_responses.json', JSON.stringify(interceptedResponses, null, 2));
  fs.writeFileSync('./extracted_stitch_raw/all_urls.json', JSON.stringify(interceptedUrls, null, 2));

  await page.screenshot({ path: './extracted_stitch_raw/page_screenshot.png' });
  await browser.close();
  console.log('Extraction finished!');
}

extractAllStitch().catch(console.error);
