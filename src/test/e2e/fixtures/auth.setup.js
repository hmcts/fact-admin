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
  const homePage = new HomePage(page); // Instantiate HomePage
  const credentials = roleCredentials[targetRole];
  // ... (error if no credentials) ...

  const appBaseUrl = /* ... get from env ... */ ;
  const targetAppUrlPattern = /* ... regex for appBaseUrl ... */ ;
  const loginUrlPattern = /.*idam-web-public.*/;

  let needsLogin = !hasLoggedIn[targetRole];
  console.log(`[${targetRole}] Initial: needsLogin=${needsLogin} (hasLoggedIn[${targetRole}]=${hasLoggedIn[targetRole]})`);
  console.log(`[${targetRole}] Worker known sessions: ${JSON.stringify(hasLoggedIn)}`);

  if (!needsLogin) { // We think we're logged in as targetRole, let's verify
    console.log(`[${targetRole}] Verifying existing session using HomePage.is<Role> methods...`);
    await homePage.goto(); // Go to homepage to check elements
    await page.waitForLoadState('domcontentloaded');

    let isCorrectRole = false;
    try {
      if (targetRole === 'superAdmin') isCorrectRole = await homePage.isSuperAdmin();
      else if (targetRole === 'admin') isCorrectRole = await homePage.isAdmin();
      else if (targetRole === 'viewer') isCorrectRole = await homePage.isViewer();
      // Add other roles if necessary
      else isCorrectRole = true; // Assume OK for roles without a checker, or throw error

      if (isCorrectRole) {
        console.log(`   [${targetRole}] Role verified successfully via UI elements.`);
      } else {
        console.log(`   [${targetRole}] UI Role check FAILED. Expected '${targetRole}', but UI doesn't match. Forcing re-login.`);
        needsLogin = true;
        hasLoggedIn[targetRole] = false; // Our assumption was wrong
      }
    } catch (verificationError) {
      console.error(`   [${targetRole}] Error during UI role verification: ${verificationError.message}. Forcing re-login.`);
      needsLogin = true;
      hasLoggedIn[targetRole] = false;
    }
  }

  if (needsLogin) {
    console.log(`[${targetRole}] Login required for '${targetRole}'.`);

    // Attempt graceful logout first if on app domain, otherwise clear cookies
    if (page.url().startsWith(appBaseUrl) && !page.url().includes('idam-web-public')) {
      console.log(`   [${targetRole}] Attempting logout via HomePage.logout().`);
      await homePage.logout(); // Use your HomePage logout
      // After logout, we should ideally be on IDAM or a public page.
      // Check if already on IDAM after logout to avoid unnecessary loginPage.goto()
      if (loginUrlPattern.test(page.url())) {
        console.log(`   [${targetRole}] Already on IDAM page after logout.`);
      } else {
        // If not on IDAM, clear cookies as a fallback or if logout didn't redirect to IDAM
        console.log(`   [${targetRole}] Not on IDAM after logout attempt (URL: ${page.url()}). Clearing cookies.`);
        await page.context().clearCookies();
        await loginPage.goto(); // Navigate to trigger IDAM
      }
    } else {
      // Not on app domain, or already on IDAM, just clear cookies and go to login trigger
      console.log(`   [${targetRole}] Not on app domain or already on IDAM (URL: ${page.url()}). Clearing cookies.`);
      await page.context().clearCookies();
      await loginPage.goto(); // Navigate to trigger IDAM
    }

    console.log(`   [${targetRole}] URL before expecting IDAM: ${page.url()}`);
    await expect(page).toHaveURL(loginUrlPattern, { timeout: 10000 });
    // ... (rest of loginPage.login, error check, expect app URL, set hasLoggedIn) ...
    await loginPage.login(credentials.username, credentials.password);
    const errorLocator = page.locator('.error-summary');
    if (await errorLocator.isVisible({ timeout: 2000 })) { /* ... throw error ... */ }
    await expect(page).toHaveURL(targetAppUrlPattern, { timeout: 15000 });
    hasLoggedIn[targetRole] = true;
    await updateCounts(testInfo.file);
    console.log(`   [${targetRole}] Successfully logged in as '${targetRole}'.`);
  } else {
    console.log(`[${targetRole}] Session for '${targetRole}' active and verified.`);
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
