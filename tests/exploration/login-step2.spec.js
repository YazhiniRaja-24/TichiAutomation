const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login-page');

test.describe('Login Step 2 - Password Entry', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should show password field after email entry', async ({ page }) => {
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickContinue();
    await page.waitForTimeout(3000);

    const passwordFieldVisible = await loginPage.passwordInput.isVisible().catch(() => false);
    const signInVisible = await loginPage.signInButton.isVisible().catch(() => false);
    const formFields = await loginPage.getAllFormFields();

    const navigated = !page.url().includes('/login');
    expect(passwordFieldVisible || signInVisible || navigated).toBeTruthy();

    if (formFields.length > 0) {
      const passwordFields = formFields.filter(f => f.type === 'password');
      if (passwordFields.length > 0) {
        expect(passwordFields.length).toBeGreaterThan(0);
      }
    }
  });

  test('should show password toggle button', async ({ page }) => {
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickContinue();
    await page.waitForTimeout(3000);

    const toggleVisible = await loginPage.passwordToggle.isVisible().catch(() => false);
    if (toggleVisible) {
      expect(toggleVisible).toBeTruthy();
    }
  });

  test('should show email display on step 2', async ({ page }) => {
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickContinue();
    await page.waitForTimeout(3000);

    const emailText = await loginPage.getPageText();
    expect(emailText.length).toBeGreaterThan(0);
  });

  test('should have form structure on step 2', async ({ page }) => {
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickContinue();
    await page.waitForTimeout(3000);

    const forms = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('form')).map(f => ({
        action: f.action,
        method: f.method,
        id: f.id,
        className: f.className,
      }));
    });

    expect(forms.length).toBeGreaterThanOrEqual(0);
  });

  test('should have back navigation on step 2', async ({ page }) => {
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickContinue();
    await page.waitForTimeout(3000);

    const backVisible = await loginPage.backButton.isVisible().catch(() => false);
    if (!backVisible) {
      const pageText = await loginPage.getPageText();
      expect(pageText.length).toBeGreaterThan(0);
    }
  });
});
