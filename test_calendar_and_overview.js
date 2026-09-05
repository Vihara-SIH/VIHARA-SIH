import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function testFullCalendarFlow() {
  console.log('Testing full flow with calendar range...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

  // 1. Load homepage
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  // 2. Open login modal & sign up user
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const login = btns.find(b => b.textContent.includes('Login'));
    if (login) login.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Switch to sign up
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signup = btns.find(b => b.textContent.trim() === 'Sign Up');
    if (signup) signup.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const inputs = await page.$$('input');
  if (inputs.length >= 4) {
    await inputs[0].type('Rohan Verma');
    await inputs[1].type(`traveler_${Date.now()}@vihara.test`);
    await inputs[2].type('Vihara2026!');
    await inputs[3].type('Vihara2026!');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 3500));
  }

  // 3. Click Trip Planning Action Card
  await page.evaluate(() => {
    const card = document.querySelector('.glass-btn');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // 4. In Step 1: Click Day 3 (Start Date), then click Day 8 (End Date)
  console.log('Selecting Calendar Start Day 3 and End Day 8...');
  await page.evaluate(() => {
    const dayCells = Array.from(document.querySelectorAll('.grid-cols-7 > div.cursor-pointer'));
    // Find cell with text '3' and cell with text '8'
    const day3 = dayCells.find(c => c.textContent.trim() === '3');
    const day8 = dayCells.find(c => c.textContent.trim() === '8');
    if (day3) day3.click();
    if (day8) day8.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: './screenshots/cal_01_range_selected.png' });
  console.log('Saved cal_01_range_selected.png');

  // 5. Click "Select Categories" button
  console.log('Proceeding to Step 2 Categories...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Select Categories'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/cal_02_step2_categories.png' });
  console.log('Saved cal_02_step2_categories.png');

  // 6. Click "Proceed to AI Budgeting"
  console.log('Proceeding to Step 3 Budgeting...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Proceed to AI Budgeting'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: './screenshots/cal_03_step3_budget.png' });
  console.log('Saved cal_03_step3_budget.png');

  // 7. Click "Finalize & Generate AI Itinerary"
  console.log('Generating Final AI Itinerary...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const genBtn = btns.find(b => b.textContent.includes('Finalize & Generate AI Itinerary') || b.textContent.includes('Finalize My Plan'));
    if (genBtn) genBtn.click();
  });
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: './screenshots/cal_04_detailed_itinerary.png' });
  console.log('Saved cal_04_detailed_itinerary.png');

  // 8. Place Cards Tab (P5)
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const pTab = tabs.find(t => t.textContent.includes('Place Cards'));
    if (pTab) pTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './screenshots/cal_05_place_cards.png' });
  console.log('Saved cal_05_place_cards.png');

  // 9. Routes & Map Tab (P6)
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('nav button'));
    const rTab = tabs.find(t => t.textContent.includes('Routes & Map'));
    if (rTab) rTab.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: './screenshots/cal_06_routes_map.png' });
  console.log('Saved cal_06_routes_map.png');

  await browser.close();
  console.log('All end-to-end steps completed!');
}

testFullCalendarFlow().catch(console.error);
