import { vi } from 'vitest';

// Mock Supabase Client
export const mockSupabaseClient = {
    auth: {
        getUser: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
            data: { subscription: { unsubscribe: vi.fn() } }
        })),
    },
    from: vi.fn((_table: string) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn(),
        // Chainable methods return this for fluent API
    })),
};

// Helper to setup mock responses
export const setupMockSupabaseResponse = (
    table: string,
    method: 'select' | 'insert' | 'update' | 'delete',
    response: { data?: any; error?: any }
) => {
    const mockChain = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(response),
    };

    mockSupabaseClient.from.mockReturnValue(mockChain as any);
    return mockChain;
};

// Mock authenticated user
export const mockAuthUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
    }
};

// Setup authenticated session
export const setupAuthenticatedUser = () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null
    });
};

// Setup unauthenticated session
export const setupUnauthenticatedUser = () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
    });
};

// Reset all mocks
export const resetSupabaseMocks = () => {
    vi.clearAllMocks();
    mockSupabaseClient.from.mockClear();
    mockSupabaseClient.auth.getUser.mockClear();
};
