import { BeforeAll, AfterAll, After, setDefaultTimeout } from 'cucumber';
import puppeteer from 'puppeteer';
import { puppeteerConfig } from '../puppeteer.config';

const scope = require('./scope');

export const launchBrowser = async () => {
  scope.browser = await puppeteer.launch(puppeteerConfig);
};

setDefaultTimeout(puppeteerConfig.defaultTimeout);

BeforeAll(async () => {
  await launchBrowser();
  puppeteerConfig.username = process.env.OAUTH_USER;
  puppeteerConfig.superUsername = process.env.OAUTH_SUPER_USER;
  puppeteerConfig.password = process.env.OAUTH_USER_PASSWORD;
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
