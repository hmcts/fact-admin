import {fail} from 'assert';
import Axios from 'axios';
import {config} from '../config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pa11y = require('pa11y');
const axios = Axios.create({ baseURL: config.TEST_URL });

class Pa11yResult {
  documentTitle: string;
  pageUrl: string;
  issues: PallyIssue[];
}

class PallyIssue {
  code: string;
  context: string;
  message: string;
  selector: string;
  type: string;
  typeCode: number;
}

function loginPally(): Promise<Pa11yResult> {
  return pa11y(config.TEST_URL + '/login', {
    hideElements: '.govuk-footer__licence-logo, .govuk-header__logotype-crown',
    actions: [
      'set field #username to hmcts.fact@gmail.com',
      'set field #password to Pa55word11',
      'click element .button',
      'wait for path to be /courts'
    ]
  });
}

beforeAll(async () => {
  await loginPally();
});

function ensurePageCallWillSucceed(url: string): Promise<void> {
  return axios.get(url);
}

function runPallyWith(url: string, actions: string[]): Pa11yResult {
  return pa11y(config.TEST_URL + url, {
    hideElements: '.govuk-footer__licence-logo, .govuk-header__logotype-crown',
    actions: actions
  });
}

function expectNoErrors(messages: PallyIssue[]): void {
  const errors = messages.filter(m => m.type === 'error');

  if (errors.length > 0) {
    const errorsAsJson = `${JSON.stringify(errors, null, 2)}`;
    fail(`There are accessibility issues: \n${errorsAsJson}\n`);
  }
}

function testAccessibilityWithActions(url: string, actions: string[]): void {
  describe(`Page ${url}`, () => {
    test('should have no accessibility errors', done => {
      ensurePageCallWillSucceed(url)
        .then(() => runPallyWith(url, actions))
        .then((result: Pa11yResult) => {
          expectNoErrors(result.issues);
          done();
        })
        .catch((err: Error) => done(err));
    });
  });

}

function testAccessibility(url: string): void {
  testAccessibilityWithActions(url, []);
}

describe('Accessibility', () => {
  testAccessibility('/');
  testAccessibility('/courts');
  testAccessibility('/courts/aberdare-county-court/edit/general');
  testAccessibility('/bulk-update');
  testAccessibility('/courts/add-court');
  testAccessibility('/users');
  testAccessibility('/courts/plymouth-combined-court/edit');
  testAccessibility('/lists');
  testAccessibility('/audits');
});
