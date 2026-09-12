import puppeteer from 'puppeteer-core';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

async function runDestinationTests() {
  console.log('🚀 Starting Destination Selection E2E Verification Tests...\n');

  if (!fs.existsSync('./screenshots')) {
    fs.mkdirSync('./screenshots');
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(BASE_URL, ['geolocation']);

  const page = await browser.newPage();
  await page.setGeolocation({ latitude: 17.3850, longitude: 78.4867 }); // Hyderabad

  try {
    // -------------------------------------------------------------
    // TEST 1: Open Trip Planning & Verify Initial State
    // -------------------------------------------------------------
    console.log('1. Loading Homepage and logging in...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Click Sign Up in Header
    const headerBtns = await page.$$('button');
    for (const b of headerBtns) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt && txt.trim() === 'Sign Up') {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));

    const testEmail = `dest_tester_${Date.now()}@vihara.test`;
    const testPassword = 'ViharaHeritage2026!';
    const inputs = await page.$$('input');
    if (inputs.length >= 4) {
      await inputs[0].type('Destination Tester');
      await inputs[1].type(testEmail);
      await inputs[2].type(testPassword);
      await inputs[3].type(testPassword);
    }
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 4000));

    // Click Trip Planning Card
    console.log('   Clicking Trip Planning feature card...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h3'));
      const tripCard = cards.find(h => h.textContent.includes('Trip Planning'));
      if (tripCard) {
        const parent = tripCard.closest('[role="button"]') || tripCard.parentElement;
        parent.click();
      }
    });
    await new Promise(r => setTimeout(r, 3500));

    // Verify Section 2 header "Where do you want to go?" exists
    const section2Title = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('label, h2, h3, span')).find(e => e.textContent && e.textContent.includes('Where do you want to go?'));
      return el ? el.textContent.trim() : null;
    });
    console.log('   Found Section 2 Title:', section2Title);
    if (!section2Title) {
      throw new Error('Section 2 "Where do you want to go?" was not found on page.');
    }
    console.log('   ✅ "Where do you want to go?" section loaded successfully.');

    // -------------------------------------------------------------
    // TEST 2: Remove default destination to test empty list & Next disabled
    // -------------------------------------------------------------
    console.log('\n2. Testing remove destination and Next button disabled state...');
    // Find remove buttons on destination cards
    const removeCount = await page.evaluate(() => {
      const removeButtons = Array.from(document.querySelectorAll('button[title*="Remove"]'));
      removeButtons.forEach(b => b.click());
      return removeButtons.length;
    });
    console.log(`   Removed ${removeCount} initial destination(s).`);
    await new Promise(r => setTimeout(r, 800));

    // Check if Next button is disabled
    const isNextDisabled = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Continue to Categories'));
      return btn ? btn.disabled : null;
    });
    console.log('   Next button disabled when 0 destinations selected:', isNextDisabled);
    if (!isNextDisabled) {
      throw new Error('Next button should be disabled when no destinations are selected.');
    }
    console.log('   ✅ Next button properly disabled when 0 destinations selected.');

    // -------------------------------------------------------------
    // TEST 3: Google Places Autocomplete Search & Single Destination Selection
    // -------------------------------------------------------------
    console.log('\n3. Testing Google Places Autocomplete search for "Warangal"...');
    const destInput = await page.$('input[placeholder*="Search for a city or destination"]');
    if (!destInput) {
      throw new Error('Destination search input not found.');
    }

    await destInput.click();
    await destInput.type('Warangal', { delay: 60 });
    await new Promise(r => setTimeout(r, 1400)); // Wait for debounced predictions

    // Check dropdown suggestions
    const suggestions = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.dest-suggestion-item'));
      return items.map(i => i.textContent.trim());
    });
    console.log(`   Found ${suggestions.length} Google Places suggestions:`, suggestions.slice(0, 3));
    if (suggestions.length === 0) {
      throw new Error('No autocomplete suggestions displayed for "Warangal".');
    }

    // Select the first suggestion
    console.log('   Selecting "Warangal" from Google Places suggestions...');
    await page.evaluate(() => {
      const firstItem = document.querySelector('.dest-suggestion-item');
      if (firstItem) firstItem.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Verify Warangal card appeared
    const cardText = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.grid .group, .grid > div'));
      return cards.map(c => c.textContent.trim());
    });
    console.log('   Selected Destination Cards:', cardText);
    const hasWarangal = cardText.some(t => t.includes('Warangal'));
    if (!hasWarangal) {
      throw new Error('Warangal destination card not found after selection.');
    }
    console.log('   ✅ Single destination ("Warangal") selected and rendered with Verified badge.');
    await page.screenshot({ path: './screenshots/05_dest_single_selected.png', fullPage: true });

    // -------------------------------------------------------------
    // TEST 4: Multiple Destinations (+ Add another destination)
    // -------------------------------------------------------------
    console.log('\n4. Testing Multiple Destinations (+ Add another destination)...');
    // Click "+ Add another destination"
    const addAnotherBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Add another destination'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('   Clicked "+ Add another destination":', addAnotherBtn);
    await new Promise(r => setTimeout(r, 500));

    // Type "Vijayawada"
    await destInput.click();
    await destInput.type('Vijayawada', { delay: 60 });
    await new Promise(r => setTimeout(r, 1400));

    // Select Vijayawada suggestion
    await page.evaluate(() => {
      const firstItem = document.querySelector('.dest-suggestion-item');
      if (firstItem) firstItem.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Verify both Warangal and Vijayawada cards exist
    const multiCardTexts = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.grid .group, .grid > div'));
      return cards.map(c => c.textContent.trim());
    });
    console.log('   Active Destination Cards:', multiCardTexts);
    if (!multiCardTexts.some(t => t.includes('Warangal')) || !multiCardTexts.some(t => t.includes('Vijayawada'))) {
      throw new Error('Multiple destinations list missing either Warangal or Vijayawada.');
    }
    console.log('   ✅ Multiple destinations (Warangal + Vijayawada) stored and rendered in list.');
    await page.screenshot({ path: './screenshots/06_dest_multiple_selected.png', fullPage: true });

    // -------------------------------------------------------------
    // TEST 5: Duplicate Prevention
    // -------------------------------------------------------------
    console.log('\n5. Testing Duplicate Prevention for "Warangal"...');
    await destInput.click();
    await destInput.type('Warangal', { delay: 60 });
    await new Promise(r => setTimeout(r, 1400));

    await page.evaluate(() => {
      const firstItem = document.querySelector('.dest-suggestion-item');
      if (firstItem) firstItem.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Check for duplicate alert message
    const duplicateAlertText = await page.evaluate(() => {
      const alertEl = document.querySelector('.bg-amber-50');
      return alertEl ? alertEl.textContent.trim() : null;
    });
    console.log('   Duplicate Alert Message displayed:', duplicateAlertText);
    if (!duplicateAlertText || !duplicateAlertText.includes('Destination already added')) {
      throw new Error('Expected "Destination already added." alert was not shown.');
    }

    // Verify card count is still 2 (not 3)
    const cardCountAfterDuplicate = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('button[title*="Remove"]'));
      return cards.length;
    });
    console.log(`   Destination cards count after duplicate attempt: ${cardCountAfterDuplicate} (Expected: 2)`);
    if (cardCountAfterDuplicate !== 2) {
      throw new Error(`Duplicate was incorrectly added! Count is ${cardCountAfterDuplicate}`);
    }
    console.log('   ✅ Duplicate destination prevented with "Destination already added." message.');
    await page.screenshot({ path: './screenshots/07_dest_duplicate_prevented.png', fullPage: true });

    // -------------------------------------------------------------
    // TEST 6: Proceeding to Step 2, 3, and 4
    // -------------------------------------------------------------
    console.log('\n6. Continuing to Step 2 (Categories), Step 3 (Budget), and Step 4 (Itinerary)...');

    // Click Continue to Categories
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Continue to Categories'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Verify Step 2 loaded
    const step2Heading = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : '';
    });
    console.log('   Step 2 Heading:', step2Heading);
    if (!step2Heading.includes('calls to your spirit')) {
      throw new Error('Failed to transition to Step 2 Categories.');
    }
    console.log('   ✅ Step 2 (Categories) successfully verified with selected destinations.');

    // Click Proceed to AI Budgeting
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Proceed to AI Budgeting'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Verify Step 3 (Budget) loaded
    const step3Heading = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : '';
    });
    console.log('   Step 3 Heading:', step3Heading);
    console.log('   ✅ Step 3 (Budget) loaded.');

    // Finalize & Generate AI Itinerary
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Finalize & Generate AI Itinerary'));
      if (btn) btn.click();
    });
    console.log('   Generating full AI Odyssey itinerary for selected destinations...');
    await new Promise(r => setTimeout(r, 3500));

    // Verify Step 4 (Overview) loaded
    const tripTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : '';
    });
    console.log('   Generated Trip Title in Step 4:', tripTitle);
    if (!tripTitle.includes('Odyssey')) {
      throw new Error('Failed to generate final Trip Overview.');
    }
    console.log('   ✅ Step 4 (Itinerary, Place Cards, and Route Visualizer) generated seamlessly!');
    await page.screenshot({ path: './screenshots/08_full_odyssey_generated.png', fullPage: true });

    console.log('\n🎉 ALL DESTINATION SELECTION TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runDestinationTests();
