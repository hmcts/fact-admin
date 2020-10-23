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
