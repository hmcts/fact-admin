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
    console.log('Starting login');

    await this.page.waitForSelector(this.usernameInput);
    await this.page.fill(this.usernameInput, username);
    console.log('Username filled');

    await this.page.waitForSelector(this.passwordInput);
    await this.page.fill(this.passwordInput, password);
    console.log('Password filled');

    console.log('Pushing sign in button');

    await Promise.all([
      this.page.waitForNavigation({
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      }),
      this.page.click(this.signInButton)
    ]);
  }

  async isOnLoginPage() {
    return this.page.url().includes('idam-web-public.aat.platform.hmcts.net/login');
  }
}

module.exports = { LoginPage };
