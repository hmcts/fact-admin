const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Go to the application - should redirect to login
  await loginPage.goto();

  // Verify we got redirected to login page
  await expect(async () => {
    const onLoginPage = await loginPage.isOnLoginPage();
    expect(onLoginPage).toBeTruthy();
  }).toPass();

  console.log('Attempting login...');

  // Perform login
  await loginPage.login(
    process.env.OAUTH_USER,
    process.env.OAUTH_USER_PASSWORD
  );

  console.log('Login attempted, checking redirect...');

  // Verify we got redirected back to the application

  await expect(page).toHaveURL(process.env.TEST_URL || 'localhost:3300');
});
