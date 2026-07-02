const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
  });
  const page = await context.newPage();

  // Capture console output from the page
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE CRASH:', err.message);
  });

  console.log('=== NAVIGATING TO URL (waitUntil: load) ===');
  await page.goto('https://tichi-app-webapp-stage.web.app', {
    waitUntil: 'load',
    timeout: 60000,
  });
  console.log('Page loaded successfully.');
  
  // Wait a bit for any dynamic rendering
  await page.waitForTimeout(3000);

  console.log('\n=== SCREENSHOT ===');
  await page.screenshot({ path: 'D:\\\\TichiAutomation\\\\explore_screenshot.png', fullPage: true });
  console.log('Screenshot saved');

  console.log('\n=== PAGE TITLE ===');
  const title = await page.evaluate(() => document.title);
  console.log('Title:', title);

  console.log('\n=== CURRENT URL ===');
  console.log('URL:', page.url());

  console.log('\n=== FULL PAGE HTML (first 5000 chars) ===');
  const html = await page.content();
  console.log(html.substring(0, 5000));
  console.log('\n=== FULL PAGE HTML (last 2000 chars) ===');
  console.log(html.substring(html.length - 2000));

  console.log('\n=== ROUTE EXPLORATION ===');
  for (const route of ['/login', '/signin', '/auth', '/sign-in', '/log-in', '/signup', '/register']) {
    const hrefs = await page.evaluate((r) => {
      const all = [...document.querySelectorAll('a'), ...document.querySelectorAll('button, [role="button"]')];
      return all.filter(el => {
        const href = el.getAttribute('href') || el.getAttribute('data-href') || '';
        const text = (el.textContent || '').toLowerCase();
        return href.includes(r) || text.includes(r.replace('/', ''));
      }).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim(),
        href: el.getAttribute('href') || el.getAttribute('data-href') || '',
        id: el.id,
        className: el.className,
      }));
    }, route);
    if (hrefs.length > 0) {
      console.log('Route "' + route + '" found:', JSON.stringify(hrefs, null, 2));
    }
  }

  console.log('\n=== FORM ELEMENTS ===');
  const formElements = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return { message: 'No <form> element found on page' };
    const result = { formAction: form.action, formMethod: form.method, formId: form.id, formClass: form.className, inputs: [], buttons: [], labels: [] };
    form.querySelectorAll('input, select, textarea').forEach(inp => {
      result.inputs.push({ tag: inp.tagName, type: inp.getAttribute('type') || '', name: inp.getAttribute('name') || '', id: inp.id, placeholder: inp.getAttribute('placeholder') || '', 'aria-label': inp.getAttribute('aria-label') || '', 'aria-labelledby': inp.getAttribute('aria-labelledby') || '', autocomplete: inp.getAttribute('autocomplete') || '', required: inp.hasAttribute('required'), className: inp.className });
    });
    form.querySelectorAll('button, input[type="submit"], input[type="button"]').forEach(btn => {
      result.buttons.push({ tag: btn.tagName, type: btn.getAttribute('type') || '', text: btn.textContent?.trim() || btn.getAttribute('value') || '', id: btn.id, 'aria-label': btn.getAttribute('aria-label') || '', className: btn.className });
    });
    form.querySelectorAll('label').forEach(lbl => {
      result.labels.push({ text: lbl.textContent?.trim() || '', htmlFor: lbl.getAttribute('for') || '', id: lbl.id });
    });
    return result;
  });
  console.log(JSON.stringify(formElements, null, 2));

  console.log('\n=== ALL INPUTS ON PAGE ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(inp => ({
      tag: inp.tagName, type: inp.getAttribute('type') || '', name: inp.getAttribute('name') || '', id: inp.id,
      placeholder: inp.getAttribute('placeholder') || '', 'aria-label': inp.getAttribute('aria-label') || '',
      autocomplete: inp.getAttribute('autocomplete') || '', value: inp.getAttribute('value') || '', className: inp.className,
    }));
  }), null, 2));

  console.log('\n=== ALL BUTTONS ON PAGE ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]')).map(btn => ({
      tag: btn.tagName, type: btn.getAttribute('type') || '', text: btn.textContent?.trim() || btn.getAttribute('value') || '',
      id: btn.id, 'aria-label': btn.getAttribute('aria-label') || '', className: btn.className,
    }));
  }), null, 2));

  console.log('\n=== ALL ANCHOR LINKS ON PAGE ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.textContent?.trim(), href: a.getAttribute('href') || '', id: a.id, className: a.className,
      'aria-label': a.getAttribute('aria-label') || '', target: a.getAttribute('target') || '',
    }));
  }), null, 2));

  console.log('\n=== VISIBLE TEXT CONTENT ===');
  console.log(await page.evaluate(() => {
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('script, style, svg, noscript').forEach(s => s.remove());
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }));

  console.log('\n=== ELEMENT ROLES & ACCESSIBILITY ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    const all = document.querySelectorAll('[role], button, a, input, select, textarea, h1, h2, h3, h4, h5, h6, img');
    return Array.from(all).filter(el => el.offsetParent !== null || ['INPUT','BUTTON','SELECT'].includes(el.tagName)).map(el => {
      const role = el.getAttribute('role') || (el.tagName === 'A' && el.getAttribute('href') ? 'link' : '') || (el.tagName === 'BUTTON' ? 'button' : '') || (el.tagName.match(/^H[1-6]$/) ? 'heading' : '') || (el.tagName === 'IMG' ? 'img' : '') || (el.tagName === 'INPUT' ? el.getAttribute('type') || 'textbox' : '') || (el.tagName === 'SELECT' ? 'combobox' : '') || (el.tagName === 'TEXTAREA' ? 'textbox' : '');
      return { tag: el.tagName, role, text: el.textContent?.trim() || el.getAttribute('aria-label') || el.getAttribute('alt') || '', id: el.id, className: el.className, name: el.getAttribute('name') || '' };
    });
  }), null, 2));

  console.log('\n=== AUTH/LOGIN SPECIFIC SEARCH ===');
  console.log(JSON.stringify(await page.evaluate(() => {
    const keywords = ['login','sign in','signin','log in','email','password','forgot','reset','register','create account','sign up','signup'];
    const matches = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length > 0) return;
      const combined = ((el.textContent||'') + ' ' + (el.getAttribute('aria-label')||'') + ' ' + (el.getAttribute('placeholder')||'') + ' ' + (el.getAttribute('name')||'') + ' ' + (el.id||'')).toLowerCase();
      if (keywords.some(kw => combined.includes(kw))) {
        matches.push({ tag: el.tagName, text: (el.textContent||'').trim().substring(0,100), 'aria-label': el.getAttribute('aria-label')||'', placeholder: el.getAttribute('placeholder')||'', name: el.getAttribute('name')||'', id: el.id, type: el.getAttribute('type')||'', className: el.className });
      }
    });
    return matches;
  }), null, 2));

  console.log('\n=== SHADOW ROOT CHECK ===');
  console.log('Has shadow DOM roots:', await page.evaluate(() => Array.from(document.querySelectorAll('*')).some(el => el.shadowRoot)));

  console.log('\n=== IFRAMES ===');
  console.log(JSON.stringify(await page.evaluate(() => Array.from(document.querySelectorAll('iframe')).map(f => ({ src: f.getAttribute('src')||'', id: f.id, name: f.getAttribute('name')||'' }))), null, 2));

  await browser.close();
  console.log('\n=== EXPLORATION COMPLETE ===');
})();
