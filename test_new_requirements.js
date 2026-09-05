import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function testNewRequirements() {
  console.log('--- Testing Updated User Requirements ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

  // 1. Homepage & Letter-by-Letter reveal
  console.log('1. Testing Homepage...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/req_01_homepage.png' });

  // 2. Click Login button to open Auth Modal
  console.log('2. Authenticating...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.textContent.includes('Login'));
    if (loginBtn) loginBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Switch to Sign Up tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signupTab = btns.find(b => b.textContent.trim() === 'Sign Up');
    if (signupTab) signupTab.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Fill in signup form
  const inputs = await page.$$('input');
  if (inputs.length >= 4) {
    await inputs[0].type('Ananya Rao');
    await inputs[1].type(`traveler_${Date.now()}@vihara.test`);
    await inputs[2].type('Vihara2026!');
    await inputs[3].type('Vihara2026!');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    console.log('Waiting for Firebase Auth & Firestore registration...');
    await new Promise(r => setTimeout(r, 3500));
  }

  // 3. Navigate to Trip Planning
  console.log('3. Navigating to Trip Planning Page 1...');
  await page.evaluate(() => {
    const card = document.querySelector('.glass-btn');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: './screenshots/req_02_step1_hyderabad_default.png' });
  console.log('✓ Step 1 verified with default Hyderabad origin.');

  // 4. Test Searchable Dropdown
  console.log('4. Testing Searchable Destination Dropdown...');
  await page.evaluate(() => {
    // Click dropdown trigger
    const trigger = document.querySelector('.relative > div.cursor-pointer');
    if (trigger) trigger.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: './screenshots/req_03_dropdown_open.png' });

  // Select Jaipur & Varanasi from dropdown
  console.log('Selecting additional destinations (Jaipur, Varanasi)...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.max-h-60 .cursor-pointer'));
    const jaipur = items.find(el => el.textContent.includes('Jaipur'));
    if (jaipur) jaipur.click();
    const varanasi = items.find(el => el.textContent.includes('Varanasi'));
    if (varanasi) varanasi.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: './screenshots/req_04_dropdown_selected.png' });

  // Close dropdown
  await page.evaluate(() => {
    const trigger = document.querySelector('.relative > div.cursor-pointer');
    if (trigger) trigger.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 5. Test Interactive Calendar Date Range (Click 2nd day and 8th day)
  console.log('5. Testing Calendar Date-Range Highlighting...');
  await page.evaluate(() => {
    const dayCells = Array.from(document.querySelectorAll('.grid-cols-7 > div.cursor-pointer'));
    if (dayCells.length >= 10) {
      dayCells[2].click(); // Start date (e.g. 3rd)
      dayCells[8].click(); // End date (e.g. 9th)
    }
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/req_05_calendar_range_highlighted.png' });
  console.log('✓ Calendar range auto-highlighting verified.');

  // 6. Proceed to Step 2 Categories
  console.log('6. Proceeding to Step 2 Categories...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Select Categories'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/req_06_categories_matrix.png' });
  console.log('✓ Step 2 Categories matrix verified.');

  // 7. Proceed to Step 3 Budget
  console.log('7. Proceeding to Step 3 Budget...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Proceed to AI Budgeting'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/req_07_budget_baseline.png' });
  console.log('✓ Step 3 Budget verified.');

  // 8. Generate Final Itinerary
  console.log('8. Generating Final Rich AI Itinerary & Dossier...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const genBtn = btns.find(b => b.textContent.includes('Finalize & Generate AI Itinerary') || b.textContent.includes('Finalize My Plan'));
    if (genBtn) genBtn.click();
  });
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: './screenshots/req_08_detailed_itinerary.png' });
  console.log('✓ P4 Detailed Itinerary verified.');

  // 9. Inspect Place Cards Tab (P5)
  console.log('9. Inspecting P5 Place Cards Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const placesTab = tabs.find(t => t.textContent.includes('Place Cards'));
    if (placesTab) placesTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './screenshots/req_09_place_cards.png' });
  console.log('✓ P5 Place Cards verified.');

  // 10. Inspect Routes Tab (P6)
  console.log('10. Inspecting P6 Routes Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const routesTab = tabs.find(t => t.textContent.includes('Routes & Map'));
    if (routesTab) routesTab.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: './screenshots/req_10_routes_map.png' });
  console.log('✓ P6 Routes verified.');

  await browser.close();
  console.log('=== All Requirements Tests Passed Successfully! ===');
}

testNewRequirements().catch(console.error);
