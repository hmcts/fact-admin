import {config} from '../config';

export const puppeteerConfig = {
  headless: config.TestHeadlessBrowser,
  slowMo: config.TestSlowMo,
  ignoreHTTPSErrors: true,
  'ignore-certificate-errors': true,
  defaultTimeout: 60 * 1000,
  args: [
    '--no-sandbox',
    '--window-size=1440,1400',
  ],
  username: '',
  viewerUsername: '',
  superUsername: '',
  password: '',
  waitForInitialPage: true,
  userDataDir: './src/test/functional/user_data'
};
