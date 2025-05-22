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
  const homePage = new HomePage(page);
  const credentials = roleCredentials[targetRole];

  if (!credentials || !credentials.username) {
    throw new Error(`Credentials for role '${targetRole}' are missing or incomplete.`);
  }

  const loginKey = targetRole;
  const appBaseUrl = process.env.TEST_URL || 'http://localhost:3300';
  if (!appBaseUrl) {
    throw new Error('Application base URL (process.env.TEST_URL or fallback) is not defined.');
  }

  const escapedAppBaseUrl = appBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const targetAppUrlPattern = new RegExp(`^${escapedAppBaseUrl.replace(/\/$/, '')}(\/.*)?$`);
  const loginUrlPattern = /.*idam-web-public.*/;

  let needsLogin = !hasLoggedIn[loginKey];

  console.log(`[Auth] Role: ${targetRole}. Initial needsLogin: ${needsLogin} (hasLoggedIn: ${!!hasLoggedIn[loginKey]})`);


  if (!needsLogin) {
    console.log(`[Auth] Role: ${targetRole}. Verifying existing session via UI elements.`);
    try {
      await homePage.goto();
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

      let isCorrectRoleAccordingToUI = false;
      if (targetRole === 'superAdmin') {
        isCorrectRoleAccordingToUI = await homePage.isSuperAdmin();
      } else if (targetRole === 'admin') {
        isCorrectRoleAccordingToUI = await homePage.isAdmin();
      } else if (targetRole === 'viewer') {
        isCorrectRoleAccordingToUI = await homePage.isViewer();
      } else if (targetRole === 'noRole') {
        const onAppPage = targetAppUrlPattern.test(page.url());
        const notAdmin = !(await homePage.isAdmin());
        const notSuperAdmin = !(await homePage.isSuperAdmin());
        const notViewer = !(await homePage.isViewer());
        isCorrectRoleAccordingToUI = onAppPage && notAdmin && notSuperAdmin && notViewer;
        if (!isCorrectRoleAccordingToUI) console.log(`   [Auth] UI check for 'noRole' on ${page.url()} failed. OnApp: ${onAppPage}, NotAdmin: ${notAdmin}, NotSuper: ${notSuperAdmin}, NotViewer: ${notViewer}`);
      } else {
        console.warn(`[Auth] Role: ${targetRole}. No UI verification method defined. Assuming session is OK if present.`);
        isCorrectRoleAccordingToUI = true;
      }

      if (isCorrectRoleAccordingToUI) {
        console.log(`   [Auth] UI Role for '${targetRole}' verified successfully.`);
      } else {
        console.log(`   [Auth] UI Role check FAILED for '${targetRole}'. Expected '${targetRole}', but UI elements do not match. Forcing re-login.`);
        needsLogin = true;
        hasLoggedIn[loginKey] = false;
      }
    } catch (verificationError) {
      console.error(`   [Auth] Error during UI role verification for '${targetRole}' (URL: ${page.url()}): ${verificationError.message}. Forcing re-login.`);
      needsLogin = true;
      hasLoggedIn[loginKey] = false;
    }
  }

  if (needsLogin) {
    console.log(`[Auth] Role: ${targetRole}. Login required.`);

    const currentUrl = page.url();
    if (targetAppUrlPattern.test(currentUrl) && !loginUrlPattern.test(currentUrl)) {
      console.log(`   [Auth] Currently on an app page (${currentUrl}). Attempting logout via HomePage.logout().`);
      await homePage.logout();
      console.log(`   [Auth] After homePage.logout(), current URL is: ${page.url()}`);
    } else {
      console.log(`   [Auth] Not on a known app page or already on IDAM (${currentUrl}). Skipping HomePage.logout().`);
    }

    if (!loginUrlPattern.test(page.url())) {
      console.log(`   [Auth] Not on IDAM page. Clearing cookies and navigating via loginPage.goto() (to '/').`);
      try {
        await page.context().clearCookies();
        console.log(`      [Auth] Cookies cleared.`);
      } catch (e) {
        console.error(`      [Auth] FAILED to clear cookies: ${e.message}`);
      }
      await loginPage.goto();
    } else {
      console.log(`   [Auth] Already on IDAM page (${page.url()}). Proceeding to fill credentials.`);
    }

    console.log(`   [Auth] Expecting IDAM URL. Current URL is: ${page.url()}`);
    await expect(page).toHaveURL(loginUrlPattern, { timeout: 10000 });
    console.log(`   [Auth] On IDAM page. Logging in with user: ${credentials.username}`);
    await loginPage.login(credentials.username, credentials.password);

    const errorLocator = page.locator('.error-summary');
    if (await errorLocator.isVisible({ timeout: 2000 })) {
      const errorMessage = await errorLocator.textContent();
      console.error(`   [Auth] Login failed on IDAM page for '${targetRole}': ${errorMessage}`);
      throw new Error(`Login failed for role ${targetRole} (IDAM Error): ${errorMessage}`);
    }

    console.log(`   [Auth] IDAM login successful for '${targetRole}'. Waiting for redirection to application.`);
    await expect(page).toHaveURL(targetAppUrlPattern, { timeout: 15000 });

    hasLoggedIn[loginKey] = true;
    if (testInfo && testInfo.file) {
      await updateCounts(testInfo.file);
    } else {
      // This log is useful if updateCounts is critical and might be missed
      console.warn(`[Auth] testInfo.file not available for role '${targetRole}', skipping updateCounts.`);
    }
    console.log(`   [Auth] Successfully logged in as '${targetRole}'. Current URL: ${page.url()}`);
  } else {
    console.log(`[Auth] Role: ${targetRole}. Session already active and verified by UI check. Proceeding.`);
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
