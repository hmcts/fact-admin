// auth.setup.js
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
      // Attempt to create the lock directory.  This will fail if it exists.
      fs.mkdirSync(lockDirPath);

      // If we get here, we have the lock.
      let loginCounts = {};
      try {
        if (fs.existsSync(countsFilePath)) {
          loginCounts = JSON.parse(fs.readFileSync(countsFilePath, 'utf8'));
        }
      } catch (readError) {
        console.error('Error reading or parsing loginCounts.json:', readError);
        // If there's an error reading, we still try to proceed with an empty object.
      }

      if (!loginCounts[testFilePath]) {
        loginCounts[testFilePath] = 0;
      }
      loginCounts[testFilePath]++;

      try {
        fs.writeFileSync(countsFilePath, JSON.stringify(loginCounts, null, 2), 'utf8');
      } catch (writeError) {
        console.error('Error writing loginCounts.json:', writeError);
        // If we fail to write, we should *not* release the lock yet; retry.
        continue;
      }

      // Successfully read, updated, and wrote.  Release the lock.
      fs.rmdirSync(lockDirPath);
      return;

    } catch (error) {
      // If mkdirSync fails, another process has the lock (or there's a different error).
      if (error.code === 'EEXIST') {
        // Wait and retry.
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        // Some other error.
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
  noRole: {
    username: process.env.OAUTH_TEST_USER_NO_ROLE,
    password: process.env.OAUTH_USER_PASSWORD
  }
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
  const loginKey = `${testFilePath}-${role}`; // Unique key per file and role

  // Check if we've already logged in for this role and file.
  if (!hasLoggedIn[loginKey]) {
    await loginPage.goto();
    await expect(page).toHaveURL(/.*idam-web-public.*/);
    await loginPage.login(credentials.username, credentials.password);
    await updateCounts(testFilePath); // Update counts - only if we haven't logged in yet
    hasLoggedIn[loginKey] = true;
  }

  // Wait for a more reliable indicator of successful login.
  await page.waitForSelector('#logout', { timeout: 20000 });
}

async function logWithColor(testInfo, message) {
  const chalk = (await import('chalk')).default;
  const colors =  ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'cyanBright', 'magentaBright', 'redBright'];
  const colorIndex = stringHash(testInfo.title) % colors.length;  // Hash the title!
  const color = colors[colorIndex];
  console.log(chalk[color](`[${testInfo.title}] ${message}`));
}

//Gets a consistent, unique colour
function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to a 32-bit integer
  }
  return Math.abs(hash); // Ensure the hash is positive
}

module.exports.logWithColor = logWithColor;
