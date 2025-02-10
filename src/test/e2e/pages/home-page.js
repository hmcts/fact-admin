const { BasePage } = require('./base-page');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
  }

  async isSuperAdmin() {
    return await this.page.isVisible('#audits');
  }

  async isAdmin() {
    const hasEditLink = await this.page.isVisible('#edit-aberdeen-tribunal-hearing-centre');
    const hasAudits = await this.page.isVisible('#audits');
    return hasEditLink && !hasAudits;
  }

  async isViewer() {
    const detailsLink = await this.page.$('#edit-aberdeen-tribunal-hearing-centre');
    if (!detailsLink) return false;
    const text = await detailsLink.innerText();
    return text.trim() === 'details';
  }
}

module.exports = { BasePage, HomePage };
