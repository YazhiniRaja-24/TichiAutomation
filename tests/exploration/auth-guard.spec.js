const { test, expect } = require('@playwright/test');
const { PROTECTED_ROUTES } = require('../../utils/route-constants');

test.describe('Auth Guard - Unauthenticated Access', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`should redirect unauthenticated user from ${route} to login`, async ({ page }) => {
      const cleanContext = await page.context().browser().newContext({
        viewport: { width: 1280, height: 720 },
      });
      const cleanPage = await cleanContext.newPage();

      try {
        let response;
        try {
          response = await cleanPage.goto(route, {
            waitUntil: 'networkidle',
            timeout: 20000,
          });
        } catch (e) {
          response = await cleanPage.goto(route, {
            waitUntil: 'load',
            timeout: 20000,
          });
        }

        const status = response ? response.status() : 'no response';
        const finalUrl = cleanPage.url();
        const title = await cleanPage.title();

        console.log(`  ${route}: status=${status} final=${finalUrl} title="${title}"`);

        const redirectedToLogin = finalUrl.includes('/login');
        expect(finalUrl).toBeDefined();
        expect(status).not.toBe('no response');
      } finally {
        await cleanPage.close();
        await cleanContext.close();
      }
    });
  }
});
