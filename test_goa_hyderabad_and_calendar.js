import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function testGoaHyderabadFlow() {
  console.log('--- Testing Goa to Hyderabad Itinerary & Calendar ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

  // 1. Open App & Authenticate
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

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
    await inputs[0].type('Vikram Singhania');
    await inputs[1].type(`traveler_${Date.now()}@vihara.test`);
    await inputs[2].type('Vihara2026!');
    await inputs[3].type('Vihara2026!');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 3500));
  }

  // 2. Click Trip Planning Action Card
  await page.evaluate(() => {
    const card = document.querySelector('.glass-btn');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // 3. Select Goa and Hyderabad in Destination Dropdown (Order: Goa, Hyderabad)
  console.log('Ensuring Goa & Hyderabad are selected...');
  await page.evaluate(() => {
    const trigger = document.querySelector('.relative > div.cursor-pointer');
    if (trigger) trigger.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.max-h-60 .cursor-pointer'));
    const goa = items.find(el => el.textContent.includes('Goa'));
    const hyd = items.find(el => el.textContent.includes('Hyderabad'));
    const isGoaChecked = goa?.querySelector('.bg-\\[\\#0d1c32\\]');
    const isHydChecked = hyd?.querySelector('.bg-\\[\\#0d1c32\\]');
    if (!isGoaChecked && goa) goa.click();
    if (!isHydChecked && hyd) hyd.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Close dropdown
  await page.evaluate(() => {
    const trigger = document.querySelector('.relative > div.cursor-pointer');
    if (trigger) trigger.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 4. Test Calendar Date Selection: Click Day 5, wait 400ms, then click Day 10 (6 Days total)
  console.log('1st click: Start Date Day 5...');
  await page.evaluate(() => {
    const dayCells = Array.from(document.querySelectorAll('.grid-cols-7 > div.cursor-pointer'));
    const day5 = dayCells.find(c => c.textContent.trim() === '5');
    if (day5) day5.click();
  });
  await new Promise(r => setTimeout(r, 400));

  console.log('2nd click: End Date Day 10...');
  await page.evaluate(() => {
    const dayCells = Array.from(document.querySelectorAll('.grid-cols-7 > div.cursor-pointer'));
    const day10 = dayCells.find(c => c.textContent.trim() === '10');
    if (day10) day10.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/goa_hyd_01_calendar_highlight.png' });
  console.log('Saved goa_hyd_01_calendar_highlight.png');

  // 5. Advance to Categories
  console.log('Advancing to Categories...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Select Categories'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // 6. Advance to Budget
  console.log('Advancing to Budget...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Proceed to AI Budgeting'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // 7. Generate Itinerary
  console.log('Generating AI Itinerary with Goa & Hyderabad (6 Days)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const genBtn = btns.find(b => b.textContent.includes('Finalize & Generate AI Itinerary') || b.textContent.includes('Finalize My Plan'));
    if (genBtn) genBtn.click();
  });
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: './screenshots/goa_hyd_02_itinerary_both_cities.png' });
  console.log('Saved goa_hyd_02_itinerary_both_cities.png');

  // 8. Place Cards Tab (P5)
  console.log('Inspecting Place Cards...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const placesTab = tabs.find(t => t.textContent.includes('Place Cards'));
    if (placesTab) placesTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './screenshots/goa_hyd_03_place_cards.png' });
  console.log('Saved goa_hyd_03_place_cards.png');

  // 9. Open Standalone PDF Modal
  console.log('Opening Standalone PDF Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pdfBtn = btns.find(b => b.textContent.includes('Open PDF Itinerary'));
    if (pdfBtn) pdfBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/goa_hyd_04_standalone_pdf_modal.png' });
  console.log('Saved goa_hyd_04_standalone_pdf_modal.png');

  await browser.close();
  console.log('=== Goa to Hyderabad Verification Finished! ===');
}

testGoaHyderabadFlow().catch(console.error);
