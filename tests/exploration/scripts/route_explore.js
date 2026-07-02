const { chromium } = require('playwright');
const BASE = 'https://tichi-app-webapp-stage.web.app';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  console.log('=== ROUTE EXPLORATION ===');
  var routes = ['/dashboard','/home','/app','/profile','/account','/settings','/login','/signup','/register','/forgot-password','/reset-password','/termsAndConditions','/privacyPolicy'];
  for (var r of routes) {
    var p = await ctx.newPage();
    try {
      var resp = await p.goto(BASE + r, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(r + ' => status=' + (resp?resp.status():'none') + ' final=' + p.url());
    } catch(e) { console.log(r + ' => ERROR: ' + e.message); }
    await p.close();
  }
  console.log('\n=== UNAUTHENTICATED ACCESS ===');
  var cleanCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  var urls = ['/dashboard','/home','/app','/profile','/account','/settings','/admin','/user','/protected','/manage'];
  for (var u of urls) {
    var pp = await cleanCtx.newPage();
    try {
      var r = await pp.goto(BASE + u, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(u + ': status=' + (r?r.status():'none') + ' final=' + pp.url() + ' redirect=' + pp.url().includes('/login'));
    } catch(e) { console.log(u + ': ERROR ' + e.message); }
    await pp.close();
  }
  await cleanCtx.close();
  await browser.close();
  console.log('\nDONE');
})().catch(function(e) { console.error('Fatal:', e); process.exit(1); });
