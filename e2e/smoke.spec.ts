import { test, expect } from '@playwright/test';

test.describe('Smoke Suite', () => {
    test.beforeEach(async ({ page }) => {
        console.log('Navigating to homepage...');
        await page.goto('/', { timeout: 60000 });
        await page.waitForLoadState('domcontentloaded');

        // Check if we are on login screen and click guest login
        // Wait a bit for potential auth redirect
        await page.waitForTimeout(2000);

        const guestButton = page.getByRole('button', { name: 'Continue as Guest' });
        if (await guestButton.isVisible()) {
            console.log('Login screen detected. Clicking Guest Login...');
            await guestButton.click();
            // Wait for login to complete (New Note button visible)
            await expect(page.getByRole('button', { name: 'New Note' })).toBeVisible({ timeout: 30000 });
            console.log('Login successful.');
        } else {
            console.log('No login screen detected (already logged in).');
        }
    });

    test('Homepage loads correctly', async ({ page }) => {
        await expect(page).toHaveTitle(/Nebulla/);
        await expect(page.getByText('Good Afternoon')).toBeVisible();
        await expect(page.getByRole('button', { name: 'New Note' })).toBeVisible();
    });

    test('Create new note flow', async ({ page }) => {
        // Click New Note
        await page.getByRole('button', { name: 'New Note' }).click();

        // Note: App is SPA without URL routing for this action, so URL check is removed.
        // Verify Editor is visible implies successful navigation/state change.
        await expect(page.locator('.ProseMirror')).toBeVisible();

        // Type Title
        const titleInput = page.locator('[placeholder="Untitled"]');
        await expect(titleInput).toBeVisible();
        await titleInput.fill('Smoke Test Note');
        // Ensure title is updated in input
        await expect(titleInput).toHaveValue('Smoke Test Note');

        // Verify Sidebar updates (might need reload or wait for sync)
        // Use text locator which is more robust than role for sidebar items
        await expect(page.locator('nav').getByText('Smoke Test Note')).toBeVisible({ timeout: 10000 });
    });
});
