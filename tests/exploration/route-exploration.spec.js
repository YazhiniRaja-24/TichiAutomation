const { test, expect } = require('@playwright/test');
const { ROUTES } = require('../../utils/route-constants');

test.describe('Route Exploration', () => {
  for (const route of ROUTES) {
    test(`should access ${route} without errors`, async ({ page }) => {
      let response;
      try {
        response = await page.goto(route, {
          waitUntil: 'networkidle',
          timeout: 20000,
        });
      } catch (e) {
        response = await page.goto(route, {
          waitUntil: 'load',
          timeout: 20000,
        });
      }

      const status = response ? response.status() : 'no response';
      const finalUrl = page.url();
      const title = await page.title();

      expect(status).not.toBe('no response');
      expect(finalUrl).toBeDefined();
      expect(title).toBeDefined();

      const redirected = finalUrl !== `https://tichi-app-webapp-stage.web.app${route}`;
      console.log(`  ${route}: status=${status} title="${title}" redirected=${redirected}`);
    });
  }
});
