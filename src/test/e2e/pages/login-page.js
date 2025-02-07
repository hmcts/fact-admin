const { BasePage } = require('./base-page');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = 'input#username[name="username"]';
    this.passwordInput = 'input#password[name="password"]';
    this.signInButton = 'input.button[type="submit"][name="save"]';
  }

  async login(username, password) {
    console.log('Starting login with username:', username);

    await this.page.waitForSelector(this.usernameInput);
    console.log('Username field found');
    await this.page.fill(this.usernameInput, username);
    console.log('Username filled');

    await this.page.waitForSelector(this.passwordInput);
    console.log('Password field found');
    await this.page.fill(this.passwordInput, password);
    console.log('Password filled');

    const usernameValue = await this.page.$eval(this.usernameInput, el => el.value);
    const passwordValue = await this.page.$eval(this.passwordInput, el => el.value);
    console.log('Final field values - username:', usernameValue, 'password length:', passwordValue.length);

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
