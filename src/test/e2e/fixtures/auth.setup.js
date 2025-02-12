const { test: base, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const fs = require('fs');
const path = require('path');

const countsFilePath = path.join(__dirname, '..', 'loginCounts.json');

function readCounts() {
  try {
    if (fs.existsSync(countsFilePath)) {
      const data = fs.readFileSync(countsFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading login counts file:", error);
  }
  return {};
}

function writeCounts(counts) {
  try {
    fs.writeFileSync(countsFilePath, JSON.stringify(counts, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing login counts file:", error);
  }
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
  adminPage: async ({ page }, use, testInfo) => { // Corrected parameter order
    await loginWithRole(page, 'admin', testInfo); // Pass testInfo
    await use(page);
  },

  viewerPage: async ({ page }, use, testInfo) => { // Corrected parameter order
    await loginWithRole(page, 'viewer', testInfo); // Pass testInfo
    await use(page);
  },

  superAdminPage: async ({ page }, use, testInfo) => { // Corrected parameter order
    await loginWithRole(page, 'superAdmin', testInfo); // Pass testInfo
    await use(page);
  },

  noRolePage: async ({ page }, use, testInfo) => { // Corrected parameter order
    await loginWithRole(page, 'noRole', testInfo); // Pass testInfo
    await use(page);
  },

  page: async ({ page }, use) => {
    await use(page);
  }
});

async function loginWithRole(page, role, testInfo) { // Accept testInfo
  const loginPage = new LoginPage(page);
  const credentials = roleCredentials[role];

  const testFilePath = testInfo.file; // Use testInfo directly

  const loginCounts = readCounts();

  if (!loginCounts[testFilePath]) {
    loginCounts[testFilePath] = 0;
  }

  await loginPage.goto();

  await expect(async () => {
    const onLoginPage = await loginPage.isOnLoginPage();
    expect(onLoginPage).toBeTruthy();
  }).toPass();

  await loginPage.login(credentials.username, credentials.password);
  loginCounts[testFilePath]++;

  writeCounts(loginCounts);

  const baseUrl = process.env.CI ? process.env.TEST_URL : 'localhost:3300';
  await expect(page.url()).not.toContain('idam-web-public.aat.platform.hmcts.net');
  await expect(page.url()).toContain(baseUrl);
}
