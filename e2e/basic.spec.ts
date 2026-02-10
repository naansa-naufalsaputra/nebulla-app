import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
    console.log('Running basic test...');
    await page.goto('/');
    // Adjust title expectation if needed, or just check URL
    console.log('Navigated to /');
    await expect(page).toHaveURL(/localhost/);
});
