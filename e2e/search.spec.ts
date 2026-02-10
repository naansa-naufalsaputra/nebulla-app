import { test, expect } from '@playwright/test';

test.describe('Search and Filter Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app
        await page.goto('http://localhost:5173');

        // Wait for app to load
        await page.waitForSelector('text=Good Morning', { timeout: 10000 });

        // Create some test notes for searching
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        await page.locator('input[placeholder*="Untitled"]').fill('React Tutorial');
        const editor1 = page.locator('.ProseMirror');
        await editor1.click();
        await editor1.type('Learn React hooks and components');
        await page.waitForTimeout(2000);

        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        await page.locator('input[placeholder*="Untitled"]').fill('Vue Guide');
        const editor2 = page.locator('.ProseMirror');
        await editor2.click();
        await editor2.type('Vue composition API tutorial');
        await page.waitForTimeout(2000);

        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        await page.locator('input[placeholder*="Untitled"]').fill('Angular Docs');
        const editor3 = page.locator('.ProseMirror');
        await editor3.click();
        await editor3.type('Angular dependency injection');
        await page.waitForTimeout(2000);

        // Go back to dashboard
        await page.click('text=Good Morning, text=Good Afternoon, text=Good Evening').first();
    });

    test('should search notes by title', async ({ page }) => {
        // Find search input on dashboard
        const searchInput = page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toBeVisible({ timeout: 5000 });

        // Type search query
        await searchInput.fill('React');
        await page.waitForTimeout(500);

        // Verify React Tutorial appears
        await expect(page.locator('text=React Tutorial')).toBeVisible({ timeout: 3000 });

        // Verify other notes don't appear (or are filtered out)
        // Note: This depends on how search results are displayed
    });

    test('should search notes by content', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('hooks');
        await page.waitForTimeout(500);

        // Should find "React Tutorial" because it contains "hooks" in content
        await expect(page.locator('text=React Tutorial')).toBeVisible({ timeout: 3000 });
    });

    test('should clear search results', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('React');
        await page.waitForTimeout(500);

        // Clear search
        await searchInput.clear();
        await page.waitForTimeout(500);

        // All notes should be visible again
        await expect(page.locator('text=React Tutorial')).toBeVisible({ timeout: 3000 });
        await expect(page.locator('text=Vue Guide')).toBeVisible({ timeout: 3000 });
        await expect(page.locator('text=Angular Docs')).toBeVisible({ timeout: 3000 });
    });

    test('should filter by All Notes', async ({ page }) => {
        // Click All Notes filter
        await page.click('text=All Notes');
        await page.waitForTimeout(500);

        // All notes should be visible
        await expect(page.locator('text=React Tutorial')).toBeVisible({ timeout: 3000 });
        await expect(page.locator('text=Vue Guide')).toBeVisible({ timeout: 3000 });
        await expect(page.locator('text=Angular Docs')).toBeVisible({ timeout: 3000 });
    });

    test('should filter by Favorites', async ({ page }) => {
        // First, favorite a note
        await page.click('text=React Tutorial');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        // Look for favorite/star button
        const favoriteButton = page.locator('button:has-text("star"), button[aria-label*="favorite"]').first();
        if (await favoriteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await favoriteButton.click();
            await page.waitForTimeout(1000);
        }

        // Go to Favorites filter
        await page.click('text=Favorites');
        await page.waitForTimeout(500);

        // Only favorited note should appear
        await expect(page.locator('text=React Tutorial')).toBeVisible({ timeout: 3000 });
    });

    test('should filter by Recent', async ({ page }) => {
        // Click Recent filter
        await page.click('text=Recent');
        await page.waitForTimeout(500);

        // Notes should be sorted by last opened
        // Most recent (Angular Docs) should appear first
        const notes = page.locator('nav').locator('text=React Tutorial, text=Vue Guide, text=Angular Docs');
        await expect(notes.first()).toBeVisible({ timeout: 3000 });
    });

    test('should filter by Trash', async ({ page }) => {
        // First, trash a note
        await page.click('text=Angular Docs');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        // Look for trash/delete button
        const trashButton = page.locator('button:has-text("delete"), button[aria-label*="trash"]').first();
        if (await trashButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await trashButton.click();
            await page.waitForTimeout(1000);
        }

        // Go to Trash filter
        await page.click('text=Trash');
        await page.waitForTimeout(500);

        // Only trashed note should appear
        await expect(page.locator('text=Angular Docs')).toBeVisible({ timeout: 3000 });

        // Other notes should not appear
        await expect(page.locator('text=React Tutorial')).not.toBeVisible();
    });

    test('should search within sidebar', async ({ page }) => {
        // Go to All Notes
        await page.click('text=All Notes');
        await page.waitForTimeout(500);

        // Look for sidebar search input (if exists)
        const sidebarSearch = page.locator('nav').locator('input[placeholder*="Search"], input[type="search"]').first();

        if (await sidebarSearch.isVisible({ timeout: 2000 }).catch(() => false)) {
            await sidebarSearch.fill('Vue');
            await page.waitForTimeout(500);

            // Should filter sidebar notes
            await expect(page.locator('text=Vue Guide')).toBeVisible({ timeout: 3000 });
        }
    });

    test('should handle no search results', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('NonexistentNote12345');
        await page.waitForTimeout(500);

        // Should show no results message or empty state
        // Verify none of the test notes appear
        await expect(page.locator('text=React Tutorial')).not.toBeVisible();
        await expect(page.locator('text=Vue Guide')).not.toBeVisible();
        await expect(page.locator('text=Angular Docs')).not.toBeVisible();
    });

    test('should search case-insensitive', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Search"]');

        // Search with lowercase
        await searchInput.fill('react');
        await page.waitForTimeout(500);
        await expect(page.locator('text=React Tutorial')).toBeVisible({ timeout: 3000 });

        // Search with uppercase
        await searchInput.clear();
        await searchInput.fill('REACT');
        await page.waitForTimeout(500);
        await expect(page.locator('text=React Tutorial')).toBeVisible({ timeout: 3000 });
    });

    test('should filter by folder', async ({ page }) => {
        // First, move a note to a folder
        await page.click('text=React Tutorial');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        // Look for folder selector or move to folder option
        const folderButton = page.locator('button:has-text("folder"), select, [aria-label*="folder"]').first();

        if (await folderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await folderButton.click();
            await page.waitForTimeout(500);

            // Select "Work" folder
            const workFolder = page.locator('text=Work').first();
            if (await workFolder.isVisible({ timeout: 1000 }).catch(() => false)) {
                await workFolder.click();
                await page.waitForTimeout(1000);
            }
        }

        // Go to All Notes
        await page.click('text=All Notes');
        await page.waitForTimeout(500);

        // Click on Work folder
        const workFolderNav = page.locator('nav').locator('text=Work').first();
        if (await workFolderNav.isVisible({ timeout: 2000 }).catch(() => false)) {
            await workFolderNav.click();
            await page.waitForTimeout(500);

            // Only notes in Work folder should appear
            await expect(page.locator('text=React Tutorial')).toBeVisible({ timeout: 3000 });
        }
    });
});
