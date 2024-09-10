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
  output: '../../../functional-output/codecept/reports',
  tests: './src/test/functional',
  plugins: {
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy'
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
    autoDelay: {
      enabled: true,
      delayAfter: 1000,
    },
    coverage: {
      enabled: true,
      debug: true,
      name: 'CodeceptJS Coverage Report',
      outputDir: 'functional-output/codecept/reports/coverage'
    },
    autoLogin: {
      enabled: true,
      saveToFile: true,
      users: {
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
