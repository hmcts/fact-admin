import { config as testConfig } from '../config';
// import { defineConfig } from '@playwright/test';
//
// export default defineConfig({
//   retries: 2,
//   repeatEach: 3,
//
// });

const { setHeadlessWhen } = require('@codeceptjs/configure');

setHeadlessWhen(testConfig.TestHeadlessBrowser);

export const config: CodeceptJS.MainConfig = {
  name: 'functional',
  gherkin: {
    features: './codecept-features/super_admin/court-lock.feature',
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

    retry: 3,


    // retryFailedStep: {
    //   enabled: true,
    // },
    // retryTo: {
    //   enabled: true,
    //   Scenario: 3,
    // },
    //
    // retry: {
    //   Scenario: 3,
    // },
    //
    // tryTo: {
    //   enabled: true,
    // },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
  },
};
