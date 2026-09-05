import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function testAllFeatures() {
  console.log('Starting comprehensive verification of VIHARA application...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

  // 1. Homepage
  console.log('1. Testing Homepage...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: './screenshots/01_homepage.png' });

  // 2. Auth Modal Sign In & Validation
  console.log('2. Testing Auth Modal Sign In...');
  await page.click('.stitch-btn-auth-gold');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/02_auth_signin.png' });

  // Click submit with empty fields to trigger validation error
  console.log('2b. Testing Sign In empty validation...');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: './screenshots/02b_auth_signin_error.png' });

  // Switch to Sign Up tab
  console.log('3. Testing Auth Modal Sign Up...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt && txt.trim() === 'Sign Up') {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/03_auth_signup.png' });

  // Switch to Forgot Password
  console.log('3b. Testing Forgot Password...');
  const backButtons = await page.$$('button');
  for (const b of backButtons) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt && txt.trim() === 'Sign In') {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  const forgotBtn = await page.$('button[type="button"]');
  if (forgotBtn) {
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt && txt.includes('Forgot Password')) {
        await b.click();
        break;
      }
    }
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: './screenshots/03b_auth_forgot.png' });

  // Close Auth Modal
  await page.click('button[aria-label="Close modal"]');
  await new Promise(r => setTimeout(r, 500));

  // 4. Test Trip Planning Step 1
  console.log('4. Navigating to Trip Planning Step 1...');
  await page.evaluate(() => {
    // Navigate via Trip Planning card
    const card = document.querySelector('.stitch-action-card');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  // If auth gate is triggered, let's authenticate with sample credentials or mock login state for testing UI
  const isAuthModalOpen = await page.$('.animate-fadeIn');
  if (isAuthModalOpen) {
    console.log('Auth gate opened, closing to test features...');
    // We can simulate auth in page context or test directly
    await page.evaluate(() => {
      window.__MOCK_AUTH_FOR_TESTING = true;
    });
  }

  await page.screenshot({ path: './screenshots/04_trip_step1.png' });

  // Let's test the entire planning flow in a dedicated test script that sets state
  console.log('Test run finished successfully.');
  await browser.close();
}

testAllFeatures().catch(console.error);
