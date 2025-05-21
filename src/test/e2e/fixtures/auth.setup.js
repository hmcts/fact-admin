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
  const testFilePath = testInfo.file;
  const loginKey = role; // Login once per role per worker process

  const targetAppUrlPattern = process.env.CI ? new RegExp(`.*${process.env.TEST_URL}.*`)   : /.*localhost:3300.*/; // App base URL pattern after login
  const loginUrlPattern = /.*idam-web-public.*/; // Login page URL pattern

  let needsLogin = !hasLoggedIn[loginKey]; // Assume login needed if never logged in this worker

  if (hasLoggedIn[loginKey]) {
    // If we think we are logged in, quickly verify by checking if we can access a protected page without redirect
    console.log(`Verifying existing session for role: ${role}...`);
    const checkUrl = process.env.ci ? new RegExp(`.*${process.env.TEST_URL}.*`)   : /.*localhost:3300.*/;
    console.log(`   Navigating briefly to ${checkUrl} to check session...`);
    try {
        // Go to the check page and wait for it to roughly load
        await page.goto(checkUrl, { waitUntil: 'domcontentloaded', timeout: 7000 });
        // Assert quickly that we are NOT on the login page URL
        await expect(page).not.toHaveURL(loginUrlPattern, { timeout: 3000 });
        // Optionally, assert we ARE on the app domain (or the specific checkUrl)
        await expect(page).toHaveURL(targetAppUrlPattern, { timeout: 3000 });
        console.log(`   Session appears valid (current URL: ${page.url()}).`);
        needsLogin = false; // Explicitly confirm login is not needed
    } catch (e) {
        // If any check fails (timeout, wrong URL), session is likely invalid
        console.log(`   Session check failed or redirected to login. Error: ${e.message}. Forcing re-login.`);
        needsLogin = true;
        hasLoggedIn[loginKey] = false; // Reset flag as we determined session is invalid
    }
  }

  if (needsLogin) {
    console.log(`Login required for role: ${role}`);
    await loginPage.goto(); // Go to login page
    await expect(page).toHaveURL(loginUrlPattern, { timeout: 10000 }); // Wait for login page URL
    console.log(`Attempting login for role: ${role}, user: ${credentials.username}`);
    await loginPage.login(credentials.username, credentials.password);

    // Check for login errors *before* waiting for app URL
    const errorLocator = page.locator('.error-summary'); // Adjust if error selector is different
    if (await errorLocator.isVisible({ timeout: 3000 })) { // Quick check for error summary
      const errorMessage = await errorLocator.textContent();
      console.error(`Login failed for role ${role}: ${errorMessage}`);
      throw new Error(`Login failed for role ${role}: ${errorMessage}`);
    }

    console.log(`Login successful for role: ${role}`);
    // Wait for navigation *after* successful login, back to the app domain
    await expect(page).toHaveURL(targetAppUrlPattern, { timeout: 15000 }); // Wait longer to ensure redirection to app happens

    // Only update counts and flag if login was actually performed and successful
    await updateCounts(testFilePath);
    hasLoggedIn[loginKey] = true;
    console.log('Current URL after successful login:', page.url());
  } else {
    console.log(`Session for role ${role} verified. Proceeding with test using existing session.`);
    // No navigation needed here, beforeEach will handle it.
  }
  // The fixture provides the 'page' object in the correct authenticated state (or newly authenticated).
  // The test's beforeEach will handle navigating to the specific test page.
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
