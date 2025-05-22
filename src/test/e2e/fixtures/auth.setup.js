// fixtures/auth.setup.js
const { test: base, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const fs = require('fs');
const path = require('path');

const countsFilePath = path.join(__dirname, '..', 'loginCounts.json');
const lockDirPath = path.join(__dirname, '..', 'loginCounts.lock'); // Directory for locking

// Tracks whether a login has occurred for a given role. Scoped per worker.
const hasLoggedIn = {};

// Atomic read-modify-write with directory locking
async function updateCounts(testFilePath) {
  const maxRetries = 10;
  const retryDelay = 100; // Milliseconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Attempt to create the lock directory atomically
      fs.mkdirSync(lockDirPath);
      // If successful, we hold the lock

      let loginCounts = {};
      try {
        if (fs.existsSync(countsFilePath)) {
          const fileContent = fs.readFileSync(countsFilePath, 'utf8');
          // Handle empty file case
          if (fileContent.trim() !== '') {
            loginCounts = JSON.parse(fileContent);
          }
        }
      } catch (readError) {
        console.error('Error reading or parsing loginCounts.json:', readError);
        // Initialize empty if read fails
        loginCounts = {};
      }

      // Ensure the test file path exists as a key
      if (!loginCounts[testFilePath]) {
        loginCounts[testFilePath] = 0;
      }
      loginCounts[testFilePath]++;

      try {
        fs.writeFileSync(countsFilePath, JSON.stringify(loginCounts, null, 2), 'utf8');
      } catch (writeError) {
        console.error('Error writing loginCounts.json:', writeError);
        // Release lock before potentially retrying or throwing
        try { fs.rmdirSync(lockDirPath); } catch (e) { /* ignore removal error */ }
        // Decide whether to retry or throw based on write error (optional)
        continue; // Simple retry for now
      }

      // Release lock on success
      fs.rmdirSync(lockDirPath);
      return; // Exit loop on success

    } catch (error) {
      if (error.code === 'EEXIST') {
        // Lock directory already exists, wait and retry
        // console.log(`Lock exists, retrying attempt ${attempt + 1}...`); // Optional debug log
        await new Promise(resolve => setTimeout(resolve, retryDelay + Math.random() * 50)); // Add jitter
      } else {
        // Handle other unexpected errors during lock acquisition
        console.error('Unexpected error acquiring lock:', error);
        // Attempt to release lock just in case, though state is uncertain
        try { fs.rmdirSync(lockDirPath); } catch (e) { /* ignore removal error */ }
        throw error; // Re-throw unexpected errors
      }
    }
  }
  // If loop completes without success
  console.error(`Failed to acquire lock for ${countsFilePath} after ${maxRetries} attempts.`);
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

// --- Fixture Definition ---
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
  // Keep the default page fixture available if tests don't need auto-login
  page: async ({ page }, use) => {
    await use(page);
  }
});

// --- Login Helper Function ---
async function loginWithRole(page, role, testInfo) {
  const loginPage = new LoginPage(page);
  const credentials = roleCredentials[role];
  if (!credentials || !credentials.username) {
    throw new Error(`Credentials not found or incomplete for role: ${role}. Check environment variables.`);
  }

  const loginKey = role;

  const appBaseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';
  if (!appBaseUrl) {
    throw new Error('TEST_URL environment variable is not set or is empty.');
  }

  const escapedAppBaseUrl = appBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const targetAppUrlPattern = new RegExp(`.*${escapedAppBaseUrl}.*`);
  const loginUrlPattern = /.*idam-web-public.*/;

  let needsLogin = !hasLoggedIn[loginKey];

  if (hasLoggedIn[loginKey]) {
    console.log(`Verifying existing session for role: ${role}...`);
    try {
      console.log(`   Session Check: Navigating to app base URL: ${appBaseUrl} with 'networkidle'.`);
      // Increased timeout and using 'networkidle' for more stability on CI
      await page.goto(appBaseUrl, { waitUntil: 'networkidle', timeout: 12000 }); // Increased from 7000ms
      const currentUrlAfterGoto = page.url();
      console.log(`   Session Check: Current URL after goto: ${currentUrlAfterGoto}`);

      console.log(`   Session Check: Verifying NOT on login URL (${loginUrlPattern}).`);
      // Increased timeout for assertions
      await expect(page).not.toHaveURL(loginUrlPattern, { timeout: 6000 }); // Increased from 3000ms
      console.log(`   Session Check: Successfully verified NOT on login URL.`);

      console.log(`   Session Check: Verifying ON target app URL (${targetAppUrlPattern}).`);
      await expect(page).toHaveURL(targetAppUrlPattern, { timeout: 6000 }); // Increased from 3000ms
      console.log(`   Session Check: Successfully verified ON target app URL. Session appears valid for role ${role}.`);
      needsLogin = false;
    } catch (e) {
      const urlAtFailure = page.url(); // Capture URL at the point of failure
      console.error(`>>> SESSION CHECK FAILED for role ${role} <<<`);
      console.error(`    URL at point of failure: ${urlAtFailure}`);
      console.error(`    Error message: ${e.message}`);
      // Provide more context based on error type
      if (e.message.includes('page.goto') && e.message.includes('Timeout')) {
        console.error(`    Hint: page.goto('${appBaseUrl}') timed out. The application might be slow or unresponsive.`);
      } else if (e.message.includes('toHaveURL') && e.message.includes(loginUrlPattern.toString())) {
        console.error(`    Hint: Expected NOT to be on login URL, but was. Page URL: ${urlAtFailure}. Session likely expired.`);
      } else if (e.message.includes('toHaveURL') && e.message.includes(targetAppUrlPattern.toString())) {
        console.error(`    Hint: Expected to be on target app URL, but was not. Page URL: ${urlAtFailure}. Possible redirection to an unexpected page.`);
      }
      console.error(`    Forcing re-login due to this session check failure.`);
      needsLogin = true;
      hasLoggedIn[loginKey] = false; // Mark session as untrusted/invalid
    }
  }

  if (needsLogin) {
    console.log(`Login required for role: ${role}.`);
    await loginPage.goto();
    // This is where your current error occurs
    await expect(page).toHaveURL(loginUrlPattern, { timeout: 10000 });
    console.log(`Attempting login for role: ${role}, user: ${credentials.username}`);
    await loginPage.login(credentials.username, credentials.password);

    const errorLocator = page.locator('.error-summary');
    if (await errorLocator.isVisible({ timeout: 2000 })) {
      const errorMessage = await errorLocator.textContent();
      console.error(`Login failed for role ${role}: ${errorMessage}`);
      throw new Error(`Login failed for role ${role}: ${errorMessage}`);
    }

    console.log(`Login successful for role: ${role}. Verifying redirection to application.`);
    await expect(page).toHaveURL(targetAppUrlPattern, { timeout: 15000 });

    await updateCounts(testInfo.file);
    hasLoggedIn[loginKey] = true;
    console.log(`   Successfully logged in as ${role}. Current URL: ${page.url()}`);
  } else {
    console.log(`Session for role ${role} already active. Proceeding with test.`);
  }
}

// --- Utility Functions (Unchanged) ---
async function logWithColor(testInfo, message) {
  // Dynamically import chalk only if needed and available
  try {
    const chalk = (await import('chalk')).default;
    const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'cyanBright', 'magentaBright', 'redBright'];
    const colorIndex = stringHash(testInfo.title) % colors.length;
    const color = colors[colorIndex];
    console.log(chalk[color](`[${testInfo.title}] ${message}`));
  } catch (e) {
    // Fallback to standard console.log if chalk is not available
    console.log(`[${testInfo.title}] ${message}`);
  }
}

function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

module.exports.logWithColor = logWithColor;
