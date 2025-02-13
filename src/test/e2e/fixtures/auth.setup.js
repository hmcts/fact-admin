// auth.setup.js (Complete, with file locking and login counts)
const { test: base, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const fs = require('fs');
const path = require('path');

const countsFilePath = path.join(__dirname, '..', 'loginCounts.json');
const lockDirPath = path.join(__dirname, '..', 'loginCounts.lock'); // Directory for locking

// Tracks whether a login has occurred for a given role+file.
const hasLoggedIn = {};

// Atomic read-modify-write with directory locking
async function updateCounts(testFilePath) {
  const maxRetries = 10;
  const retryDelay = 100; // Milliseconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Attempt to create the lock directory. This will fail if it exists.
      fs.mkdirSync(lockDirPath);

      // If we get here, we have the lock.
      let loginCounts = {};
      try {
        if (fs.existsSync(countsFilePath)) {
          loginCounts = JSON.parse(fs.readFileSync(countsFilePath, 'utf8'));
        }
      } catch (readError) {
        console.error('Error reading or parsing loginCounts.json:', readError);
        // Proceed with an empty object.
      }

      if (!loginCounts[testFilePath]) {
        loginCounts[testFilePath] = 0;
      }
      loginCounts[testFilePath]++;

      try {
        fs.writeFileSync(countsFilePath, JSON.stringify(loginCounts, null, 2), 'utf8');
      } catch (writeError) {
        console.error('Error writing loginCounts.json:', writeError);
        // Retry.
        continue;
      }

      // Release the lock.
      fs.rmdirSync(lockDirPath);
      return;

    } catch (error) {
      if (error.code === 'EEXIST') {
        // Wait and retry.
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('Error acquiring or releasing lock:', error);
        throw error;
      }
    }
  }
  console.error(`Failed to acquire lock after ${maxRetries} attempts.`);
  throw new Error(`Failed to acquire lock after ${maxRetries} attempts.`);
}
const roleCredentials = {
  admin: {
    username: process.env.OAUTH_USER,
    password: process.env.OAUTH_USER_PASSWORD
  },
  viewer: {
    username: process.env.OAUTH_VIEWER_USER,
    password: process.env.OAUTH_USER_PASSWORD
  },
  superAdmin: {
    username: process.env.OAUTH_SUPER_USER,
    password: process.env.OAUTH_USER_PASSWORD
  },
  noRole: { username: process.env.OAUTH_TEST_USER_NO_ROLE, password: process.env.OAUTH_USER_PASSWORD }
};

exports.test = base.extend({
  adminPage: async ({ page }, use, testInfo) => {
    await loginWithRole(page, 'admin', testInfo);
    await use(page);
  },
  viewerPage: async ({ page }, use, testInfo) => {
    await loginWithRole(page, 'viewer', testInfo);
    await use(page);
  },
  superAdminPage: async ({ page }, use, testInfo) => {
    await loginWithRole(page, 'superAdmin', testInfo);
    await use(page);
  },
  noRolePage: async ({ page }, use, testInfo) => {
    await loginWithRole(page, 'noRole', testInfo);
    await use(page);
  },
  page: async ({ page }, use) => {
    await use(page);
  }
});

async function loginWithRole(page, role, testInfo) {
  const loginPage = new LoginPage(page);
  const credentials = roleCredentials[role];
  const testFilePath = testInfo.file;
  const loginKey = `${testFilePath}-${role}`;

  if (!hasLoggedIn[loginKey]) {
    await loginPage.goto();
    await expect(page).toHaveURL(/.*idam-web-public.*/);
    await loginPage.login(credentials.username, credentials.password);
    await updateCounts(testFilePath); // Update counts
    hasLoggedIn[loginKey] = true;
  }

  await page.waitForSelector('#logout', { timeout: 20000 });
}

async function logWithColor(testInfo, message) {
  const chalk = (await import('chalk')).default;
  const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'cyanBright', 'magentaBright', 'redBright'];
  const colorIndex = stringHash(testInfo.title) % colors.length;
  const color = colors[colorIndex];
  console.log(chalk[color](`[${testInfo.title}] ${message}`));
}

function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

module.exports.logWithColor = logWithColor;
