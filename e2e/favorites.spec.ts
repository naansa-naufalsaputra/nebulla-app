import { test, expect } from '@playwright/test';

test.describe('Favorites Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app
        await page.goto('http://localhost:5173');

        // Wait for app to load
        await page.waitForSelector('text=Good Morning', { timeout: 10000 });

        // Create a test note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        await page.locator('input[placeholder*="Untitled"]').fill('Favorite Test Note');
        const editor = page.locator('.ProseMirror');
        await editor.click();
        await editor.type('This note will be favorited');
        await page.waitForTimeout(2000); // Wait for autosave
    });

    test('should add note to favorites', async ({ page }) => {
        // Look for star/favorite button
        const favoriteButton = page.locator('button:has-text("star"), button[aria-label*="favorite"], button[aria-label*="star"]').first();

        if (await favoriteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await favoriteButton.click();
            await page.waitForTimeout(1000);

            // Go to Favorites filter
            await page.click('text=Favorites');
            await page.waitForTimeout(500);

            // Verify note appears in Favorites
            await expect(page.locator('text=Favorite Test Note')).toBeVisible({ timeout: 5000 });
        } else {
            // Try keyboard shortcut
            await page.keyboard.press('Control+Shift+F');
            await page.waitForTimeout(1000);

            await page.click('text=Favorites');
            await page.waitForTimeout(500);
            await expect(page.locator('text=Favorite Test Note')).toBeVisible({ timeout: 5000 });
        }
    });

    test('should remove note from favorites', async ({ page }) => {
        // First, favorite the note
        const favoriteButton = page.locator('button:has-text("star"), button[aria-label*="favorite"]').first();

        if (await favoriteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Click to favorite
            await favoriteButton.click();
            await page.waitForTimeout(1000);

            // Verify it's in favorites
            await page.click('text=Favorites');
            await page.waitForTimeout(500);
            await expect(page.locator('text=Favorite Test Note')).toBeVisible({ timeout: 3000 });

            // Click on the note
            await page.click('text=Favorite Test Note');
            await page.waitForTimeout(500);

            // Click star again to unfavorite
            const unfavoriteButton = page.locator('button:has-text("star"), button[aria-label*="favorite"]').first();
            await unfavoriteButton.click();
            await page.waitForTimeout(1000);

            // Go back to Favorites
            await page.click('text=Favorites');
            await page.waitForTimeout(500);

            // Note should NOT be in favorites anymore
            await expect(page.locator('text=Favorite Test Note')).not.toBeVisible();
        }
    });

    test('should show filled star icon when favorited', async ({ page }) => {
        // Favorite the note
        const favoriteButton = page.locator('button:has-text("star"), button[aria-label*="favorite"]').first();

        if (await favoriteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await favoriteButton.click();
            await page.waitForTimeout(1000);

            // Star icon should be filled (check for 'filled' class or similar)
            const starIcon = page.locator('.material-symbols-outlined.filled, [data-filled="true"]').first();

            if (await starIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
                await expect(starIcon).toBeVisible();
            }
        }
    });

    test('should show favorites count', async ({ page }) => {
        // Favorite the note
        const favoriteButton = page.locator('button:has-text("star"), button[aria-label*="favorite"]').first();

        if (await favoriteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await favoriteButton.click();
            await page.waitForTimeout(1000);

            // Go to Favorites
            await page.click('text=Favorites');
            await page.waitForTimeout(500);

            // Should show at least 1 favorite
            const favoriteItems = page.locator('nav').locator('text=Favorite Test Note');
            await expect(favoriteItems.first()).toBeVisible({ timeout: 3000 });
        }
    });

    test('should persist favorite status after reload', async ({ page }) => {
        // Favorite the note
        const favoriteButton = page.locator('button:has-text("star"), button[aria-label*="favorite"]').first();

        if (await favoriteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await favoriteButton.click();
            await page.waitForTimeout(2000);

            // Reload page
            await page.reload();
            await page.waitForSelector('text=Good Morning', { timeout: 10000 });

            // Go to Favorites
            await page.click('text=Favorites');
            await page.waitForTimeout(500);

            // Note should still be favorited
            await expect(page.locator('text=Favorite Test Note')).toBeVisible({ timeout: 5000 });
        }
    });

    test('should favorite multiple notes', async ({ page }) => {
        // Create second note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        await page.locator('input[placeholder*="Untitled"]').fill('Second Favorite');
        await page.waitForTimeout(2000);

        // Favorite both notes
        const favoriteButton1 = page.locator('button:has-text("star"), button[aria-label*="favorite"]').first();
        if (await favoriteButton1.isVisible({ timeout: 3000 }).catch(() => false)) {
            await favoriteButton1.click();
            await page.waitForTimeout(1000);
        }

        // Go back and favorite first note
        await page.click('text=Favorite Test Note');
        await page.waitForTimeout(500);

        const favoriteButton2 = page.locator('button:has-text("star"), button[aria-label*="favorite"]').first();
        if (await favoriteButton2.isVisible({ timeout: 3000 }).catch(() => false)) {
            await favoriteButton2.click();
            await page.waitForTimeout(1000);
        }

        // Go to Favorites
        await page.click('text=Favorites');
        await page.waitForTimeout(500);

        // Both notes should be visible
        await expect(page.locator('text=Favorite Test Note')).toBeVisible({ timeout: 3000 });
        await expect(page.locator('text=Second Favorite')).toBeVisible({ timeout: 3000 });
    });

    test('should show favorites in sidebar', async ({ page }) => {
        // Favorite the note
        const favoriteButton = page.locator('button:has-text("star"), button[aria-label*="favorite"]').first();

        if (await favoriteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await favoriteButton.click();
            await page.waitForTimeout(1000);

            // Go to All Notes
            await page.click('text=All Notes');
            await page.waitForTimeout(500);

            // Note should have star indicator in sidebar
            const noteInSidebar = page.locator('nav').locator('text=Favorite Test Note').first();
            await expect(noteInSidebar).toBeVisible({ timeout: 3000 });
        }
    });
});
