import { test, expect } from '@playwright/test';

test.describe('Page Style Persistence', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
        // Handle Guest Login if present
        const guestBtn = page.getByRole('button', { name: 'Continue as Guest' });
        if (await guestBtn.isVisible()) {
            await guestBtn.click();
        }
        await page.waitForLoadState('domcontentloaded');
    });

    test('should persist font style after reload', async ({ page }) => {
        // 1. Create new note
        await page.getByRole('button', { name: 'New Note' }).click();
        await expect(page.locator('.ProseMirror')).toBeVisible();

        // 2. Open Page Style Menu
        await page.getByTitle('Page Style').click();

        // 3. Select 'Serif'
        await page.getByRole('button', { name: 'Serif' }).click();

        // 4. Verify visual change (optional, but good)
        const editor = page.locator('.ProseMirror').first();
        // Note: Tailwind class might be on the parent container in this app, check TiptapEditor.tsx logic
        // But for persistence, checking that the class is present AFTER reload is key.

        // 5. Reload Page
        await page.reload();
        await page.waitForLoadState('domcontentloaded');

        // 6. Check if state persisted
        // We need to check if the Serif button is active or if the class is applied
        await page.getByTitle('Page Style').click();

        // Check if Serif button has the active border class (border-blue-500)
        const serifBtn = page.getByRole('button', { name: 'Serif' });
        await expect(serifBtn).toHaveClass(/border-blue-500/);
    });

    test('should persist full width toggle after reload', async ({ page }) => {
        // 1. Create new note
        await page.getByRole('button', { name: 'New Note' }).click();

        // 2. Open Menu
        await page.getByTitle('Page Style').click();

        // 3. Toggle Full Width
        await page.getByRole('button', { name: 'Full width' }).click();

        // 4. Reload
        await page.reload();

        // 5. Verify
        await page.getByTitle('Page Style').click();
        const fullWidthBtn = page.getByRole('button', { name: 'Full width' });
        // Check for the active toggle state (using the bg-blue-500 indicator logic from code)
        // The component structure: button > div (track) > div (thumb)
        // We can check if the track has bg-blue-500
        const toggleTrack = fullWidthBtn.locator('div').first();
        await expect(toggleTrack).toHaveClass(/bg-blue-500/);
    });
});
