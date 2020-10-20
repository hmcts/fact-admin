import { BeforeAll, AfterAll, After, setDefaultTimeout } from 'cucumber';
import puppeteer from 'puppeteer';
import { puppeteerConfig } from '../puppeteer.config';

const scope = require('./scope');

setDefaultTimeout(puppeteerConfig.defaultTimeout);

BeforeAll(async () => {
  scope.browser = await puppeteer.launch(puppeteerConfig);
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
