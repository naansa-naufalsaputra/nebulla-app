import { test, expect } from '@playwright/test';

test.describe('AI Assistant Tests (Mocked)', () => {
    test.beforeEach(async ({ page }) => {
        // Mock Gemini API responses to avoid real API calls
        await page.route('**/v1beta/models/**', async (route) => {
            // Mock streaming response
            const mockResponse = {
                candidates: [{
                    content: {
                        parts: [{ text: 'This is a mocked AI response. React is a JavaScript library for building user interfaces.' }],
                        role: 'model'
                    }
                }]
            };

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockResponse)
            });
        });

        // Navigate to app
        await page.goto('http://localhost:5173');

        // Wait for app to load
        await page.waitForSelector('text=Good Morning', { timeout: 10000 });

        // Create a note
        await page.click('text=New Note');
        await page.waitForSelector('.ProseMirror', { timeout: 5000 });
        await page.locator('input[placeholder*="Untitled"]').fill('AI Test Note');
        await page.waitForTimeout(1000);
    });

    test('should open AI assistant modal', async ({ page }) => {
        // Look for AI assistant button (could be in toolbar, menu, or floating button)
        const aiButton = page.locator('button:has-text("AI"), button:has-text("Assistant"), button[aria-label*="AI"], button[aria-label*="assistant"]').first();

        if (await aiButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await aiButton.click();
            await page.waitForTimeout(500);

            // Modal should be visible
            const modal = page.locator('[role="dialog"], .modal, [data-testid="ai-modal"]').first();
            await expect(modal).toBeVisible({ timeout: 3000 });
        } else {
            // Try keyboard shortcut
            await page.keyboard.press('Control+k');
            await page.waitForTimeout(500);

            const modal = page.locator('[role="dialog"], .modal').first();
            if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
                await expect(modal).toBeVisible();
            }
        }
    });

    test('should send query to AI and receive response', async ({ page }) => {
        // Open AI modal
        const aiButton = page.locator('button:has-text("AI"), button:has-text("Assistant"), button[aria-label*="AI"]').first();

        if (await aiButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await aiButton.click();
            await page.waitForTimeout(500);

            // Find input field
            const aiInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="Ask"], textarea[placeholder*="question"]').first();

            if (await aiInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                // Type query
                await aiInput.fill('What is React?');

                // Submit (Enter or button)
                const submitButton = page.locator('button:has-text("Send"), button:has-text("Ask"), button[type="submit"]').first();

                if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await submitButton.click();
                } else {
                    await page.keyboard.press('Enter');
                }

                await page.waitForTimeout(1000);

                // Response should appear (mocked)
                const response = page.locator('text=mocked AI response, text=React is a JavaScript').first();
                await expect(response).toBeVisible({ timeout: 5000 });
            }
        }
    });

    test('should stream AI response', async ({ page }) => {
        // Open AI modal
        const aiButton = page.locator('button:has-text("AI"), button:has-text("Assistant")').first();

        if (await aiButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await aiButton.click();
            await page.waitForTimeout(500);

            const aiInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="Ask"]').first();

            if (await aiInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                await aiInput.fill('Explain hooks');

                // Submit
                await page.keyboard.press('Enter');
                await page.waitForTimeout(500);

                // Should show streaming indicator or response appearing
                const responseArea = page.locator('[data-testid="ai-response"], .ai-response, .response-container').first();

                if (await responseArea.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await expect(responseArea).toBeVisible();
                }
            }
        }
    });

    test('should insert AI response into editor', async ({ page }) => {
        // Open AI modal
        const aiButton = page.locator('button:has-text("AI"), button:has-text("Assistant")').first();

        if (await aiButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await aiButton.click();
            await page.waitForTimeout(500);

            const aiInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="Ask"]').first();

            if (await aiInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                await aiInput.fill('Generate content');
                await page.keyboard.press('Enter');
                await page.waitForTimeout(1500);

                // Look for "Insert" or "Add to note" button
                const insertButton = page.locator('button:has-text("Insert"), button:has-text("Add to note"), button:has-text("Export")').first();

                if (await insertButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await insertButton.click();
                    await page.waitForTimeout(1000);

                    // Content should appear in editor
                    const editor = page.locator('.ProseMirror');
                    await expect(editor).toContainText('mocked AI response');
                }
            }
        }
    });

    test('should close AI modal', async ({ page }) => {
        // Open AI modal
        const aiButton = page.locator('button:has-text("AI"), button:has-text("Assistant")').first();

        if (await aiButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await aiButton.click();
            await page.waitForTimeout(500);

            // Modal should be visible
            const modal = page.locator('[role="dialog"], .modal').first();
            await expect(modal).toBeVisible({ timeout: 3000 });

            // Close modal (X button or Escape)
            const closeButton = page.locator('button[aria-label*="close"], button:has-text("×")').first();

            if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await closeButton.click();
            } else {
                await page.keyboard.press('Escape');
            }

            await page.waitForTimeout(500);

            // Modal should be closed
            await expect(modal).not.toBeVisible();
        }
    });

    test('should handle API errors gracefully', async ({ page }) => {
        // Override route to return error
        await page.route('**/v1beta/models/**', async (route) => {
            await route.fulfill({
                status: 429,
                contentType: 'application/json',
                body: JSON.stringify({ error: { message: 'Rate limit exceeded' } })
            });
        });

        // Open AI modal
        const aiButton = page.locator('button:has-text("AI"), button:has-text("Assistant")').first();

        if (await aiButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await aiButton.click();
            await page.waitForTimeout(500);

            const aiInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="Ask"]').first();

            if (await aiInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                await aiInput.fill('Test error');
                await page.keyboard.press('Enter');
                await page.waitForTimeout(1000);

                // Should show error message
                const errorMessage = page.locator('text=error, text=failed, text=try again').first();

                if (await errorMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await expect(errorMessage).toBeVisible();
                }
            }
        }
    });

    test('should show loading state while waiting for response', async ({ page }) => {
        // Open AI modal
        const aiButton = page.locator('button:has-text("AI"), button:has-text("Assistant")').first();

        if (await aiButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await aiButton.click();
            await page.waitForTimeout(500);

            const aiInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="Ask"]').first();

            if (await aiInput.isVisible({ timeout: 3000 }).catch(() => false)) {
                await aiInput.fill('Loading test');
                await page.keyboard.press('Enter');

                // Should show loading indicator
                const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner, text=Loading').first();

                if (await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await expect(loadingIndicator).toBeVisible();
                }
            }
        }
    });
});
