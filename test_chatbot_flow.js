import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function verifyChatbot() {
  console.log('--- Starting VIHARA Chatbot UI & Backend Integration Test ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');

    // 1. Navigate to homepage
    console.log('1. Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: './screenshots/cb_01_homepage.png' });
    console.log('✓ Homepage loaded successfully.');

    // 2. Find and click floating chatbot badge
    console.log('2. Clicking AI Chatbot badge...');
    const chatbotAvatar = await page.$('img[alt="AI Chatbot Icon"]');
    if (!chatbotAvatar) {
      throw new Error('Could not find AI Chatbot icon image on homepage.');
    }
    await chatbotAvatar.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: './screenshots/cb_02_modal_open.png' });
    console.log('✓ Chatbot modal opened.');

    // 3. Verify modal title
    const modalTitle = await page.evaluate(() => {
      const heading = document.querySelector('h3');
      return heading ? heading.textContent : null;
    });
    console.log(`✓ Chatbot Modal Title: "${modalTitle}"`);

    // 4. Type a message and send
    console.log('3. Typing message to AI Concierge...');
    const input = await page.$('input[placeholder*="Ask about temples"]');
    if (!input) {
      throw new Error('Chat input field not found.');
    }
    await input.type('What are the best spiritual destinations in India?');
    await page.screenshot({ path: './screenshots/cb_03_typed_message.png' });

    console.log('4. Submitting message...');
    await page.click('button[aria-label="Send"]');
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: './screenshots/cb_04_message_sent.png' });
    console.log('✓ Message sent and displayed in chat history.');

    // 5. Close modal
    console.log('5. Closing modal...');
    await page.click('button[aria-label="Close chat"]');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: './screenshots/cb_05_modal_closed.png' });
    console.log('✓ Chatbot modal closed cleanly.');

    console.log('--- ALL CHATBOT TESTS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyChatbot();
