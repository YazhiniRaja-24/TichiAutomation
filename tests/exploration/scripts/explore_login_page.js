const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
  });
  const page = await context.newPage();

  // Step 1: Go to home page
  console.log('=== STEP 1: HOME PAGE ===');
  await page.goto('https://tichi-app-webapp-stage.web.app', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => 
    page.goto('https://tichi-app-webapp-stage.web.app', { waitUntil: 'load', timeout: 60000 })
  );
  await page.waitForTimeout(2000);
  
  // Click the Sign In button/link to navigate to login
  console.log('\n=== STEP 2: CLICK SIGN IN ===');
  
  // First try the button
  const signInBtn = page.locator('button:has-text("Sign In")');
  const signInLink = page.locator('a:has-text("Sign In")');
  
  if (await signInBtn.isVisible()) {
    console.log('Clicking "Sign In" button...');
    await signInBtn.click();
  } else if (await signInLink.isVisible()) {
    console.log('Clicking "Sign In" link...');
    await signInLink.click();
  } else {
    // Navigate directly
    console.log('Navigating directly to /login...');
    await page.goto('https://tichi-app-webapp-stage.web.app/login', { waitUntil: 'load', timeout: 60000 });
  }
  
  await page.waitForTimeout(3000);
  
  console.log('Current URL:', page.url());
  console.log('Page title:', await page.evaluate(() => document.title));
  
  // Screenshot of login page
  await page.screenshot({ path: 'D:\\\\TichiAutomation\\\\login_page_screenshot.png', fullPage: true });
  console.log('Login page screenshot saved');
  
  // Full HTML
  console.log('\n=== LOGIN PAGE HTML (first 5000 chars) ===');
  const html = await page.content();
  console.log(html.substring(0, 5000));
  console.log('\n=== LOGIN PAGE HTML (last 2000 chars) ===');
  console.log(html.substring(html.length - 2000));
  
  // All inputs on login page
  console.log('\n=== ALL INPUTS ON LOGIN PAGE ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(inp => ({
      tag: inp.tagName, type: inp.getAttribute('type') || '', name: inp.getAttribute('name') || '', id: inp.id,
      placeholder: inp.getAttribute('placeholder') || '', 'aria-label': inp.getAttribute('aria-label') || '',
      'aria-describedby': inp.getAttribute('aria-describedby') || '',
      autocomplete: inp.getAttribute('autocomplete') || '', value: inp.getAttribute('value') || '',
      className: inp.className, required: inp.hasAttribute('required'),
      disabled: inp.disabled, readOnly: inp.hasAttribute('readonly'),
      maxLength: inp.getAttribute('maxlength') || inp.getAttribute('maxLength') || '',
      pattern: inp.getAttribute('pattern') || '',
    }));
  }), null, 2));

  // All buttons on login page
  console.log('\n=== ALL BUTTONS ON LOGIN PAGE ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]')).map(btn => ({
      tag: btn.tagName, type: btn.getAttribute('type') || '', text: btn.textContent?.trim() || btn.getAttribute('value') || '',
      id: btn.id, 'aria-label': btn.getAttribute('aria-label') || '', className: btn.className,
      disabled: btn.disabled,
    }));
  }), null, 2));

  // All links on login page
  console.log('\n=== ALL LINKS ON LOGIN PAGE ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.textContent?.trim(), href: a.getAttribute('href') || '', id: a.id, className: a.className,
      'aria-label': a.getAttribute('aria-label') || '',
    }));
  }), null, 2));

  // All form elements
  console.log('\n=== FORM ELEMENTS ON LOGIN PAGE ===');
  const forms = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('form')).map(f => ({
      action: f.action, method: f.method, id: f.id, className: f.className,
      inputs: Array.from(f.querySelectorAll('input')).map(i => ({
        type: i.getAttribute('type') || '', name: i.getAttribute('name') || '', id: i.id,
        placeholder: i.getAttribute('placeholder') || '',
      })),
      buttons: Array.from(f.querySelectorAll('button')).map(b => ({
        text: b.textContent?.trim(), type: b.getAttribute('type') || '',
      })),
    }));
  });
  console.log(JSON.stringify(forms, null, 2));

  // Labels
  console.log('\n=== ALL LABELS ON LOGIN PAGE ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('label')).map(l => ({
      text: l.textContent?.trim(), htmlFor: l.getAttribute('for') || '', id: l.id, className: l.className,
    }));
  }), null, 2));

  // Visible text
  console.log('\n=== VISIBLE TEXT ON LOGIN PAGE ===');
  console.log(await page.evaluate(() => {
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('script, style, svg, noscript').forEach(s => s.remove());
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }));

  // Element roles
  console.log('\n=== ELEMENT ROLES ON LOGIN PAGE ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    const all = document.querySelectorAll('[role], button, a, input, select, textarea, h1, h2, h3, h4, h5, h6, img, label');
    return Array.from(all).filter(el => el.offsetParent !== null || ['INPUT','BUTTON','SELECT'].includes(el.tagName)).map(el => {
      const role = el.getAttribute('role') || (el.tagName === 'A' && el.getAttribute('href') ? 'link' : '') || (el.tagName === 'BUTTON' ? 'button' : '') || (el.tagName.match(/^H[1-6]$/) ? 'heading' : '') || (el.tagName === 'IMG' ? 'img' : '') || (el.tagName === 'LABEL' ? 'label' : '') || (el.tagName === 'INPUT' ? el.getAttribute('type') || 'textbox' : '');
      return { tag: el.tagName, role, text: el.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('alt') || '', id: el.id, className: el.className, name: el.getAttribute('name') || '' };
    });
  }), null, 2));

  // Google sign-in if present
  console.log('\n=== GOOGLE SIGN-IN BUTTONS ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[class*="google"], [id*="google"], [aria-label*="google"], [aria-label*="Google"]')).map(el => ({
      tag: el.tagName, text: el.textContent?.trim(), id: el.id, className: el.className,
      'aria-label': el.getAttribute('aria-label') || '',
    }));
  }), null, 2));

  // Check for password visibility toggle
  console.log('\n=== PASSWORD ELEMENTS ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="password"]')).map(p => ({
      id: p.id, name: p.name, placeholder: p.placeholder, className: p.className,
      autocomplete: p.getAttribute('autocomplete') || '',
    }));
  }), null, 2));

  // Look for forgot password
  console.log('\n=== FORGOT PASSWORD / RESET ELEMENTS ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, span, p, div')).filter(el => {
      const t = (el.textContent || '').toLowerCase();
      return t.includes('forgot') || t.includes('reset') || t.includes('forget');
    }).map(el => ({ tag: el.tagName, text: el.textContent?.trim(), href: el.getAttribute('href') || '', className: el.className }));
  }), null, 2));

  await browser.close();
  console.log('\n=== LOGIN PAGE EXPLORATION COMPLETE ===');
})();
