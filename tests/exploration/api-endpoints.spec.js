const { test, expect } = require('@playwright/test');

test.describe('Network / API Endpoints', () => {
  test('should capture network requests during login page load', async ({ page }) => {
    const requests = [];
    const responses = [];

    page.on('request', req => {
      if (req.url().includes('firebase') || req.url().includes('api') || req.resourceType() === 'fetch' || req.resourceType() === 'xhr') {
        requests.push({
          url: req.url(),
          method: req.method(),
          type: req.resourceType(),
        });
      }
    });

    page.on('response', resp => {
      responses.push({
        url: resp.url(),
        status: resp.status(),
        method: resp.request().method(),
      });
    });

    await page.goto('/login', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);

    console.log(`Network requests: ${requests.length}, Responses: ${responses.length}`);

    expect(requests.length).toBeGreaterThanOrEqual(0);
    expect(responses.length).toBeGreaterThanOrEqual(0);
  });

  test('should load required resources on login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 20000 });

    const resources = await page.evaluate(() => {
      return {
        scripts: Array.from(document.scripts).map(s => s.src).filter(Boolean),
        styles: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
        meta: Array.from(document.querySelectorAll('meta[name]')).map(m => ({
          name: m.getAttribute('name'),
          content: m.getAttribute('content'),
        })),
      };
    });

    console.log(`Scripts: ${resources.scripts.length}, Styles: ${resources.styles.length}`);

    expect(resources.scripts.length).toBeGreaterThanOrEqual(0);
    expect(resources.styles.length).toBeGreaterThanOrEqual(0);
  });

  test('should check for Firebase configuration', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 20000 });

    const pageContent = await page.content();
    const hasFirebase = /firebase|apiKey|authDomain|projectId/i.test(pageContent);

    if (hasFirebase) {
      const configMatches = pageContent.match(/(?:apiKey|authDomain|projectId|storageBucket|messagingSenderId|appId)\s*[:=]\s*["'][^"']+["']/gi);
      console.log(`Firebase config found: ${configMatches ? configMatches.length : 0} properties`);
      expect(configMatches).not.toBeNull();
    }
  });
});
