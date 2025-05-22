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
async function loginWithRole(page, targetRole, testInfo) {
  const loginPage = new LoginPage(page);
  const credentials = roleCredentials[targetRole];

  if (!credentials || !credentials.username) {
    throw new Error(`[Auth] Credentials for role '${targetRole}' missing.`);
  }

  const loginKey = targetRole;
  const appBaseUrl = process.env.TEST_URL || 'http://localhost:3300';
  const targetAppUrlPattern = new RegExp(`.*${appBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`);
  const loginUrlPattern = /.*idam-web-public.*/;

  let needsLogin = !hasLoggedIn[loginKey];
  let reasonForLogin = needsLogin ? "initial or role switch" : "";

  console.log(`[Auth] Role: '${targetRole}'. Initial needsLogin: ${needsLogin} (hasLoggedIn['${loginKey}']: ${!!hasLoggedIn[loginKey]})`);

  if (!needsLogin) {
    console.log(`   [Auth] Role: '${targetRole}'. hasLoggedIn is true. Performing quick session validity check by navigating to app home.`);
    // BasePage.goto() navigates to '/'
    await page.goto(appBaseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const currentUrlAfterNav = page.url();

    if (loginUrlPattern.test(currentUrlAfterNav)) {
      console.log(`   [Auth] Role: '${targetRole}'. Quick check FAILED: Redirected to IDAM (${currentUrlAfterNav}). Session likely expired or invalid.`);
      needsLogin = true;
      hasLoggedIn[loginKey] = false;
      reasonForLogin = "session expired or was invalid after quick check";
    } else if (targetAppUrlPattern.test(currentUrlAfterNav)) {
      console.log(`   [Auth] Role: '${targetRole}'. Quick check PASSED: Still on app domain (${currentUrlAfterNav}). Assuming session is okay.`);
    } else {
      console.warn(`   [Auth] Role: '${targetRole}'. Quick check UNCERTAIN: Navigated to unexpected URL (${currentUrlAfterNav}). Assuming login needed for safety.`);
      needsLogin = true;
      hasLoggedIn[loginKey] = false;
      reasonForLogin = "unexpected URL after session check nav";
    }
  }

  if (needsLogin) {
    console.log(`[Auth] Role: '${targetRole}'. Login required (Reason: ${reasonForLogin}). Aggressively clearing client state.`);
    try {
      await page.context().clearCookies();
      console.log(`   [Auth] Cookies cleared for '${targetRole}' login.`);
      await page.evaluate(() => localStorage.clear());
      console.log(`   [Auth] localStorage cleared for '${targetRole}' login.`);
      await page.evaluate(() => sessionStorage.clear());
      console.log(`   [Auth] sessionStorage cleared for '${targetRole}' login.`);
    } catch (e) {
      console.error(`   [Auth] FAILED to clear client state for '${targetRole}': ${e.message}.`);
    }

    console.log(`   [Auth] Role: '${targetRole}'. Navigating via loginPage.goto() (to '/') with 'domcontentloaded'.`);

    await page.goto(appBaseUrl + '/', { waitUntil: 'domcontentloaded', timeout: 10000 });

    const urlAfterGoto = page.url();
    console.log(`   [Auth] Role: '${targetRole}'. URL after loginPage.goto('/'): ${urlAfterGoto}`);

    console.log(`   [Auth] Role: '${targetRole}'. Adding short pre-expect delay.`);
    await page.waitForTimeout(500); // Brief pause before assertion

    console.log(`   [Auth] Role: '${targetRole}'. Expecting IDAM URL. Current URL is: ${page.url()}`);
    await expect(page).toHaveURL(loginUrlPattern, { timeout: 12000 });

    console.log(`   [Auth] Role: '${targetRole}'. On IDAM page. Logging in.`);
    await loginPage.login(credentials.username, credentials.password);

    const errorLocator = page.locator('.error-summary');
    if (await errorLocator.isVisible({ timeout: 3000 })) {
      const errMsg = await errorLocator.textContent();
      console.error(`   [Auth] Login failed on IDAM for '${targetRole}': ${errMsg}`);
      throw new Error(`Login failed for role ${targetRole} (IDAM Error): ${errMsg}`);
    }

    console.log(`   [Auth] Role: '${targetRole}'. IDAM login success. Expecting app redirect.`);
    await expect(page).toHaveURL(targetAppUrlPattern, { timeout: 18000 });

    hasLoggedIn[loginKey] = true;
    if (testInfo && testInfo.file) {
      await updateCounts(testInfo.file);
    }
    console.log(`   [Auth] Role: '${targetRole}'. Successfully logged in. URL: ${page.url()}`);

  } else {
    console.log(`[Auth] Role: '${targetRole}'. Session active and quick check passed. Proceeding.`);
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
