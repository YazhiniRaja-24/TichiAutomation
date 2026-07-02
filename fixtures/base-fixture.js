const { test: base, expect } = require('@playwright/test');

const test = base.extend({
  loginPage: async ({ page }, use) => {
    const { LoginPage } = require('../pages/login-page');
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  cleanContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    await use(context);
    await context.close();
  },
});

module.exports = { test, expect };
