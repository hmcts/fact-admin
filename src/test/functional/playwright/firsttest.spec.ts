import { test as playwrightTest, expect as eggspect } from '@playwright/test';

playwrightTest('try add emails', async ({ page }) => {
  await page.goto('localhost:3300');

  await page.getByLabel('Email address').click();
  await page.getByLabel('Email address').fill('hmcts.super.fact@gmail.com');
  await page.getByLabel('Password').click();
  await page.getByLabel('Password').fill('Pa55word11');
  // await page.getByLabel('Password').press('Enter');

  await page.getByRole('button', { name: 'Sign in' }).click();
  // await page.waitForSelector('input.button[type="submit"][value="Sign in"]', { state: 'visible' });
  // await page.click('input.button[type="submit"][value="Sign in"]');

  await page.getByLabel('Edit Aberdeen Tribunal').click();
  await page.locator('#nav div').click();
  await page.getByRole('tab', { name: 'Emails' }).click();
  await page.getByText('Skip to main content GOV.UK').click();
  await page.locator('#emails-3').selectOption('39');
  await page.locator('#address-3').click();
  await page.locator('#address-3').fill('a.b@c.com');
  await page.locator('#explanation-3').click();
  await page.locator('#explanation-3').fill('test');
  await page.locator('#explanation-cy-3').click();
  await page.locator('#explanation-cy-3').fill('test');
  await page.getByRole('button', { name: 'Save' }).click();
  await eggspect(page.getByRole('heading', { name: 'Emails updated' })).toBeVisible();
});
