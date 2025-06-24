import { test, expect } from '@playwright/test';

test('Sign in and continue an in-progress CBT test', async ({ page }) => {
  // Step 1: Go to the sign-in page
  await page.goto('http://localhost:5173/signin');

  // Step 2: Fill in email and password using input IDs
  await page.fill('#email', 'cbtprepcenter@gmail.com');
  await page.fill('#password', '12345678');

  // Step 3: Click the "Sign in" button
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  // Step 4: Wait for redirect (you can adjust the URL)
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Step 5: Navigate to history page
  await page.goto('http://localhost:5173/history');

  // Step 6: Find the first "In-progress" row in the table
  const inProgressRow = page.locator('tr', { hasText: 'In-progress' }).first();
  await expect(inProgressRow).toBeVisible();

  // Step 7: Click the "Continue" button in that row
  await inProgressRow.locator('text=Continue').click();

  // Step 8: Verify that test page opened (adjust the route pattern)
  await expect(page).toHaveURL(/\/test\/in-progress|\/test\/\d+/);
});
