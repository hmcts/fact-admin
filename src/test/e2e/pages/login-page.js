const { BasePage } = require('./base-page');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = 'input#username[name="username"]';
    this.passwordInput = 'input#password[name="password"]';
    this.signInButton = 'input.button[type="submit"][name="save"]';
  }

  // IMPORTANT NOTE - IF YOU ARE LOOKING AT THIS PAGE IT'S HIGHLY LIKELY YOU ARE MISSING AN ENVIRONMENT VARIABLE
  async login(username, password) {
    await this.page.waitForSelector(this.usernameInput);
    await this.page.fill(this.usernameInput, username);
    await this.page.waitForSelector(this.passwordInput);
    await this.page.fill(this.passwordInput, password);
    // Remove waitForNavigation and rely on the waitForSelector in auth.setup.js
    await this.page.click(this.signInButton);
  }

  async isOnLoginPage() {
    return this.page.url().includes('idam-web-public.aat.platform.hmcts.net/login');
  }
}

module.exports = { LoginPage };
