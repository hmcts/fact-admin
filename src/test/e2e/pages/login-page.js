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

    // Try filling username with explicit wait
    await this.page.waitForSelector(this.usernameInput);
    console.log('Username field found');
    await this.page.fill(this.usernameInput, username);
    console.log('Username filled');

    // Try filling password with explicit wait
    await this.page.waitForSelector(this.passwordInput);
    console.log('Password field found');
    await this.page.fill(this.passwordInput, password);
    console.log('Password filled');

    // Debug step - let's see what values ended up in the fields
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
