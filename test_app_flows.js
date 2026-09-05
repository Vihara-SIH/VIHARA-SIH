import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function runTests() {
  console.log('Launching Chrome for fast E2E screenshot tests...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

  // 1. Homepage
  console.log('Navigating to homepage...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: './screenshots/01_homepage.png' });
  console.log('Screenshot 01_homepage.png taken.');

  // 2. Open Auth Modal
  console.log('Clicking Login button...');
  await page.click('.stitch-btn-auth-gold');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './screenshots/02_auth_signin.png' });
  console.log('Screenshot 02_auth_signin.png taken.');

  // Switch to Sign Up tab
  console.log('Switching to Sign Up tab...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt && txt.includes('Sign Up') && !txt.includes('Create')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/03_auth_signup.png' });
  console.log('Screenshot 03_auth_signup.png taken.');

  // Close modal
  await page.click('button[aria-label="Close modal"]');
  await new Promise(r => setTimeout(r, 500));

  // Let's test the UI views directly by setting React state or testing the planning flow
  // In App.jsx, we can test TripPlanning by triggering it
  console.log('Triggering Trip Planning...');
  await page.evaluate(() => {
    // Click trip planning card
    const card = document.querySelector('.stitch-action-card');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './screenshots/04_trip_planning_step1.png' });
  console.log('Screenshot 04_trip_planning_step1.png taken.');

  await browser.close();
  console.log('Done test run!');
}

runTests().catch(console.error);
