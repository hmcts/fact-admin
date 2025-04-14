const { BasePage } = require('./base-page');

class EditCourtPage extends BasePage {
  constructor(page) {
    super(page);
    this.generalDropdown = '.fact-tabs-title';
  }
}

module.exports = { EditCourtPage };
