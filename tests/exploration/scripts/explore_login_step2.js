const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: 'en-US' });
  const page = await context.newPage();

  // Go to login page
  await page.goto('https://tichi-app-webapp-stage.web.app/login', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000);

  console.log('=== STEP 1: FILL EMAIL AND CONTINUE ===');
  console.log('Current URL:', page.url());

  // Fill email
  await page.fill('#email', 'test@example.com');
  console.log('Filled email with test@example.com');

  // Click Continue
  await page.click('button:has-text("Continue")');
  console.log('Clicked Continue...');
  
  // Wait for next step to load
  await page.waitForTimeout(3000);
  console.log('New URL:', page.url());

  // Take screenshot
  await page.screenshot({ path: 'D:\\\\TichiAutomation\\\\login_step2_screenshot.png', fullPage: true });
  console.log('Step 2 screenshot saved');

  // Check what's on the next page
  console.log('\n=== STEP 2: PAGE STRUCTURE ===');
  
  console.log('\n=== ALL INPUTS ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(inp => ({
      tag: inp.tagName, type: inp.getAttribute('type') || '', name: inp.getAttribute('name') || '', id: inp.id,
      placeholder: inp.getAttribute('placeholder') || '', 'aria-label': inp.getAttribute('aria-label') || '',
      autocomplete: inp.getAttribute('autocomplete') || '', value: inp.getAttribute('value') || '',
      className: inp.className, required: inp.hasAttribute('required'),
    }));
  }), null, 2));

  console.log('\n=== ALL BUTTONS ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, [role="button"]')).map(btn => ({
      tag: btn.tagName, type: btn.getAttribute('type') || '', text: btn.textContent?.trim() || btn.getAttribute('value') || '',
      id: btn.id, 'aria-label': btn.getAttribute('aria-label') || '', className: btn.className,
    }));
  }), null, 2));

  console.log('\n=== ALL LINKS ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.textContent?.trim(), href: a.getAttribute('href') || '', id: a.id, className: a.className,
    }));
  }), null, 2));

  console.log('\n=== ALL LABELS ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('label')).map(l => ({
      text: l.textContent?.trim(), htmlFor: l.getAttribute('for') || '', id: l.id,
    }));
  }), null, 2));

  console.log('\n=== VISIBLE TEXT ===');
  console.log(await page.evaluate(() => {
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('script, style, svg, noscript').forEach(s => s.remove());
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }));

  // Check for form
  console.log('\n=== FORMS ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('form')).map(f => ({
      action: f.action, method: f.method, id: f.id, className: f.className,
    }));
  }), null, 2));

  // Check for error messages
  console.log('\n=== ERROR MESSAGES ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[class*="error"], [class*="Error"], [role="alert"], [aria-live]')).map(el => ({
      tag: el.tagName, text: el.textContent?.trim(), className: el.className,
      'aria-live': el.getAttribute('aria-live') || '',
    }));
  }), null, 2));

  // Check heading
  console.log('\n=== HEADINGS ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      tag: h.tagName, text: h.textContent?.trim(), id: h.id, className: h.className,
    }));
  }), null, 2));

  await browser.close();
  console.log('\n=== DONE ===');
})();
