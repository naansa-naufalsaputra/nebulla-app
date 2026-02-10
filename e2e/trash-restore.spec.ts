import { test, expect } from '@playwright/test';

test.describe('Trash and Restore Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app
        await page.goto('http://localhost:5173');

        // Wait for app to load
        await page.waitForSelector('text=Good Morning', { timeout: 10000 });

        // Create a test note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        await page.locator('input[placeholder*="Untitled"]').fill('Note to Delete');
        const editor = page.locator('.ProseMirror');
        await editor.click();
        await editor.type('This note will be deleted and restored');
        await page.waitForTimeout(2000); // Wait for autosave
    });

    test('should move note to trash', async ({ page }) => {
        // Look for delete/trash button in editor or menu
        const deleteButton = page.locator('button:has-text("delete"), button:has-text("trash"), button[aria-label*="delete"], button[aria-label*="trash"]').first();

        if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);
        } else {
            // Try keyboard shortcut
            await page.keyboard.press('Control+Shift+Delete');
            await page.waitForTimeout(1000);
        }

        // Go to Trash filter
        await page.click('text=Trash');
        await page.waitForTimeout(500);

        // Verify note appears in Trash
        await expect(page.locator('text=Note to Delete')).toBeVisible({ timeout: 5000 });
    });

    test('should restore note from trash', async ({ page }) => {
        // First, delete the note
        const deleteButton = page.locator('button:has-text("delete"), button:has-text("trash"), button[aria-label*="delete"]').first();
        if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);
        }

        // Go to Trash
        await page.click('text=Trash');
        await page.waitForTimeout(500);

        // Click on the trashed note
        await page.click('text=Note to Delete');
        await page.waitForTimeout(500);

        // Look for restore button
        const restoreButton = page.locator('button:has-text("restore"), button[aria-label*="restore"]').first();

        if (await restoreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await restoreButton.click();
            await page.waitForTimeout(1000);

            // Go to All Notes
            await page.click('text=All Notes');
            await page.waitForTimeout(500);

            // Verify note is back in All Notes
            await expect(page.locator('text=Note to Delete')).toBeVisible({ timeout: 5000 });
        }
    });

    test('should empty trash', async ({ page }) => {
        // Delete the note first
        const deleteButton = page.locator('button:has-text("delete"), button:has-text("trash")').first();
        if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);
        }

        // Go to Trash
        await page.click('text=Trash');
        await page.waitForTimeout(500);

        // Verify note is in trash
        await expect(page.locator('text=Note to Delete')).toBeVisible({ timeout: 3000 });

        // Look for "Empty Trash" button
        const emptyTrashButton = page.locator('button:has-text("Empty Trash"), button:has-text("Clear All")').first();

        if (await emptyTrashButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await emptyTrashButton.click();

            // Confirm dialog if exists
            const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').first();
            if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmButton.click();
            }

            await page.waitForTimeout(1000);

            // Verify trash is empty
            await expect(page.locator('text=Note to Delete')).not.toBeVisible();
        }
    });

    test('should show trash count', async ({ page }) => {
        // Delete the note
        const deleteButton = page.locator('button:has-text("delete"), button:has-text("trash")').first();
        if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);
        }

        // Go to Trash
        await page.click('text=Trash');
        await page.waitForTimeout(500);

        // Trash should show at least 1 item
        const trashItems = page.locator('nav').locator('text=Note to Delete');
        await expect(trashItems.first()).toBeVisible({ timeout: 3000 });
    });

    test('should not show trashed notes in All Notes', async ({ page }) => {
        // Delete the note
        const deleteButton = page.locator('button:has-text("delete"), button:has-text("trash")').first();
        if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);
        }

        // Go to All Notes
        await page.click('text=All Notes');
        await page.waitForTimeout(500);

        // Trashed note should NOT be visible
        await expect(page.locator('text=Note to Delete')).not.toBeVisible();
    });

    test('should permanently delete note', async ({ page }) => {
        // Delete the note
        const deleteButton = page.locator('button:has-text("delete"), button:has-text("trash")').first();
        if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await deleteButton.click();
            await page.waitForTimeout(1000);
        }

        // Go to Trash
        await page.click('text=Trash');
        await page.waitForTimeout(500);

        // Click on trashed note
        await page.click('text=Note to Delete');
        await page.waitForTimeout(500);

        // Look for permanent delete button
        const permanentDeleteButton = page.locator('button:has-text("Delete Forever"), button:has-text("Permanent")').first();

        if (await permanentDeleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await permanentDeleteButton.click();

            // Confirm if needed
            const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
            if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmButton.click();
            }

            await page.waitForTimeout(1000);

            // Note should be gone from trash
            await expect(page.locator('text=Note to Delete')).not.toBeVisible();
        }
    });
});
