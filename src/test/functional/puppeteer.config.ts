import { config } from '../config';

export const puppeteerConfig = {
  headless: config.TestHeadlessBrowser,
  slowMo: config.TestSlowMo,
  ignoreHTTPSErrors: true,
  'ignore-certificate-errors': true,
  defaultTimeout: 0,
  args: [
    '--no-sandbox',
    '--window-size=1440,1400',
  ],
  username: '',
  superUsername: '',
  password: ''
};
