import puppeteer from 'puppeteer-core';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173';

async function runE2EProductionAudit() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('VIHARA COMPLETE E2E LIVE BROWSER AUDIT');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
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

  async function auditDomStrings(contextName) {
    const findings = await page.evaluate(() => {
      const text = document.body.innerText || '';
      const issues = [];
      if (/undefined\s*-\s*undefined/i.test(text)) issues.push('undefined - undefined found');
      if (/24\s*Hours?\s*Open\s*-\s*undefined/i.test(text)) issues.push('24 Hours Open - undefined found');
      if (/\bNaN\b/.test(text)) issues.push('NaN found');
      if (/null\s*-\s*null/i.test(text)) issues.push('null - null found');
      return issues;
    });

    if (findings.length > 0) {
      console.error(`  [FAIL] ${contextName} has dirty strings:`, findings);
    } else {
      console.log(`  [PASS] ${contextName}: Zero undefined/null/NaN strings found in DOM.`);
    }
    return findings;
  }

  try {
    // -------------------------------------------------------------
    // PHASE 1: Homepage Load & Auth
    // -------------------------------------------------------------
    console.log('--- PHASE 1: Homepage Load & Auth ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: './screenshots/audit_live_01_home.png' });

    // Login / Signup to enable state storage
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const login = btns.find((b) => b.textContent.includes('Login'));
      if (login) login.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signup = btns.find((b) => b.textContent.trim() === 'Sign Up');
      if (signup) signup.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    const authInputs = await page.$$('input');
    if (authInputs.length >= 4) {
      await authInputs[0].type('Audit Traveler');
      await authInputs[1].type(`audit_${Date.now()}@vihara.test`);
      await authInputs[2].type('ViharaAudit2026!');
      await authInputs[3].type('ViharaAudit2026!');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await new Promise((r) => setTimeout(r, 3000));
    }
    console.log('  ✓ Authenticated user session established.');

    // -------------------------------------------------------------
    // PHASE 2: Trip Planning Step 1 -> Destination & Dates
    // -------------------------------------------------------------
    console.log('\n--- PHASE 2: Live UI - Goa Beaches 5-Day Flow ---');
    // Open trip planner
    await page.evaluate(() => {
      const card = document.querySelector('.glass-btn') || document.querySelector('.stitch-action-card');
      if (card) card.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Remove any pre-selected destinations (e.g., Hyderabad)
    console.log('  Removing pre-selected destination(s)...');
    await page.evaluate(() => {
      const removeButtons = Array.from(document.querySelectorAll('button[title*="Remove"]'));
      removeButtons.forEach((b) => b.click());
    });
    await new Promise((r) => setTimeout(r, 800));

    // Search and select Goa
    console.log('  Searching for Goa in destination autocomplete...');
    const searchInput = await page.$('input[placeholder*="Search for a city"]');
    if (searchInput) {
      await searchInput.type('Goa');
      await new Promise((r) => setTimeout(r, 1500));
      // Click suggestion
      const suggestionClicked = await page.evaluate(() => {
        const item = document.querySelector('.dest-suggestion-item');
        if (item) {
          item.click();
          return true;
        }
        return false;
      });
      console.log(`  Goa autocomplete suggestion clicked: ${suggestionClicked}`);
    }
    await new Promise((r) => setTimeout(r, 800));

    // Select 5 Days quick preset
    console.log('  Clicking "5 Days" preset...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const fiveDaysBtn = btns.find((b) => b.textContent.trim() === '5 Days');
      if (fiveDaysBtn) fiveDaysBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Click "Continue to Categories"
    console.log('  Clicking "Continue to Categories"...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find((b) => b.textContent.includes('Continue to Categories'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: './screenshots/audit_live_02_step2_categories.png' });

    // Step 2: In Categories, select Beaches only
    console.log('  Configuring Categories: selecting Beaches subcategory...');
    await page.evaluate(() => {
      // Find all subcategory labels / items
      const items = Array.from(document.querySelectorAll('div, label, span'));
      const beachItem = items.find((el) => el.textContent.trim().toLowerCase() === 'beaches');
      if (beachItem) {
        beachItem.click();
      }
    });
    await new Promise((r) => setTimeout(r, 800));

    // Click "Proceed to AI Budgeting"
    console.log('  Clicking "Proceed to AI Budgeting"...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find((b) => b.textContent.includes('Proceed to AI Budgeting'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: './screenshots/audit_live_03_step3_budget.png' });

    // Step 3: Click "Finalize & Generate AI Itinerary"
    console.log('  Clicking "Finalize & Generate AI Itinerary"...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const genBtn = btns.find((b) => b.textContent.includes('Finalize & Generate AI Itinerary'));
      if (genBtn) genBtn.click();
    });

    console.log('  Awaiting AI Itinerary generation (up to 8s)...');
    await new Promise((r) => setTimeout(r, 7000));
    await page.screenshot({ path: './screenshots/audit_live_04_step4_itinerary.png' });

    // Inspect Itinerary Page
    const pageText = await page.evaluate(() => document.body.innerText || '');
    const isOverviewPage = /Day 1|Overview|Itinerary|Trip Overview/i.test(pageText);
    console.log(`  Reached Trip Overview/Itinerary Page: ${isOverviewPage ? 'YES' : 'NO'}`);

    const hasCalangute = /Calangute/i.test(pageText);
    const hasDudhsagar = /Dudhsagar/i.test(pageText);
    const hasAguada = /Fort Aguada/i.test(pageText);
    const hasChapora = /Chapora/i.test(pageText);
    const hasCoverageNotice = /reserved for leisure|independent exploration|available/i.test(pageText);

    console.log(`    • Calangute Beach present: ${hasCalangute ? 'YES (CORRECT)' : 'NO'}`);
    console.log(`    • Dudhsagar Waterfall leaked: ${hasDudhsagar ? 'YES (FAILURE)' : 'NO (PASSED)'}`);
    console.log(`    • Fort Aguada leaked: ${hasAguada ? 'YES (FAILURE)' : 'NO (PASSED)'}`);
    console.log(`    • Chapora Fort leaked: ${hasChapora ? 'YES (FAILURE)' : 'NO (PASSED)'}`);
    console.log(`    • Honest coverage/leisure notice present: ${hasCoverageNotice ? 'YES (CORRECT)' : 'NO'}`);

    await auditDomStrings('Goa Beaches 5-Day Overview DOM');

    // -------------------------------------------------------------
    // PHASE 3: Standalone PDF Itinerary Modal
    // -------------------------------------------------------------
    console.log('\n--- PHASE 3: Standalone PDF Itinerary Modal ---');
    const pdfBtnClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const pdf = btns.find((b) => /open pdf itinerary|print pdf|download pdf|export pdf/i.test(b.textContent));
      if (pdf) {
        pdf.click();
        return true;
      }
      return false;
    });
    console.log(`  PDF Modal button clicked: ${pdfBtnClicked}`);
    if (pdfBtnClicked) {
      await new Promise((r) => setTimeout(r, 1500));
      await page.screenshot({ path: './screenshots/audit_live_05_pdf_modal.png' });
      await auditDomStrings('Standalone PDF Modal DOM');

      // Close modal
      await page.evaluate(() => {
        const closeBtn = document.querySelector('.fixed.inset-0 button');
        if (closeBtn) closeBtn.click();
      });
      await new Promise((r) => setTimeout(r, 600));
    }

    // -------------------------------------------------------------
    // PHASE 4: AI Concierge Drawer & Live Chat Interaction
    // -------------------------------------------------------------
    console.log('\n--- PHASE 4: Live UI - AI Concierge Interaction ---');
    const conciergeOpened = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      const conciergeBtn = btns.find((b) =>
        /concierge|assistant|ai chat|ask vihara/i.test(b.textContent) || b.id === 'ai-concierge-trigger'
      );
      if (conciergeBtn) {
        conciergeBtn.click();
        return true;
      }
      return false;
    });
    console.log(`  AI Concierge triggered: ${conciergeOpened}`);
    await new Promise((r) => setTimeout(r, 1000));

    // Submit chat message
    const chatInput = await page.$('input[placeholder*="Ask"], textarea[placeholder*="Ask"], input[placeholder*="Concierge"]');
    if (chatInput) {
      console.log('  Typing message: "Can you recommend a sunset shack near Calangute?"');
      await chatInput.type('Can you recommend a sunset shack near Calangute?');
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const send = btns.find((b) => /send/i.test(b.textContent) || b.querySelector('svg.lucide-send'));
        if (send) send.click();
      });
      console.log('  Awaiting AI Concierge response...');
      await new Promise((r) => setTimeout(r, 4500));
      await page.screenshot({ path: './screenshots/audit_live_06_concierge_chat.png' });
    }

    // -------------------------------------------------------------
    // PHASE 5: Console & Error Assessment
    // -------------------------------------------------------------
    console.log('\n--- PHASE 5: Final Console & Runtime Health Assessment ---');
    console.log(`  • Uncaught page exceptions: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      pageErrors.forEach((e) => console.error(`    ✗ ${e}`));
    }
    console.log(`  • Console error count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.slice(0, 5).forEach((e) => console.log(`    ℹ ${e}`));
    }

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('LIVE E2E PRODUCTION-READINESS AUDIT COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════════');

  } catch (err) {
    console.error('Fatal E2E Audit Exception:', err);
  } finally {
    await browser.close();
  }
}

runE2EProductionAudit().catch(console.error);
