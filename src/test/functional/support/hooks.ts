import { BeforeAll, AfterAll, After, setDefaultTimeout } from 'cucumber';
import puppeteer from 'puppeteer';
import { puppeteerConfig } from '../puppeteer.config';
import {execSync} from 'child_process';

const scope = require('./scope');

export const launchBrowser = async () => {
  scope.browser = await puppeteer.launch(puppeteerConfig);
};

const getFromVault = (secret: string) => {
  const result = execSync('az keyvault secret show --vault-name fact-aat -o tsv --query value --name ' + secret);
  return result.toString().replace('\n', '');
};

setDefaultTimeout(puppeteerConfig.defaultTimeout);

BeforeAll(async () => {
  await launchBrowser();
  puppeteerConfig.username = getFromVault('oauth-user');
  puppeteerConfig.superUsername = getFromVault('oauth-super-user');
  puppeteerConfig.password = getFromVault('oauth-user-password');
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
