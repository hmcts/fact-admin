import {After, AfterAll, Before, BeforeAll, setDefaultTimeout} from 'cucumber';
import puppeteer from 'puppeteer';
import {puppeteerConfig} from '../puppeteer.config';
import {FeatureFlagHelper} from '../utlis/feature-flag-helper';
import fs from 'fs';
import path from 'path';

const scope = require('./scope');

export const launchBrowser = async () => {
  const userDataDir = path.join(process.cwd(), 'src', 'test', 'functional', 'user_data');
  if (fs.existsSync(userDataDir)) {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
  scope.browser = await puppeteer.launch({
    ...puppeteerConfig,
    userDataDir
  });
};

const f = new FeatureFlagHelper();
let allFlags: { [p: string]: boolean } = {};

setDefaultTimeout(puppeteerConfig.defaultTimeout);

BeforeAll(async () => {
  puppeteerConfig.username = process.env.OAUTH_USER;
  puppeteerConfig.viewerUsername = process.env.OAUTH_VIEWER_USER;
  puppeteerConfig.superUsername = process.env.OAUTH_SUPER_USER;
  puppeteerConfig.testUsername = process.env.OAUTH_TEST_USER_NO_ROLE;
  puppeteerConfig.password = process.env.OAUTH_USER_PASSWORD;

  await launchBrowser();
  await f.init();
  allFlags = f.getAllFlags() || {};
});

After(async () => {
  if (scope.page && scope.page.currentPage) {
    scope.page.currentPage.close();
  }
});

AfterAll(async () => {
  if (scope.browser) {
    await scope.browser.close();
  }
});

Before(async (scenario) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const falseTagValues = scenario.pickle.tags.filter(
    (item) => !allFlags[item.name.replace('@', '')]
  );
  return falseTagValues.length > 0 ? 'skipped' : 'run';
});
