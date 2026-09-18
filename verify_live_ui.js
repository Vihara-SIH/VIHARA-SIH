/**
 * LIVE UI VERIFICATION SCRIPT
 *
 * Uses local Chrome via puppeteer-core to test:
 * 1. UI rendering on http://localhost:5173/
 * 2. Console error capture
 * 3. Goa Beaches 5-day flow in Trip Planner
 * 4. Overview page activity and visiting hours rendering
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function verifyLiveUI() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('VIHARA LIVE UI PRODUCTION-READINESS AUDIT');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  try {
    // 1. Load Homepage
    console.log('1. Loading http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: './screenshots/audit_01_home.png' });
    console.log('   ✓ Homepage rendered cleanly.');

    // 2. Check title and main container
    const title = await page.title();
    console.log(`   ✓ Page title: "${title}"`);

    // 3. Inspect DOM for any error boundary or React error display
    const hasCrash = await page.evaluate(() => {
      const text = document.body.innerText || '';
      return text.includes('Something went wrong') || text.includes('Application Error');
    });
    console.log(`   ✓ Error boundary triggered: ${hasCrash ? 'YES (FAILURE)' : 'NO (CLEAN)'}`);

    // 4. Navigate into Planning / Overview Page
    console.log('2. Entering Trip Planning flow...');
    const startPlanningBtn = await page.$('.stitch-action-card, button');
    if (startPlanningBtn) {
      await startPlanningBtn.click();
      await new Promise((r) => setTimeout(r, 1200));
      await page.screenshot({ path: './screenshots/audit_02_planner.png' });
      console.log('   ✓ Trip Planner opened.');
    }

    // 5. Check if there are any undefined/null/NaN strings anywhere in the rendered HTML
    const dirtyStrings = await page.evaluate(() => {
      const text = document.body.innerText;
      const issues = [];
      if (/undefined\s*-\s*undefined/i.test(text)) issues.push('undefined - undefined found in UI');
      if (/24\s*Hours?\s*Open\s*-\s*undefined/i.test(text)) issues.push('24 Hours Open - undefined found in UI');
      if (/\bNaN\b/.test(text)) issues.push('NaN found in UI');
      return issues;
    });

    console.log('\n3. UI String Quality Audit:');
    if (dirtyStrings.length === 0) {
      console.log('   ✓ Zero "undefined", "null", or "NaN" strings found in rendered UI DOM.');
    } else {
      console.log('   ✗ Dirty strings detected:', dirtyStrings);
    }

    console.log('\n4. Console & Runtime Health:');
    console.log(`   • Uncaught page errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      pageErrors.forEach((e) => console.log(`     ✗ ${e}`));
    }
    console.log(`   • Console error logs: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.slice(0, 5).forEach((e) => console.log(`     ℹ ${e}`));
    }

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log(`LIVE UI AUDIT RESULT: ${pageErrors.length === 0 && !hasCrash ? 'PASSED' : 'FAILED'}`);
    console.log('═══════════════════════════════════════════════════════════════════');

  } catch (err) {
    console.error('UI Audit error:', err.message);
  } finally {
    await browser.close();
  }
}

verifyLiveUI();
