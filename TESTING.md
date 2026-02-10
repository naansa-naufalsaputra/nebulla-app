# Testing Guide - Nebulla Project

## Overview

This guide provides comprehensive documentation for the testing infrastructure and patterns used in the Nebulla project.

## Test Structure

```
nebulla/
├── tests/
│   ├── setup.ts                    # Global test setup
│   ├── mocks/
│   │   ├── supabase.ts            # Supabase client mocks
│   │   └── gemini.ts              # Gemini API mocks
│   ├── services/
│   │   ├── notesService.test.ts   # Notes CRUD tests
│   │   └── geminiService.test.ts  # AI service tests
│   ├── hooks/
│   │   ├── useNotes.test.ts       # Note management tests
│   │   ├── useNoteHandlers.test.ts # Handler tests
│   │   └── useSettings.test.ts    # Settings tests
│   ├── utils/
│   │   └── docParser.test.ts      # Document parsing tests
│   └── integration/
│       ├── TiptapEditor.test.tsx  # Editor integration
│       ├── Sidebar.test.tsx       # Sidebar integration
│       └── Dashboard.test.tsx     # Dashboard integration
├── e2e/
│   ├── basic.spec.ts              # Basic smoke tests
│   ├── smoke.spec.ts              # Core functionality
│   ├── styles.spec.ts             # Page styles
│   ├── editor-interaction.spec.ts # Editor features
│   ├── sidebar-drag.spec.ts       # Drag-and-drop
│   ├── search.spec.ts             # Search & filters
│   ├── trash-restore.spec.ts      # Trash operations
│   ├── favorites.spec.ts          # Favorites toggle
│   └── ai-assistant.spec.ts       # AI modal (mocked)
└── vitest.config.ts               # Vitest configuration
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test tests/services/notesService.test.ts

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui
```

### Integration Tests

```bash
# Run integration tests
npm run test -- tests/integration

# Run specific integration test
npm run test tests/integration/TiptapEditor.test.tsx
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific E2E test
npx playwright test e2e/editor-interaction.spec.ts

# Run E2E tests in headed mode (see browser)
npx playwright test --headed

# Run E2E tests in debug mode
npx playwright test --debug
```

### Coverage

```bash
# Run tests with coverage report
npm run test:coverage

# View coverage report in browser
# Open: coverage/index.html
```

## Test Patterns

### 1. Unit Test Pattern (Services)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNote } from '../../services/notesService';
import { mockSupabaseClient, mockAuthenticatedUser } from '../mocks/supabase';

describe('notesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  it('should create note with sanitized parent_id', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ data: { id: '123' }, error: null });
    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert,
      select: vi.fn().mockReturnValue({ single: vi.fn() })
    });

    await createNote({ title: 'Test', parent_id: '' });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ parent_id: null })
    );
  });
});
```

### 2. Hook Test Pattern

```typescript
import { describe, it, expect } from 'vitest';
import { filterNotes } from '../../hooks/useNotes';

describe('useNotes - filtering logic', () => {
  it('should filter notes by search query', () => {
    const notes = [
      { id: '1', title: 'React Tutorial', isTrashed: false },
      { id: '2', title: 'Vue Guide', isTrashed: false }
    ];

    const result = filterNotes(notes, 'React', false);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('React Tutorial');
  });
});
```

### 3. Integration Test Pattern

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../components/Dashboard';

describe('Dashboard Integration', () => {
  it('should call onCreateNote when clicking New Note', async () => {
    const mockOnCreateNote = vi.fn();
    const user = userEvent.setup();

    render(<Dashboard onCreateNote={mockOnCreateNote} />);

    const button = screen.getByText('New Note').closest('button');
    await user.click(button!);

    expect(mockOnCreateNote).toHaveBeenCalled();
  });
});
```

### 4. E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('Editor Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('text=Good Morning');
  });

  test('should create note and type content', async ({ page }) => {
    await page.click('text=New Note');
    await page.waitForSelector('.ProseMirror');

    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.type('Test content');

    await expect(editor).toContainText('Test content');
  });
});
```

## Mocking Strategies

### Supabase Mocking

```typescript
// tests/mocks/supabase.ts
export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn()
  },
  from: vi.fn()
};

export function mockAuthenticatedUser() {
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: { user: { id: 'user-123' } },
    error: null
  });
}
```

### Gemini API Mocking (E2E)

```typescript
test.beforeEach(async ({ page }) => {
  // Mock Gemini API to avoid real API calls
  await page.route('**/v1beta/models/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        candidates: [{
          content: { parts: [{ text: 'Mocked response' }] }
        }]
      })
    });
  });
});
```

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach` to reset state
- Clear mocks between tests

### 2. Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should sanitize empty string parent_id to null', () => { ... });
```

### 3. AAA Pattern

```typescript
it('should filter notes by search query', () => {
  // Arrange
  const notes = [{ id: '1', title: 'React' }];
  
  // Act
  const result = filterNotes(notes, 'React', false);
  
  // Assert
  expect(result).toHaveLength(1);
});
```

### 4. Test Edge Cases

- Empty inputs
- Null/undefined values
- Error conditions
- Boundary values

### 5. Avoid Test Interdependence

```typescript
// ❌ Bad - tests depend on execution order
let sharedState = [];
it('test 1', () => { sharedState.push(1); });
it('test 2', () => { expect(sharedState).toHaveLength(1); });

// ✅ Good - each test is independent
it('test 1', () => {
  const state = [];
  state.push(1);
  expect(state).toHaveLength(1);
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test -- --run
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Generate coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Coverage Targets

- **Services**: 80%+
- **Hooks**: 70%+
- **Utils**: 70%+
- **Components**: 50%+
- **Overall**: 70%+

## Troubleshooting

### Common Issues

**1. Tests timing out**

```typescript
// Increase timeout in vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000
  }
});
```

**2. Mock not working**

```typescript
// Ensure mocks are cleared
beforeEach(() => {
  vi.clearAllMocks();
});
```

**3. E2E tests failing**

```bash
# Run in headed mode to see what's happening
npx playwright test --headed

# Use debug mode
npx playwright test --debug
```

**4. Coverage not generating**

```bash
# Install coverage provider
npm install -D @vitest/coverage-v8
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Next Steps

1. **Increase Coverage**: Add tests for uncovered files
2. **E2E Selector Fixes**: Adjust selectors in failing E2E tests
3. **Performance Tests**: Add performance benchmarks
4. **Visual Regression**: Consider adding visual regression tests
5. **Accessibility Tests**: Add a11y testing with axe-core
