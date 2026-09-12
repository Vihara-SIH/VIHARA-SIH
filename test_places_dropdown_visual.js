import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function testPlacesDropdown() {
  console.log('Testing Google Places dropdown visual...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Sign in
  const headerBtns = await page.$$('button');
  for (const b of headerBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt && txt.trim() === 'Sign Up') {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  const inputs = await page.$$('input');
  if (inputs.length >= 4) {
    await inputs[0].type('Dropdown Test');
    await inputs[1].type(`places_tester_${Date.now()}@vihara.test`);
    await inputs[2].type('ViharaTest2026!');
    await inputs[3].type('ViharaTest2026!');
  }
  const submit = await page.$('button[type="submit"]');
  if (submit) await submit.click();
  await new Promise(r => setTimeout(r, 4000));

  // Open Trip Planning
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('h3'));
    const tripCard = cards.find(h => h.textContent.includes('Trip Planning'));
    if (tripCard) tripCard.closest('[role="button"]').click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Click Enter Manually
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const manualBtn = btns.find(b => b.textContent.includes('Enter Manually'));
    if (manualBtn) manualBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Type "Jaipur"
  const searchInput = await page.$('input[placeholder*="Search city"]');
  if (searchInput) {
    await searchInput.type('Jaipur');
  }
  // Wait for dropdown to populate
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: './screenshots/02_places_autocomplete_dropdown.png' });
  console.log('✓ Saved: ./screenshots/02_places_autocomplete_dropdown.png');

  // Click first suggestion
  const firstItem = await page.$('.group.cursor-pointer');
  if (firstItem) {
    await firstItem.click();
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: './screenshots/03_places_selected_state.png' });
    console.log('✓ Saved: ./screenshots/03_places_selected_state.png');
  }

  await browser.close();
  console.log('Done dropdown test!');
}

testPlacesDropdown().catch(console.error);
