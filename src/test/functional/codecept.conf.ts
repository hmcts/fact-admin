import { config as testConfig } from '../config';
const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(testConfig.TestHeadlessBrowser);

export const config: CodeceptJS.MainConfig = {
  name: 'functional',
  gherkin: {
    features: './codecept-features/admin/admin-login.feature',
    steps: './codecept-steps/**/*.ts',
  },
  output: '../../../functional-output/functional/reports',
  helpers: testConfig.helpers,
  tests: './src/test/functional',
  retry: 3,
  plugins: {
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy',
    },

    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
  },
};
