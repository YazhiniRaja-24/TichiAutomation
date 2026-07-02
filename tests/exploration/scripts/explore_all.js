const { chromium } = require('playwright');

const BASE_URL = 'https://tichi-app-webapp-stage.web.app';

const ROUTES = [
  '/dashboard',
  '/home',
  '/app',
  '/profile',
  '/account',
  '/settings',
  '/login',
  '/signup',
  '/register',
  '/forgot-password',
  '/reset-password',
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  // ============================================================
  // PART 1: Navigate to each route and record behavior
  // ============================================================
  console.log('='.repeat(80));
  console.log('PART 1: ROUTE EXPLORATION');
  console.log('='.repeat(80));

  for (const route of ROUTES) {
    const page = await context.newPage();
    let finalUrl = '';

    try {
      const response = await page.goto(BASE_URL + route, {
        waitUntil: 'networkidle',
        timeout: 20000,
      });
      const status = response ? response.status() : 'no response';
      finalUrl = page.url();
      const title = await page.title();
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));

      console.log('\n--- Route: ' + route + ' ---');
      console.log('  HTTP Status : ' + status);
      console.log('  Final URL   : ' + finalUrl);
      console.log('  Page Title  : ' + title);
      console.log('  Body Preview: ' + bodyText.replace(/\n/g, ' ').substring(0, 300));
      console.log('  Redirected? : ' + (finalUrl !== BASE_URL + route ? 'YES' : 'no'));
    } catch (err) {
      console.log('\n--- Route: ' + route + ' ---');
      console.log('  ERROR: ' + err.message);
    } finally {
      await page.close();
    }
  }

  // ============================================================
  // PART 2: Login page - check for sign-up/register links
  // ============================================================
  console.log('\n' + '='.repeat(80));
  console.log('PART 2: LOGIN PAGE - SIGN UP LINKS & FORM FIELDS');
  console.log('='.repeat(80));

  {
    const page = await context.newPage();
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('Login page URL: ' + page.url());
    console.log('Login page title: ' + (await page.title()));

    // Get all links on page
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button, [role="button"]')).map(el => ({
        tag: el.tagName,
        text: (el.innerText || '').substring(0, 80),
        href: el.href || el.getAttribute('href') || '',
        id: el.id || '',
        class: (el.className || '').substring(0, 80),
        type: el.getAttribute('type') || '',
      }));
    });
    console.log('\nAll links/buttons on login page:');
    links.forEach((l, i) => console.log('  [' + i + '] <' + l.tag + '> text="' + l.text + '" href="' + l.href + '" id="' + l.id + '" class="' + l.class + '" type="' + l.type + '"'));

    // Look for sign-up/register links
    const signupLinks = links.filter(l =>
      /sign.?up|register|create.?account|join/i.test(l.text)
    );
    console.log('\nSign-up related links:');
    if (signupLinks.length === 0) {
      console.log('  (none found)');
    } else {
      signupLinks.forEach(l => console.log('  text="' + l.text + '" href="' + l.href + '"'));
    }

    // Get form fields
    const formFields = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
        tag: el.tagName,
        name: el.getAttribute('name') || '',
        id: el.id || '',
        type: el.getAttribute('type') || '',
        placeholder: el.getAttribute('placeholder') || '',
        label: '',
        required: el.hasAttribute('required'),
      }));
    });

    // Try to get associated labels
    for (const field of formFields) {
      if (field.id) {
        const label = await page.evaluate((id) => {
          const lbl = document.querySelector('label[for="' + id + '"]');
          return lbl ? lbl.innerText : '';
        }, field.id);
        field.label = label;
      }
    }

    console.log('\nForm fields on login page:');
    formFields.forEach((f, i) => console.log('  [' + i + '] <' + f.tag + '> name="' + f.name + '" id="' + f.id + '" type="' + f.type + '" placeholder="' + f.placeholder + '" label="' + f.label + '" required=' + f.required));

    // Check page structure
    const structure = await page.evaluate(() => {
      function getStructure(el, depth) {
        if (depth > 4) return '';
        var result = '  '.repeat(depth) + '<' + el.tagName.toLowerCase();
        if (el.id) result += ' id="' + el.id + '"';
        if (el.className && typeof el.className === 'string' && el.className) {
          result += ' class="' + el.className.substring(0, 60) + '"';
        }
        result += '>\n';
        for (var i = 0; i < el.children.length; i++) {
          result += getStructure(el.children[i], depth + 1);
        }
        return result;
      }
      return getStructure(document.body, 0);
    });
    console.log('\nPage structure (body):');
    console.log(structure.substring(0, 3000));

    await page.close();
  }

  // ============================================================
  // PART 3: Forgot Password Flow
  // ============================================================
  console.log('\n' + '='.repeat(80));
  console.log('PART 3: FORGOT PASSWORD FLOW');
  console.log('='.repeat(80));

  {
    const page = await context.newPage();

    // Set up network listener
    const networkRequests = [];
    page.on('request', req => {
      if (req.url().includes('firebase') || req.url().includes('api') || req.method() !== 'OPTIONS') {
        networkRequests.push({
          url: req.url(),
          method: req.method(),
          type: req.resourceType(),
          timestamp: Date.now(),
        });
      }
    });

    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 20000 });

    // Fill in email
    var emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('testuser@example.com');
      console.log('Filled email: testuser@example.com');
    } else {
      console.log('Could not find email input');
    }

    // Click Continue/Submit
    var continueBtn = page.locator('button:has-text("Continue"), button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")').first();
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(2000);
      console.log('After Continue click, URL: ' + page.url());
    }

    // Look for "Forgot Password" button/link
    var forgotPwBtn = page.locator('a:has-text("Forgot"), button:has-text("Forgot"), a:has-text("forgot"), button:has-text("forgot"), [class*="forgot"], [id*="forgot"]').first();
    if (await forgotPwBtn.isVisible().catch(() => false)) {
      console.log('Forgot Password element found: <' + (await forgotPwBtn.evaluate(el => el.tagName)) + '> text="' + (await forgotPwBtn.innerText()) + '"');
      
      await forgotPwBtn.click();
      await page.waitForTimeout(2000);
      
      console.log('After clicking Forgot Password:');
      console.log('  URL: ' + page.url());
      
      var newModal = page.locator('[class*="modal"], [role="dialog"], [class*="overlay"]').first();
      if (await newModal.isVisible().catch(() => false)) {
        console.log('  A modal/dialog appeared');
        var modalText = await newModal.evaluate(el => el.innerText.substring(0, 300));
        console.log('  Modal content: ' + modalText);
      } else {
        console.log('  No modal detected (may have navigated)');
      }
      
      // Check for new form fields
      var fpFields = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
          tag: el.tagName,
          name: el.getAttribute('name') || '',
          id: el.id || '',
          type: el.getAttribute('type') || '',
          placeholder: el.getAttribute('placeholder') || '',
        }));
      });
      console.log('  Form fields after forgot password:');
      fpFields.forEach((f, i) => console.log('    [' + i + '] <' + f.tag + '> name="' + f.name + '" id="' + f.id + '" type="' + f.type + '" placeholder="' + f.placeholder + '"'));
    } else {
      console.log('No Forgot Password button found');
      var allText = await page.evaluate(() => document.body.innerText);
      console.log('Page text content: ' + allText.substring(0, 1000));
    }

    console.log('\nNetwork requests captured (' + networkRequests.length + '):');
    networkRequests.forEach((r, i) => {
      console.log('  [' + i + '] ' + r.method + ' ' + r.url + ' (' + r.type + ')');
    });

    await page.close();
  }

  // ============================================================
  // PART 4: Check for unauthenticated access behavior
  // ============================================================
  console.log('\n' + '='.repeat(80));
  console.log('PART 4: UNAUTHENTICATED ACCESS & REDIRECTS');
  console.log('='.repeat(80));

  {
    // Clear any stored auth state
    const cleanContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });

    for (const route of ['/dashboard', '/home', '/app', '/profile', '/account', '/settings', '/admin', '/user', '/protected']) {
      const page = await cleanContext.newPage();
      try {
        const response = await page.goto(BASE_URL + route, {
          waitUntil: 'networkidle',
          timeout: 20000,
        });
        const status = response ? response.status() : 'no response';
        const finalUrl = page.url();
        const title = await page.title();
        console.log('\n  ' + route + ':');
        console.log('    Status: ' + status);
        console.log('    Final URL: ' + finalUrl);
        console.log('    Title: ' + title);
        console.log('    Redirect to login? ' + (finalUrl.includes('/login') ? 'YES' : 'no'));
      } catch (err) {
        console.log('\n  ' + route + ': ERROR - ' + err.message);
      }
      await page.close();
    }

    await cleanContext.close();
  }

  // ============================================================
  // PART 5: Network request monitoring during login interaction
  // ============================================================
  console.log('\n' + '='.repeat(80));
  console.log('PART 5: NETWORK REQUESTS / API ENDPOINTS');
  console.log('='.repeat(80));

  {
    const page = await context.newPage();
    
    // Collect all requests
    const allRequests = [];
    const allResponses = [];
    
    page.on('request', req => {
      allRequests.push({
        url: req.url(),
        method: req.method(),
        type: req.resourceType(),
        headers: req.headers(),
      });
    });
    
    page.on('response', resp => {
      allResponses.push({
        url: resp.url(),
        status: resp.status(),
        method: resp.request().method(),
        type: resp.request().resourceType(),
      });
    });

    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 20000 });

    // Also check what scripts/styles are loaded
    const resources = await page.evaluate(() => {
      return {
        scripts: Array.from(document.scripts).map(s => s.src).filter(Boolean),
        links: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
        meta: Array.from(document.querySelectorAll('meta[name]')).map(m => ({ name: m.getAttribute('name'), content: m.getAttribute('content') })),
      };
    });

    console.log('\nTotal requests made: ' + allRequests.length);
    console.log('Total responses received: ' + allResponses.length);

    // Filter to unique URLs
    const uniqueUrls = [...new Set(allRequests.map(r => r.url))];
    console.log('\nUnique request URLs:');
    uniqueUrls.forEach(url => {
      const methods = [...new Set(allRequests.filter(r => r.url === url).map(r => r.method))];
      const types = [...new Set(allRequests.filter(r => r.url === url).map(r => r.type))];
      console.log('  ' + methods.join(',') + ' ' + url + ' (' + types.join(',') + ')');
    });

    console.log('\nScripts loaded:');
    resources.scripts.forEach(s => console.log('  ' + s));

    console.log('\nStylesheets loaded:');
    resources.links.forEach(l => console.log('  ' + l));

    console.log('\nMeta tags:');
    resources.meta.forEach(m => console.log('  ' + m.name + ' = ' + m.content));

    // Check for Firebase config
    const pageContent = await page.content();
    const firebaseMatch = pageContent.match(/firebase|Firebase|apiKey|authDomain|projectId|appId/i);
    if (firebaseMatch) {
      console.log('\nFirebase references found on page');
      // Try to extract config
      const configMatch = pageContent.match(/(?:apiKey|authDomain|projectId|storageBucket|messagingSenderId|appId|measurementId)\s*[:=]\s*["'][^"']+["']/gi);
      if (configMatch) {
        console.log('Firebase config snippets found:');
        configMatch.slice(0, 20).forEach(m => console.log('  ' + m));
      }
    }

    // Look for API URLs in page source
    const apiMatches = pageContent.match(/(https?:\/\/[^"'\s]+(?:api|rest|graphql|v1|v2)[^"'\s]*)/gi);
    if (apiMatches) {
      console.log('\nPotential API endpoints in source:');
      [...new Set(apiMatches)].slice(0, 10).forEach(url => console.log('  ' + url));
    }

    await page.close();
  }

  // ============================================================
  // PART 6: Try sign-up page from login
  // ============================================================
  console.log('\n' + '='.repeat(80));
  console.log('PART 6: SIGN-UP PAGE EXPLORATION');
  console.log('='.repeat(80));

  {
    // Try direct signup URL
    for (const route of ['/signup', '/register', '/sign-up', '/create-account']) {
      const page = await context.newPage();
      try {
        const resp = await page.goto(BASE_URL + route, { waitUntil: 'networkidle', timeout: 20000 });
        const status = resp ? resp.status() : 'no response';
        console.log('\n  ' + route + ':');
        console.log('    Status: ' + status);
        console.log('    Final URL: ' + page.url());
        console.log('    Title: ' + (await page.title()));

        if (status === 200 && !page.url().includes('/login')) {
          const formFields = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
              tag: el.tagName,
              name: el.getAttribute('name') || '',
              id: el.id || '',
              type: el.getAttribute('type') || '',
              placeholder: el.getAttribute('placeholder') || '',
              required: el.hasAttribute('required'),
            }));
          });
          console.log('    Form fields:');
          formFields.forEach((f, i) => console.log('      [' + i + '] <' + f.tag + '> name="' + f.name + '" id="' + f.id + '" type="' + f.type + '" placeholder="' + f.placeholder + '" required=' + f.required));
          
          const buttons = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('button')).map(b => ({
              text: (b.innerText || '').substring(0, 60),
              type: b.getAttribute('type'),
              id: b.id,
            }));
          });
          console.log('    Buttons:');
          buttons.forEach((b, i) => console.log('      [' + i + '] type="' + b.type + '" text="' + b.text + '"'));
        }
      } catch (err) {
        console.log('\n  ' + route + ': ERROR - ' + err.message);
      }
      await page.close();
    }

    // Go to login page and click sign-up link
    const page = await context.newPage();
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 20000 });
    
    var signUpLink = page.locator('a:has-text("Sign Up"), a:has-text("Register"), a:has-text("Create"), button:has-text("Sign Up"), button:has-text("Register")').first();
    if (await signUpLink.isVisible().catch(() => false)) {
      console.log('\nFound sign-up element: <' + (await signUpLink.evaluate(el => el.tagName)) + '> text="' + (await signUpLink.innerText()) + '" href="' + ((await signUpLink.getAttribute('href')) || '') + '"');
      await signUpLink.click();
      await page.waitForTimeout(3000);
      console.log('After clicking sign-up, URL: ' + page.url());
      
      const signupFields = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
          tag: el.tagName,
          name: el.getAttribute('name') || '',
          id: el.id || '',
          type: el.getAttribute('type') || '',
          placeholder: el.getAttribute('placeholder') || '',
          required: el.hasAttribute('required'),
        }));
      });
      console.log('Form fields on sign-up page:');
      signupFields.forEach((f, i) => console.log('  [' + i + '] <' + f.tag + '> name="' + f.name + '" id="' + f.id + '" type="' + f.type + '" placeholder="' + f.placeholder + '" required=' + f.required));
    } else {
      console.log('\nNo sign-up link found on login page');
      var allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href }));
      });
      console.log('All links on page:');
      allLinks.forEach(l => console.log('  "' + l.text + '" -> ' + l.href));
    }
    
    await page.close();
  }

  await browser.close();
  console.log('\n' + '='.repeat(80));
  console.log('EXPLORATION COMPLETE');
  console.log('='.repeat(80));
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
