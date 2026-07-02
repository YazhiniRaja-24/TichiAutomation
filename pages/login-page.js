const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.continueButton = page.locator('button:has-text("Continue")');
    this.signInButton = page.locator('button:has-text("Sign In"), button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log In"), button:has-text("Submit"), button:has-text("Next")').first();
    this.forgotPasswordLink = page.locator('a:has-text("Forgot"), button:has-text("Forgot"), [class*="forgot"]').first();
    this.signUpLink = page.locator('a:has-text("Sign Up"), a:has-text("Register"), a:has-text("Create")').first();
    this.passwordToggle = page.locator('button.absolute');
    this.backButton = page.locator('[class*="back"], [aria-label*="back"]').first();
    this.emailDisplay = page.locator('text=test@example.com').first();
    this.errorMessage = page.locator('[class*="error"], [role="alert"]').first();
    this.heading = page.locator('h1, h2').first();
    this.form = page.locator('form').first();
  }

  async goto() {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() =>
      this.page.goto('/login', { waitUntil: 'load', timeout: 15000 })
    );
  }

  async fillEmail(email) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.emailInput.fill(email);
  }

  async clickContinue() {
    const visible = await this.continueButton.isVisible().catch(() => false);
    if (visible) {
      await this.continueButton.click();
    }
  }

  async fillPassword(password) {
    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordInput.fill(password);
  }

  async clickSignIn() {
    const visible = await this.signInButton.isVisible().catch(() => false);
    if (visible) {
      await this.signInButton.click();
    }
  }

  async clickForgotPassword() {
    if (await this.forgotPasswordLink.isVisible()) {
      await this.forgotPasswordLink.click();
    }
  }

  async clickSignUp() {
    if (await this.signUpLink.isVisible()) {
      await this.signUpLink.click();
    }
  }

  async login(email, password) {
    await this.goto();
    await this.fillEmail(email);
    await this.clickContinue();
    await this.page.waitForTimeout(2000);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  async getErrorMessage() {
    const errorLocator = this.page.locator('[class*="error"], [role="alert"], [class*="message"], .text-red-500, .error-message').first();
    if (await errorLocator.isVisible().catch(() => false)) {
      return await errorLocator.textContent();
    }
    return null;
  }

  async getPasswordInputType() {
    return await this.passwordInput.getAttribute('type');
  }

  async clickPasswordToggle() {
    if (await this.passwordToggle.isVisible().catch(() => false)) {
      await this.passwordToggle.click();
    }
  }

  async isOnStep2() {
    return await this.passwordInput.isVisible().catch(() => false);
  }

  async waitForNavigationTo(pathPattern) {
    await this.page.waitForURL(new RegExp(pathPattern), { timeout: 15000 }).catch(() => {});
  }

  async gotoProtectedRoute(route) {
    try {
      await this.page.goto(route, { waitUntil: 'load', timeout: 15000 });
    } catch {
      await this.page.waitForTimeout(1000);
    }
  }

  async logout() {
    await this.page.goto('/logout', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    const logoutBtn = this.page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout"), a:has-text("Sign Out")').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
      await this.page.waitForTimeout(2000);
    }
  }

  async clearFields() {
    await this.emailInput.clear().catch(() => {});
    await this.passwordInput.clear().catch(() => {});
  }

  async getAllLinks() {
    return this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button, [role="button"]')).map(el => ({
        tag: el.tagName,
        text: (el.innerText || '').substring(0, 80),
        href: el.href || el.getAttribute('href') || '',
        id: el.id || '',
      }));
    });
  }

  async getAllFormFields() {
    return this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea, select')).map(el => ({
        tag: el.tagName,
        name: el.getAttribute('name') || '',
        id: el.id || '',
        type: el.getAttribute('type') || '',
        placeholder: el.getAttribute('placeholder') || '',
        required: el.hasAttribute('required'),
      }));
    });
  }

  async getPageText() {
    return this.page.evaluate(() => {
      const clone = document.body.cloneNode(true);
      clone.querySelectorAll('script, style, svg, noscript').forEach(s => s.remove());
      return (clone.textContent || '').replace(/\s+/g, ' ').trim();
    });
  }
}

module.exports = { LoginPage };
