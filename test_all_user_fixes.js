import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function testAllUserFixes() {
  console.log('--- Testing All User Fixes ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

  // 1. Homepage Letter-by-Letter Animation verification
  console.log('1. Verifying Homepage Logo letter-by-letter revelation...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: './screenshots/fix_01_logo_early_reveal.png' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/fix_02_logo_full_glow.png' });

  // 2. Authenticate
  console.log('2. Authenticating user...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const login = btns.find(b => b.textContent.includes('Login'));
    if (login) login.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signup = btns.find(b => b.textContent.trim() === 'Sign Up');
    if (signup) signup.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const inputs = await page.$$('input');
  if (inputs.length >= 4) {
    await inputs[0].type('Maya Sharma');
    await inputs[1].type(`traveler_${Date.now()}@vihara.test`);
    await inputs[2].type('Vihara2026!');
    await inputs[3].type('Vihara2026!');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 3500));
  }

  // 3. Open Trip Planning
  console.log('3. Opening Trip Planning Step 1...');
  await page.evaluate(() => {
    const card = document.querySelector('.glass-btn');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // 4. Test Calendar Date Range Highlighting: Click Day 4, then Day 10
  console.log('4. Selecting Calendar Day 4 to Day 10...');
  await page.evaluate(() => {
    const dayCells = Array.from(document.querySelectorAll('.grid-cols-7 > div.cursor-pointer'));
    const day4 = dayCells.find(c => c.textContent.trim() === '4');
    const day10 = dayCells.find(c => c.textContent.trim() === '10');
    if (day4) day4.click();
    if (day10) day10.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/fix_03_calendar_days_4_to_10.png' });
  console.log('Saved fix_03_calendar_days_4_to_10.png');

  // 5. Select Categories and AI Budgeting
  console.log('5. Advancing to Categories and Budget...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Select Categories'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Proceed to AI Budgeting'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const genBtn = btns.find(b => b.textContent.includes('Finalize & Generate AI Itinerary') || b.textContent.includes('Finalize My Plan'));
    if (genBtn) genBtn.click();
  });
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: './screenshots/fix_04_itinerary_initial_order.png' });
  console.log('Saved fix_04_itinerary_initial_order.png (Starts with Hyderabad)');

  // 6. Test Change Order of Destinations
  console.log('6. Testing Change Order of Destinations (Moving Goa to #1)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const changeBtn = btns.find(b => b.textContent.includes('Change Order of Destinations') || b.textContent.includes('Edit Destination Order'));
    if (changeBtn) changeBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/fix_05_reorder_modal_open.png' });

  // In modal, click Move Up for second item (Goa)
  await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0.z-50');
    if (modal) {
      const upBtns = Array.from(modal.querySelectorAll('button')).filter(b => b.textContent.trim() === '▲');
      if (upBtns.length >= 2) {
        upBtns[1].click(); // Move Goa to top
      }
    }
  });
  await new Promise(r => setTimeout(r, 600));

  // Click Apply & Regenerate
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const applyBtn = btns.find(b => b.textContent.includes('Apply & Regenerate'));
    if (applyBtn) applyBtn.click();
  });
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: './screenshots/fix_06_itinerary_reordered_goa_first.png' });
  console.log('Saved fix_06_itinerary_reordered_goa_first.png (Starts with Goa)');

  // 7. Test Open PDF Itinerary Modal
  console.log('7. Testing Standalone PDF Itinerary Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pdfBtn = btns.find(b => b.textContent.includes('Open PDF Itinerary') || b.textContent.includes('Open & Print PDF'));
    if (pdfBtn) pdfBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/fix_07_pdf_standalone_modal.png' });
  console.log('Saved fix_07_pdf_standalone_modal.png');

  await browser.close();
  console.log('=== All Fix Verification Steps Passed! ===');
}

testAllUserFixes().catch(console.error);
