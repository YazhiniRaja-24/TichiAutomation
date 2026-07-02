const { test, expect } = require('@playwright/test');
const { SIGNUP_ROUTES } = require('../../utils/route-constants');

test.describe('Sign-Up Page Exploration', () => {
  for (const route of SIGNUP_ROUTES) {
    test(`should access ${route} route`, async ({ page }) => {
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
      expect(title).toBeDefined();

      console.log(`  ${route}: status=${status} final=${finalUrl} title="${title}"`);

      if (status === 200 && !finalUrl.includes('/login')) {
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

        console.log(`  Form fields found: ${formFields.length}`);
      }
    });
  }

  test('should navigate from login to sign-up', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 20000 });

    const signUpLink = page.locator('a:has-text("Sign Up"), a:has-text("Register"), a:has-text("Create"), button:has-text("Sign Up"), button:has-text("Register")').first();
    const signUpVisible = await signUpLink.isVisible().catch(() => false);

    if (signUpVisible) {
      await signUpLink.click();
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      expect(currentUrl.includes('signup') || currentUrl.includes('register') || currentUrl.includes('create')).toBeTruthy();
    } else {
      const allButtons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a, [role="button"]')).map(l => ({ text: (l.innerText || '').trim().substring(0, 40), href: l.href || '' }));
      });
      console.log('No direct sign-up link found. All interactive elements:', JSON.stringify(allButtons.slice(0, 20)));
      expect(allButtons.length).toBeGreaterThan(0);
    }
  });
});
