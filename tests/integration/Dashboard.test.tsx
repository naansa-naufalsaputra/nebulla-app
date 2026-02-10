import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../components/Dashboard';

describe('Dashboard Integration Tests', () => {
    let mockOnSearchChange: ReturnType<typeof vi.fn>;
    let mockOnCreateNote: ReturnType<typeof vi.fn>;
    let mockOnViewFavorites: ReturnType<typeof vi.fn>;
    let mockOnViewRecent: ReturnType<typeof vi.fn>;
    let mockOnViewTemplates: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnSearchChange = vi.fn();
        mockOnCreateNote = vi.fn();
        mockOnViewFavorites = vi.fn();
        mockOnViewRecent = vi.fn();
        mockOnViewTemplates = vi.fn();

        // Mock Date for consistent greeting
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-01 10:00:00')); // Morning
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Dashboard Rendering', () => {
        it('should render greeting with user name', () => {
            render(
                <Dashboard
                    userName="John Doe"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            expect(screen.getByText(/Good Morning, John Doe/i)).toBeInTheDocument();
        });

        it('should render search input', () => {
            render(
                <Dashboard
                    userName="John Doe"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            const searchInput = screen.getByPlaceholderText(/search your thoughts/i);
            expect(searchInput).toBeInTheDocument();
        });

        it('should render all quick action cards', () => {
            render(
                <Dashboard
                    userName="John Doe"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            expect(screen.getByText('New Note')).toBeInTheDocument();
            expect(screen.getByText('Favorites')).toBeInTheDocument();
            expect(screen.getByText('Recent Documents')).toBeInTheDocument();
            expect(screen.getByText('Templates')).toBeInTheDocument();
        });
    });

    describe('Greeting Logic', () => {
        it('should show Good Morning before 12pm', () => {
            vi.setSystemTime(new Date('2024-01-01 10:00:00'));

            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            expect(screen.getByText(/Good Morning/i)).toBeInTheDocument();
        });

        it('should show Good Afternoon between 12pm and 6pm', () => {
            vi.setSystemTime(new Date('2024-01-01 14:00:00'));

            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            expect(screen.getByText(/Good Afternoon/i)).toBeInTheDocument();
        });

        it('should show Good Evening after 6pm', () => {
            vi.setSystemTime(new Date('2024-01-01 19:00:00'));

            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            expect(screen.getByText(/Good Evening/i)).toBeInTheDocument();
        });
    });

    describe('Search Functionality', () => {
        it('should call onSearchChange when typing in search', async () => {
            const user = userEvent.setup({ delay: null });

            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            const searchInput = screen.getByPlaceholderText(/search your thoughts/i);
            await user.type(searchInput, 'test query');

            expect(mockOnSearchChange).toHaveBeenCalled();
            expect(mockOnSearchChange).toHaveBeenCalledWith(expect.stringContaining('t'));
        });

        it('should display current search query', () => {
            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery="existing query"
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            const searchInput = screen.getByPlaceholderText(/search your thoughts/i) as HTMLInputElement;
            expect(searchInput.value).toBe('existing query');
        });
    });

    describe('Quick Actions', () => {
        it('should call onCreateNote when clicking New Note', async () => {
            const user = userEvent.setup();

            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            const newNoteButton = screen.getByText('New Note').closest('button');
            await user.click(newNoteButton!);

            expect(mockOnCreateNote).toHaveBeenCalled();
        });

        it('should call onViewFavorites when clicking Favorites', async () => {
            const user = userEvent.setup();

            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            const favoritesButton = screen.getByText('Favorites').closest('button');
            await user.click(favoritesButton!);

            expect(mockOnViewFavorites).toHaveBeenCalled();
        });

        it('should call onViewRecent when clicking Recent Documents', async () => {
            const user = userEvent.setup();

            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            const recentButton = screen.getByText('Recent Documents').closest('button');
            await user.click(recentButton!);

            expect(mockOnViewRecent).toHaveBeenCalled();
        });

        it('should call onViewTemplates when clicking Templates', async () => {
            const user = userEvent.setup();

            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            const templatesButton = screen.getByText('Templates').closest('button');
            await user.click(templatesButton!);

            expect(mockOnViewTemplates).toHaveBeenCalled();
        });
    });

    describe('Visual Elements', () => {
        it('should render search icon', () => {
            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            const searchIcon = screen.getByText('search');
            expect(searchIcon).toBeInTheDocument();
        });

        it('should render action card icons', () => {
            render(
                <Dashboard
                    userName="John"
                    onSearchChange={mockOnSearchChange}
                    searchQuery=""
                    onCreateNote={mockOnCreateNote}
                    onViewFavorites={mockOnViewFavorites}
                    onViewRecent={mockOnViewRecent}
                    onViewTemplates={mockOnViewTemplates}
                />
            );

            expect(screen.getByText('add')).toBeInTheDocument(); // New Note icon
            expect(screen.getByText('star')).toBeInTheDocument(); // Favorites icon
            expect(screen.getByText('schedule')).toBeInTheDocument(); // Recent icon
            expect(screen.getByText('dashboard')).toBeInTheDocument(); // Templates icon
        });
    });
});
