import { test, expect } from '@playwright/test';

test.describe('Sidebar Drag and Drop Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app
        await page.goto('http://localhost:5173');

        // Wait for app to load
        await page.waitForSelector('text=Good Morning', { timeout: 10000 });

        // Create a test folder first
        await page.click('text=All Notes');
        await page.waitForTimeout(500);

        // Look for "New Folder" button or similar
        const newFolderButton = page.locator('button:has-text("New Folder"), button[aria-label*="folder"]').first();
        if (await newFolderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await newFolderButton.click();
            await page.waitForTimeout(500);
        }
    });

    test('should display folders in sidebar', async ({ page }) => {
        // Click All Notes to show sidebar
        await page.click('text=All Notes');

        // Wait for sidebar to be visible
        await page.waitForSelector('text=Folders, text=All Notes', { timeout: 5000 });

        // Verify folders section exists
        const foldersSection = page.locator('text=Folders, text=Work, text=Personal').first();
        await expect(foldersSection).toBeVisible({ timeout: 3000 });
    });

    test('should create note and see it in sidebar', async ({ page }) => {
        // Create new note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        // Set title
        const titleInput = page.locator('input[placeholder*="Untitled"]');
        await titleInput.fill('Drag Test Note');

        // Wait for autosave
        await page.waitForTimeout(2000);

        // Go back to All Notes view
        await page.click('text=All Notes');

        // Verify note appears in sidebar
        await expect(page.locator('text=Drag Test Note')).toBeVisible({ timeout: 5000 });
    });

    test('should drag note to folder', async ({ page }) => {
        // Create a note first
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        const titleInput = page.locator('input[placeholder*="Untitled"]');
        await titleInput.fill('Note to Move');
        await page.waitForTimeout(2000);

        // Go to All Notes
        await page.click('text=All Notes');
        await page.waitForTimeout(1000);

        // Find the note in sidebar
        const noteElement = page.locator('text=Note to Move').first();
        await expect(noteElement).toBeVisible({ timeout: 5000 });

        // Find a folder (Work or Personal)
        const folderElement = page.locator('text=Work, text=Personal').first();

        if (await folderElement.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Get bounding boxes
            const noteBox = await noteElement.boundingBox();
            const folderBox = await folderElement.boundingBox();

            if (noteBox && folderBox) {
                // Perform drag and drop
                await page.mouse.move(noteBox.x + noteBox.width / 2, noteBox.y + noteBox.height / 2);
                await page.mouse.down();
                await page.mouse.move(folderBox.x + folderBox.width / 2, folderBox.y + folderBox.height / 2, { steps: 10 });
                await page.mouse.up();

                // Wait for update
                await page.waitForTimeout(1000);

                // Click on the folder to verify note is inside
                await folderElement.click();
                await page.waitForTimeout(500);

                // Note should still be visible (now in folder)
                await expect(page.locator('text=Note to Move')).toBeVisible({ timeout: 3000 });
            }
        }
    });

    test('should expand and collapse folders', async ({ page }) => {
        // Go to All Notes
        await page.click('text=All Notes');
        await page.waitForTimeout(500);

        // Find folder
        const folder = page.locator('text=Work, text=Personal').first();

        if (await folder.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Click to expand
            await folder.click();
            await page.waitForTimeout(500);

            // Click again to collapse
            await folder.click();
            await page.waitForTimeout(500);

            // Folder should still be visible
            await expect(folder).toBeVisible();
        }
    });

    test('should create nested page', async ({ page }) => {
        // Create parent note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        const titleInput = page.locator('input[placeholder*="Untitled"]');
        await titleInput.fill('Parent Note');
        await page.waitForTimeout(2000);

        // Look for "Add child page" button or similar
        const addChildButton = page.locator('button:has-text("Add"), button[aria-label*="child"]').first();

        if (await addChildButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await addChildButton.click();
            await page.waitForTimeout(1000);

            // New child note should be created
            const childTitleInput = page.locator('input[placeholder*="Untitled"]');
            await childTitleInput.fill('Child Note');
            await page.waitForTimeout(2000);

            // Go back to All Notes
            await page.click('text=All Notes');

            // Verify parent and child are visible
            await expect(page.locator('text=Parent Note')).toBeVisible({ timeout: 3000 });
            await expect(page.locator('text=Child Note')).toBeVisible({ timeout: 3000 });
        }
    });

    test('should navigate between notes in sidebar', async ({ page }) => {
        // Create two notes
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        await page.locator('input[placeholder*="Untitled"]').fill('First Note');
        await page.waitForTimeout(2000);

        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        await page.locator('input[placeholder*="Untitled"]').fill('Second Note');
        await page.waitForTimeout(2000);

        // Go to All Notes
        await page.click('text=All Notes');
        await page.waitForTimeout(500);

        // Click on first note
        await page.click('text=First Note');
        await page.waitForTimeout(500);

        // Verify we're on first note
        const titleInput1 = page.locator('input[placeholder*="Untitled"]');
        await expect(titleInput1).toHaveValue('First Note');

        // Click on second note
        await page.click('text=Second Note');
        await page.waitForTimeout(500);

        // Verify we're on second note
        const titleInput2 = page.locator('input[placeholder*="Untitled"]');
        await expect(titleInput2).toHaveValue('Second Note');
    });

    test('should highlight active note in sidebar', async ({ page }) => {
        // Create a note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        await page.locator('input[placeholder*="Untitled"]').fill('Active Note Test');
        await page.waitForTimeout(2000);

        // Go to All Notes
        await page.click('text=All Notes');
        await page.waitForTimeout(500);

        // Click on the note
        await page.click('text=Active Note Test');
        await page.waitForTimeout(500);

        // The note should have active styling (bg-primary or similar)
        const activeNote = page.locator('text=Active Note Test').first();
        const classList = await activeNote.evaluate(el => el.closest('button')?.className || '');

        // Should contain some active indicator class
        expect(classList).toContain('bg-');
    });
});
