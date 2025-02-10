class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async logout() {
    await this.page.click('#logout');
  }
  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = { BasePage };
