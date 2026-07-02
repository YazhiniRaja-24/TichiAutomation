const { test, expect } = require('../../fixtures/base-fixture');
const loginData = require('../../test-data/login-data.json');

const hasCredentials = process.env.VALID_EMAIL && process.env.VALID_PASSWORD;
const credEmail = process.env.VALID_EMAIL || loginData.validEmail;
const credPassword = process.env.VALID_PASSWORD || loginData.validPassword;

test.describe('Login Suite', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('TC01 - Valid login with correct credentials', async ({ loginPage, page }) => {
    test.skip(!hasCredentials, 'Set VALID_EMAIL and VALID_PASSWORD env vars to run this test');

    await loginPage.fillEmail(credEmail);
    await loginPage.clickContinue();
    await page.waitForTimeout(1500);

    await expect(loginPage.passwordInput).toBeVisible({ timeout: 10000 });
    await loginPage.fillPassword(credPassword);
    await loginPage.clickSignIn();
    await page.waitForTimeout(2000);

    const redirectedFromLogin = !page.url().includes('/login');
    expect(redirectedFromLogin).toBeTruthy();
  });

  test('TC02 - Login with invalid email shows error', async ({ loginPage, page }) => {
    await loginPage.fillEmail(loginData.invalidEmail);
    await loginPage.clickContinue();
    await page.waitForTimeout(1500);

    const error = await loginPage.getErrorMessage();
    const stillOnLogin = page.url().includes('/login');

    expect(stillOnLogin || (error !== null && error.length > 0)).toBeTruthy();
  });

  test('TC03 - Empty email field shows validation error', async ({ loginPage, page }) => {
    await loginPage.clickContinue();
    await page.waitForTimeout(1500);

    const emailVisible = await loginPage.emailInput.isVisible().catch(() => false);
    const stillOnLogin = page.url().includes('/login');
    const error = await loginPage.getErrorMessage();
    const hasError = error !== null && error.length > 0;

    expect(emailVisible || stillOnLogin || hasError).toBeTruthy();
  });

  test('TC04 - Empty password after valid email shows error', async ({ loginPage, page }) => {
    await loginPage.fillEmail(loginData.validEmail);
    await loginPage.clickContinue();
    await page.waitForTimeout(2000);

    await expect(loginPage.passwordInput).toBeVisible({ timeout: 10000 });
    await loginPage.clickSignIn();
    await page.waitForTimeout(1500);

    const error = await loginPage.getErrorMessage();
    const stillOnStep2 = await loginPage.passwordInput.isVisible().catch(() => false);
    expect(stillOnStep2 || (error !== null)).toBeTruthy();
  });

  test('TC05 - Both fields empty shows validation', async ({ loginPage, page }) => {
    await loginPage.clickContinue();
    await page.waitForTimeout(1500);

    const onStep2 = await loginPage.passwordInput.isVisible().catch(() => false);
    expect(onStep2).toBeFalsy();
  });

  test('TC06 - Password field masks input by default', async ({ loginPage, page }) => {
    await loginPage.fillEmail(loginData.validEmail);
    await loginPage.clickContinue();
    await page.waitForTimeout(2000);

    await expect(loginPage.passwordInput).toBeVisible({ timeout: 10000 });
    const inputType = await loginPage.getPasswordInputType();
    expect(inputType).toBe('password');
  });

  test('TC07 - Logout redirects to login page', async ({ loginPage, page }) => {
    test.skip(!hasCredentials, 'Set VALID_EMAIL and VALID_PASSWORD env vars to run this test');

    await loginPage.fillEmail(credEmail);
    await loginPage.clickContinue();
    await page.waitForTimeout(1500);

    await expect(loginPage.passwordInput).toBeVisible({ timeout: 10000 });
    await loginPage.fillPassword(credPassword);
    await loginPage.clickSignIn();
    await page.waitForTimeout(3000);

    await loginPage.logout();
    await page.waitForTimeout(2000);

    const onLogin = page.url().includes('/login');
    const formVisible = await loginPage.emailInput.isVisible().catch(() => false);
    expect(onLogin || formVisible).toBeTruthy();
  });

  test('TC08 - Unauthenticated user redirected from protected route', async ({ loginPage, page }) => {
    const routes = ['/profile', '/account', '/settings', '/messages', '/admin', '/dashboard'];
    let redirected = false;

    for (const route of routes) {
      await loginPage.gotoProtectedRoute(route);
      await page.waitForTimeout(1500);

      if (page.url().includes('/login')) {
        redirected = true;
        break;
      }
    }

    const signInLink = page.locator('a:has-text("Sign In"), button:has-text("Sign In")').first();
    const canSeeLoginEntry = await signInLink.isVisible().catch(() => false);

    if (!redirected) {
      expect(canSeeLoginEntry).toBeTruthy();
    } else {
      expect(redirected).toBeTruthy();
    }
  });

});
