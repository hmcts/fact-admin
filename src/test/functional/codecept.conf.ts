import { config as testConfig } from '../config';

import SupportObject = CodeceptJS.SupportObject;
const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(testConfig.TestHeadlessBrowser);

export const config: CodeceptJS.MainConfig = {
  name: 'functional',
  gherkin: {
    features: './codecept-features/**/*.feature',
    steps: './codecept-steps/**/*.ts',
  },
  output: '../../../functional-output/functional/reports',
  helpers: testConfig.helpers,
  tests: './src/test/functional',
  plugins: {
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy',
    },
    pauseOnFail: {
      enabled: !testConfig.TestHeadlessBrowser,
    },
    retryFailedStep: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
    autoLogin: {
      enabled: true,
      saveToFile: true,
      users: {
        viewer: {
          login: (I: SupportObject['I']) => {
            I.amOnPage('/');
            I.fillField('username', testConfig.viewerUsername as string);
            I.fillField('password', testConfig.password as string);
            I.click('input[type="submit"][name="save"]');
          },
          check: async (I: SupportObject['I']) => {
            I.amOnPage('/courts');
            I.seeCookie('appSession');
          },
        },
        admin: {
          login: (I: SupportObject['I']) => {
            I.amOnPage('/');
            I.fillField('username', testConfig.username as string);
            I.fillField('password', testConfig.password as string);
            I.click('input[type="submit"][name="save"]');
          },
          check: async (I: SupportObject['I']) => {
            I.amOnPage('/courts');
            I.seeCookie('appSession');
          },
        },
        superAdmin: {
          login: (I: SupportObject['I']) => {
            I.amOnPage('/');
            I.fillField('username', testConfig.superUsername as string);
            I.fillField('password', testConfig.password as string);
            I.click('input[type="submit"][name="save"]');
          },
          check: async (I: SupportObject['I']) => {
            I.amOnPage('/courts');
            I.seeCookie('appSession');
          },
        },
      }
    }
  },
};
