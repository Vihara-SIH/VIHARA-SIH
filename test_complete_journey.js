import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function testCompleteJourney() {
  console.log('Testing complete VIHARA journey (P1 -> P6)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

  // 1. Homepage
  console.log('1. Homepage...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: './screenshots/01_homepage.png' });

  // 2. Auth Modal
  console.log('2. Auth Modal...');
  await page.click('.stitch-btn-auth-gold');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/02_auth_signin.png' });

  // Click Sign Up tab
  const btns = await page.$$('button');
  for (const b of btns) {
    const t = await page.evaluate(el => el.textContent, b);
    if (t && t.trim() === 'Sign Up') {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/03_auth_signup.png' });

  // Let's now sign in as an authenticated user or trigger navigation to test Trip Planning
  console.log('3. Entering Trip Planning...');
  await page.evaluate(() => {
    // Dispatch auth state or trigger view directly for testing visual rendering
    window.location.hash = '#trip-planning';
  });

  // Let's render the Trip Planning view by clicking or setting view
  await page.evaluate(() => {
    // Close modal
    const closeBtn = document.querySelector('button[aria-label="Close modal"]');
    if (closeBtn) closeBtn.click();
  });

  await new Promise(r => setTimeout(r, 500));
  await browser.close();
}

testCompleteJourney().catch(console.error);
