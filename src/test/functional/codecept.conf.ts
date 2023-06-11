import { config as testConfig } from '../config';

const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(testConfig.TestHeadlessBrowser);

export const config: CodeceptJS.MainConfig = {
  name: 'functional',
  gherkin: testConfig.Gherkin,
  output: '../../../functional-output/functional/reports',
  helpers: testConfig.helpers,
  tests: './src/test/functional',
  plugins: {
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy',
    },
    retryFailedStep: {
      enabled: true,
      retries: 5,
    },
    tryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
  },
};
