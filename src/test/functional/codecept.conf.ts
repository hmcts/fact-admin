import { config as testConfig } from '../config';

import SupportObject = CodeceptJS.SupportObject;
const { setHeadlessWhen } = require('@codeceptjs/configure');
const event = require('codeceptjs').event;

setHeadlessWhen(testConfig.TestHeadlessBrowser);

export const config: CodeceptJS.MainConfig = {
  name: 'functional',
  gherkin: {
    features: './codecept-features/**/*.feature',
    steps: './codecept-steps/**/*.ts',
  },
  output: '../../../functional-output/codecept/reports',
  helpers: testConfig.helpers,
  tests: './src/test/functional',
  retry: 3,
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

// Custom log output for test progress
let completedTests = 0;
let totalTests = 0;

event.dispatcher.on(event.suite.before, (suite) => {
  totalTests += suite.tests.length;
});

event.dispatcher.on(event.test.passed, (test) => {
  completedTests++;
  console.log(`Test Passed: ${test.title}`);
  console.log(`Completed: ${completedTests}/${totalTests}`);
});

event.dispatcher.on(event.test.failed, (test) => {
  completedTests++;
  console.log(`Test Failed: ${test.title}`);
  console.log(`Completed: ${completedTests}/${totalTests}`);
});