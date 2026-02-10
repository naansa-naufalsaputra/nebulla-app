import { test, expect } from '@playwright/test';

test.describe('Editor Interaction Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app
        await page.goto('http://localhost:5173');

        // Wait for app to load
        await page.waitForSelector('text=Good Morning', { timeout: 10000 });
    });

    test('should create note and type content', async ({ page }) => {
        // Click "New Note" button
        await page.click('text=New Note');

        // Wait for editor to load
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        // Type in title
        const titleInput = page.locator('input[placeholder*="Untitled"]');
        await titleInput.fill('My Test Note');

        // Type in editor
        const editor = page.locator('.ProseMirror');
        await editor.click();
        await editor.type('This is my test content.');

        // Verify content is there
        await expect(editor).toContainText('This is my test content.');

        // Verify title is saved
        await expect(titleInput).toHaveValue('My Test Note');
    });

    test('should apply bold formatting', async ({ page }) => {
        // Create new note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        const editor = page.locator('.ProseMirror');
        await editor.click();

        // Type some text
        await editor.type('Bold text test');

        // Select all text (Ctrl+A)
        await page.keyboard.press('Control+a');

        // Apply bold (Ctrl+B)
        await page.keyboard.press('Control+b');

        // Verify bold tag exists
        const boldText = editor.locator('strong');
        await expect(boldText).toContainText('Bold text test');
    });

    test('should apply italic formatting', async ({ page }) => {
        // Create new note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        const editor = page.locator('.ProseMirror');
        await editor.click();

        // Type some text
        await editor.type('Italic text test');

        // Select all text
        await page.keyboard.press('Control+a');

        // Apply italic (Ctrl+I)
        await page.keyboard.press('Control+i');

        // Verify italic tag exists
        const italicText = editor.locator('em');
        await expect(italicText).toContainText('Italic text test');
    });

    test('should open slash command menu', async ({ page }) => {
        // Create new note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        const editor = page.locator('.ProseMirror');
        await editor.click();

        // Type slash command
        await editor.type('/');

        // Wait for command menu to appear
        await page.waitForSelector('[role="menu"], .slash-menu, .command-list', { timeout: 3000 });

        // Verify menu has options (heading, list, etc.)
        const menu = page.locator('[role="menu"], .slash-menu, .command-list').first();
        await expect(menu).toBeVisible();
    });

    test('should insert heading via slash command', async ({ page }) => {
        // Create new note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        const editor = page.locator('.ProseMirror');
        await editor.click();

        // Type slash command
        await editor.type('/');

        // Wait for menu
        await page.waitForSelector('[role="menu"], .slash-menu, .command-list', { timeout: 3000 });

        // Type "heading" to filter
        await page.keyboard.type('heading');

        // Press Enter to select
        await page.keyboard.press('Enter');

        // Type heading text
        await editor.type('My Heading');

        // Verify heading exists
        const heading = editor.locator('h1, h2, h3');
        await expect(heading).toContainText('My Heading');
    });

    test('should create bullet list', async ({ page }) => {
        // Create new note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        const editor = page.locator('.ProseMirror');
        await editor.click();

        // Type slash command
        await editor.type('/');
        await page.waitForSelector('[role="menu"], .slash-menu, .command-list', { timeout: 3000 });

        // Type "bullet" to filter
        await page.keyboard.type('bullet');
        await page.keyboard.press('Enter');

        // Type list items
        await editor.type('First item');
        await page.keyboard.press('Enter');
        await editor.type('Second item');

        // Verify list exists
        const list = editor.locator('ul');
        await expect(list).toBeVisible();

        const listItems = editor.locator('li');
        await expect(listItems).toHaveCount(2);
    });

    test('should autosave content', async ({ page }) => {
        // Create new note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        const editor = page.locator('.ProseMirror');
        await editor.click();
        await editor.type('Autosave test content');

        // Wait for autosave (1.5s debounce)
        await page.waitForTimeout(2000);

        // Refresh page
        await page.reload();

        // Wait for app to load
        await page.waitForSelector('text=Good Morning', { timeout: 10000 });

        // Click on the note in sidebar (should be recent)
        await page.click('text=Untitled');

        // Verify content is still there
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        const editorAfterReload = page.locator('.ProseMirror');
        await expect(editorAfterReload).toContainText('Autosave test content');
    });

    test('should update title and persist', async ({ page }) => {
        // Create new note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });

        const titleInput = page.locator('input[placeholder*="Untitled"]');
        await titleInput.fill('Persistent Title Test');

        // Wait for autosave
        await page.waitForTimeout(2000);

        // Refresh
        await page.reload();
        await page.waitForSelector('text=Good Morning', { timeout: 10000 });

        // Click on note
        await page.click('text=Persistent Title Test');

        // Verify title persisted
        await page.waitForSelector('input[placeholder*="Untitled"]', { timeout: 5000 });
        const titleAfterReload = page.locator('input[placeholder*="Untitled"]');
        await expect(titleAfterReload).toHaveValue('Persistent Title Test');
    });
});
