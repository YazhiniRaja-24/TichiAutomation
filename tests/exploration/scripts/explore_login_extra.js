const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: 'en-US' });
  const page = await context.newPage();
  await page.goto('https://tichi-app-webapp-stage.web.app/login', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000);

  console.log('=== GOOGLE SIGN-IN DETAILED ===');
  const googleBtn = await page.evaluate(() => {
    const div = document.querySelector('div[role="button"]');
    if (!div) return 'No div[role="button"] found';
    return {
      tag: div.tagName,
      className: div.className,
      id: div.id,
      innerHTML: div.innerHTML.substring(0, 500),
      text: div.textContent.trim(),
      ariaLabel: div.getAttribute('aria-label'),
      tabIndex: div.getAttribute('tabindex'),
    };
  });
  console.log(JSON.stringify(googleBtn, null, 2));

  console.log('\n=== DIVIDER/SEPARATOR ===');
  const divider = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('*').forEach(el => {
      if ((el.textContent || '').includes('Or continue with')) {
        results.push({ tag: el.tagName, text: el.textContent.trim(), className: el.className, html: el.innerHTML.substring(0, 200) });
      }
    });
    return results;
  });
  console.log(JSON.stringify(divider, null, 2));

  // Step 2
  await page.fill('#email', 'test@example.com');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(3000);

  console.log('\n=== PASSWORD TOGGLE BUTTON (step 2) ===');
  const toggle = await page.evaluate(() => {
    const btn = document.querySelector('button.absolute');
    if (!btn) return 'No absolute positioned button found';
    return {
      tag: btn.tagName,
      type: btn.getAttribute('type'),
      className: btn.className,
      ariaLabel: btn.getAttribute('aria-label'),
      innerHTML: btn.innerHTML.substring(0, 300),
    };
  });
  console.log(JSON.stringify(toggle, null, 2));

  console.log('\n=== EMAIL DISPLAY (clickable?) ===');
  const emailDisplay = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.textContent && el.textContent.includes('test@example.com')) {
        results.push({ tag: el.tagName, text: el.textContent.trim(), className: el.className, html: el.innerHTML.substring(0, 300) });
      }
    });
    return results;
  });
  console.log(JSON.stringify(emailDisplay, null, 2));

  console.log('\n=== FORM ON STEP 2 ===');
  const forms = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('form')).map(f => ({
      action: f.action, method: f.method, id: f.id, className: f.className,
      innerHTML: f.innerHTML.substring(0, 1000),
    }));
  });
  console.log(JSON.stringify(forms, null, 2));

  console.log('\n=== BACK BUTTON / NAVIGATION ===');
  const backNav = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[class*="back"], [aria-label*="back"], [aria-label*="Back"], button:has-text("Back"), a:has-text("Back"), [class*="arrow"], [class*="chevron"], [class*="left"]')).map(el => ({
      tag: el.tagName, text: el.textContent.trim(), className: el.className, ariaLabel: el.getAttribute('aria-label') || '',
    }));
  });
  console.log(JSON.stringify(backNav, null, 2));

  await browser.close();
  console.log('\n=== EXTRA DETAILS DONE ===');
})();
