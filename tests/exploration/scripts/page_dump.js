const { chromium } = require('playwright');
const BASE = 'https://tichi-app-webapp-stage.web.app';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  async function dump(p, label) {
    console.log('--- ' + label + ' ---');
    console.log('URL: ' + p.url());
    console.log('Title: ' + (await p.title()));
    var info = await p.evaluate(function() {
      var all = [];
      document.querySelectorAll('h1, h2, h3, p, a, button, input, form, img, label').forEach(function(el) {
        var o = { tag: el.tagName, id: el.id || '', text: (el.innerText||el.textContent||'').trim().substring(0, 60) };
        if (el.tagName === 'A') o.href = el.getAttribute('href') || '';
        if (el.tagName === 'INPUT') { o.type = el.getAttribute('type') || ''; o.placeholder = el.getAttribute('placeholder') || ''; }
        if (el.textContent && el.textContent.trim()) all.push(o);
      });
      return all;
    });
    info.forEach(function(e) { console.log('  ' + JSON.stringify(e)); });
    console.log('');
  }

  // Dashboard
  var p = await ctx.newPage();
  await p.goto(BASE + '/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
  await dump(p, 'DASHBOARD');
  await p.close();

  // Forgot password page
  p = await ctx.newPage();
  await p.goto(BASE + '/forgot-password', { waitUntil: 'networkidle', timeout: 15000 });
  await dump(p, 'FORGOT PASSWORD');
  await p.close();

  // Signup page
  p = await ctx.newPage();
  await p.goto(BASE + '/signup', { waitUntil: 'networkidle', timeout: 15000 });
  await dump(p, 'SIGNUP');
  await p.close();

  // Register page
  p = await ctx.newPage();
  await p.goto(BASE + '/register', { waitUntil: 'networkidle', timeout: 15000 });
  await dump(p, 'REGISTER');
  await p.close();

  // Reset password page
  p = await ctx.newPage();
  await p.goto(BASE + '/reset-password', { waitUntil: 'networkidle', timeout: 15000 });
  await dump(p, 'RESET PASSWORD');
  await p.close();

  // App page
  p = await ctx.newPage();
  await p.goto(BASE + '/app', { waitUntil: 'networkidle', timeout: 15000 });
  await dump(p, 'APP');
  await p.close();

  // Account page
  p = await ctx.newPage();
  await p.goto(BASE + '/account', { waitUntil: 'networkidle', timeout: 15000 });
  await dump(p, 'ACCOUNT');
  await p.close();

  // Settings page
  p = await ctx.newPage();
  await p.goto(BASE + '/settings', { waitUntil: 'networkidle', timeout: 15000 });
  await dump(p, 'SETTINGS');
  await p.close();

  await browser.close();
  console.log('DONE');
})().catch(function(e) { console.error('Fatal:', e); process.exit(1); });
