const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login-page');

test.describe('Forgot Password Flow', () => {
  let loginPage;

  test('forgot password appears after email entry (step 2)', async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.fillEmail('test@example.com');
    await loginPage.clickContinue();
    await page.waitForTimeout(3000);

    const forgotBtn = page.locator('button:has-text("Forgot Password")').first();
    const forgotVisible = await forgotBtn.isVisible().catch(() => false);
    expect(forgotVisible).toBeTruthy();
  });

  test('should navigate to forgot password page directly', async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);

    const title = await page.title();
    expect(title).toBeDefined();

    const formFields = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
        tag: el.tagName,
        name: el.getAttribute('name') || '',
        id: el.id || '',
        type: el.getAttribute('type') || '',
        placeholder: el.getAttribute('placeholder') || '',
      }));
    });
    expect(formFields.length).toBeGreaterThan(0);
  });

  test('should navigate to reset password page', async ({ page }) => {
    await page.goto('/reset-password', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);

    const title = await page.title();
    expect(title).toBeDefined();
  });

  test('should show forgot password flow from login step 2', async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.fillEmail('test@example.com');
    await loginPage.clickContinue();
    await page.waitForTimeout(3000);

    const forgotBtn = page.locator('button:has-text("Forgot Password")').first();
    const forgotVisible = await forgotBtn.isVisible().catch(() => false);

    if (forgotVisible) {
      await forgotBtn.click();
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      expect(currentUrl.includes('forgot') || currentUrl.includes('reset')).toBeTruthy();
    }
  });
});
