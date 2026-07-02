const { chromium } = require('playwright');
const BASE = 'https://tichi-app-webapp-stage.web.app';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  async function dump(p, label) {
    console.log('=== ' + label + ' ===');
    console.log('URL: ' + p.url());
    var inputs = JSON.parse(await p.evaluate(function() {
      return JSON.stringify(Array.from(document.querySelectorAll('input, textarea, select')).map(function(el) {
        return { id: el.id, name: el.getAttribute('name'), type: el.getAttribute('type'), placeholder: el.getAttribute('placeholder'), required: el.hasAttribute('required') };
      }));
    }));
    console.log('Inputs:');
    inputs.forEach(function(i) { console.log('  ' + JSON.stringify(i)); });
    var buttons = JSON.parse(await p.evaluate(function() {
      return JSON.stringify(Array.from(document.querySelectorAll('button')).map(function(el) {
        return { text: (el.innerText||'').trim(), type: el.getAttribute('type') };
      }));
    }));
    console.log('Buttons:');
    buttons.forEach(function(b) { console.log('  ' + JSON.stringify(b)); });
    var labels = JSON.parse(await p.evaluate(function() {
      return JSON.stringify(Array.from(document.querySelectorAll('label')).map(function(el) {
        return { text: (el.innerText||'').trim(), htmlFor: el.getAttribute('for') };
      }));
    }));
    console.log('Labels:');
    labels.forEach(function(l) { console.log('  ' + JSON.stringify(l)); });
    console.log('');
  }
  // Forgot Password page
  var p = await ctx.newPage();
  await p.goto(BASE + '/forgot-password', { waitUntil: 'networkidle', timeout: 15000 });
  await dump(p, 'FORGOT PASSWORD');
  await p.close();
  // Reset Password page without params
  p = await ctx.newPage();
  await p.goto(BASE + '/reset-password', { waitUntil: 'networkidle', timeout: 15000 });
  await dump(p, 'RESET PASSWORD');
  await p.close();
  // Forgot Password flow from login
  p = await ctx.newPage();
  await p.goto(BASE + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('#email').fill('test@example.com');
  await p.locator('button:has-text("Continue")').click();
  await p.waitForTimeout(2000);
  console.log('Before FP click: ' + p.url());
  var fpBtn = p.locator('button:has-text("Forgot Password")');
  console.log('FP found: ' + (await fpBtn.count() > 0));
  if (await fpBtn.count() > 0) {
    await fpBtn.click();
    await p.waitForTimeout(3000);
    console.log('After FP click: ' + p.url());
    await dump(p, 'AFTER FP');
  }
  await p.close();
  await browser.close();
  console.log('DONE');
})().catch(function(e) { console.error('Fatal:', e); process.exit(1); });
