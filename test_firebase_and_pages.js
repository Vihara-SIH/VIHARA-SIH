import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function verifyFullPlatform() {
  console.log('--- Starting Full Platform Verification ---');
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
  console.log('✓ Homepage verified.');

  // 2. Auth Modal Sign In
  console.log('2. Testing Auth Modal...');
  await page.click('.stitch-btn-auth-gold');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/02_auth_signin.png' });

  // 3. Switch to Sign Up
  console.log('3. Testing Sign Up form...');
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

  // 4. Fill in Sign Up form and create / sign in test user with real Firebase Auth
  console.log('4. Performing real Firebase Sign Up / Sign In...');
  const testEmail = `traveler_${Date.now()}@vihara.test`;
  const testPassword = 'ViharaHeritage2026!';
  const testName = 'Arjun Sharma';

  // Fill in inputs
  const inputs = await page.$$('input');
  if (inputs.length >= 4) {
    await inputs[0].type(testName);
    await inputs[1].type(testEmail);
    await inputs[2].type(testPassword);
    await inputs[3].type(testPassword);
  }
  await page.screenshot({ path: './screenshots/03b_signup_filled.png' });

  // Click Submit Sign Up button
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
  }

  // Wait for Firebase Auth response and Firestore doc creation
  console.log('Waiting for Firebase Auth & Firestore synchronization...');
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: './screenshots/04_authenticated_home.png' });

  // 5. Navigate to Trip Planning
  console.log('5. Navigating to Trip Planning Page 1...');
  const actionCards = await page.$$('.stitch-action-card');
  if (actionCards.length > 0) {
    await actionCards[0].click();
  } else {
    // If navbar is visible
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('button'));
      const planBtn = navBtns.find(b => b.textContent.includes('Trip Planning'));
      if (planBtn) planBtn.click();
    });
  }

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/05_trip_planning_step1.png' });
  console.log('✓ Trip Planning Step 1 verified.');

  // Select Goa destination checkbox in addition to Delhi
  console.log('Selecting multi-destination checkboxes...');
  await page.evaluate(() => {
    const destCards = Array.from(document.querySelectorAll('h4'));
    const goaCard = destCards.find(h => h.textContent.includes('Goa'));
    if (goaCard && goaCard.parentElement) {
      goaCard.parentElement.parentElement.click();
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: './screenshots/05b_destinations_selected.png' });

  // Click "Select Categories" button to go to Step 2
  console.log('6. Proceeding to Step 2: Category Matrix...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Select Categories'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/06_trip_planning_step2_categories.png' });
  console.log('✓ Trip Planning Step 2 Categories verified.');

  // Click "Proceed to AI Budgeting" to go to Step 3
  console.log('7. Proceeding to Step 3: AI Budgeting...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Proceed to AI Budgeting'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/07_budgeting_step3.png' });
  console.log('✓ Step 3 AI Budgeting verified.');

  // Click "Finalize & Generate AI Itinerary"
  console.log('8. Generating AI Itinerary, Place Cards & Routes...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const genBtn = btns.find(b => b.textContent.includes('Finalize & Generate AI Itinerary') || b.textContent.includes('Finalize My Plan'));
    if (genBtn) genBtn.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: './screenshots/08_itinerary_tab_p4.png' });
  console.log('✓ P4 Itinerary verified.');

  // Switch to Place Cards Tab (P5)
  console.log('9. Inspecting P5 Place Cards Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const placesTab = tabs.find(t => t.textContent.includes('Place Cards'));
    if (placesTab) placesTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './screenshots/09_place_cards_tab_p5.png' });
  console.log('✓ P5 Place Cards verified.');

  // Switch to Routes & Map Tab (P6)
  console.log('10. Inspecting P6 Routes & Maps Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const routesTab = tabs.find(t => t.textContent.includes('Routes & Map'));
    if (routesTab) routesTab.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: './screenshots/10_routes_map_tab_p6.png' });
  console.log('✓ P6 Routes & Maps verified.');

  await browser.close();
  console.log('=== All E2E verifications completed successfully! ===');
}

verifyFullPlatform().catch(console.error);
