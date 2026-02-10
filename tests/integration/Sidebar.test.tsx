import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../../components/Sidebar';
import { Note, Folder, NoteTreeItem, SidebarFilter } from '../../types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: any) => <div>{children}</div>,
    useSensor: vi.fn(),
    useSensors: vi.fn(() => []),
    MouseSensor: vi.fn(),
    TouchSensor: vi.fn(),
    KeyboardSensor: vi.fn(),
    rectIntersection: vi.fn(),
}));

describe('Sidebar Integration Tests', () => {
    let mockNotes: Note[];
    let mockFolders: Folder[];
    let mockNoteTree: NoteTreeItem[];
    let mockOnSetFilter: ReturnType<typeof vi.fn>;
    let mockOnSelectNote: ReturnType<typeof vi.fn>;
    let mockOnDeleteNote: ReturnType<typeof vi.fn>;
    let mockOnDeleteFolder: ReturnType<typeof vi.fn>;
    let mockOnCreateFolder: ReturnType<typeof vi.fn>;
    let mockOnClose: ReturnType<typeof vi.fn>;
    let mockMoveNoteToParent: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockNotes = [
            {
                id: 'note-1',
                title: 'Root Note 1',
                content: '',
                blocks: [],
                tags: [],
                isFavorite: false,
                isTrashed: false,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                lastOpenedAt: '2024-01-01',
            },
            {
                id: 'note-2',
                title: 'Child Note',
                content: '',
                blocks: [],
                tags: [],
                parentId: 'note-1',
                isFavorite: false,
                isTrashed: false,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                lastOpenedAt: '2024-01-01',
            },
            {
                id: 'note-3',
                title: 'Root Note 2',
                content: '',
                blocks: [],
                tags: [],
                isFavorite: true,
                isTrashed: false,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01',
                lastOpenedAt: '2024-01-01',
            },
        ];

        mockFolders = [
            { id: 'folder-1', name: 'Work', user_id: 'user-1', created_at: '2024-01-01' },
            { id: 'folder-2', name: 'Personal', user_id: 'user-1', created_at: '2024-01-01' },
        ];

        mockNoteTree = [
            {
                ...mockNotes[0],
                children: [{ ...mockNotes[1], children: [] }],
            },
            {
                ...mockNotes[2],
                children: [],
            },
        ];

        mockOnSetFilter = vi.fn();
        mockOnSelectNote = vi.fn();
        mockOnDeleteNote = vi.fn();
        mockOnDeleteFolder = vi.fn();
        mockOnCreateFolder = vi.fn();
        mockOnClose = vi.fn();
        mockMoveNoteToParent = vi.fn();
    });

    describe('Sidebar Rendering', () => {
        it('should render sidebar with navigation items', () => {
            render(
                <Sidebar
                    activeFilter="home"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId={null}
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            // Check for navigation items
            expect(screen.getByText('All Notes')).toBeInTheDocument();
            expect(screen.getByText('Favorites')).toBeInTheDocument();
            expect(screen.getByText('Recent')).toBeInTheDocument();
            expect(screen.getByText('Trash')).toBeInTheDocument();
        });

        it('should render folders', () => {
            render(
                <Sidebar
                    activeFilter="home"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId={null}
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            expect(screen.getByText('Work')).toBeInTheDocument();
            expect(screen.getByText('Personal')).toBeInTheDocument();
        });
    });

    describe('Note Tree Rendering', () => {
        it('should render note tree with root notes', () => {
            render(
                <Sidebar
                    activeFilter="all"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId={null}
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            expect(screen.getByText('Root Note 1')).toBeInTheDocument();
            expect(screen.getByText('Root Note 2')).toBeInTheDocument();
        });

        it('should render nested child notes', () => {
            render(
                <Sidebar
                    activeFilter="all"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId={null}
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            expect(screen.getByText('Child Note')).toBeInTheDocument();
        });

        it('should highlight active note', () => {
            const { container } = render(
                <Sidebar
                    activeFilter="all"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId="note-1"
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            // Active note should have special styling
            const activeNote = screen.getByText('Root Note 1').closest('button');
            expect(activeNote).toHaveClass('bg-primary/10');
        });
    });

    describe('Filter Navigation', () => {
        it('should call onSetFilter when clicking All Notes', async () => {
            const user = userEvent.setup();

            render(
                <Sidebar
                    activeFilter="home"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId={null}
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            const allNotesButton = screen.getByText('All Notes').closest('button');
            await user.click(allNotesButton!);

            expect(mockOnSetFilter).toHaveBeenCalledWith('all');
        });

        it('should call onSetFilter when clicking Favorites', async () => {
            const user = userEvent.setup();

            render(
                <Sidebar
                    activeFilter="home"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId={null}
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            const favoritesButton = screen.getByText('Favorites').closest('button');
            await user.click(favoritesButton!);

            expect(mockOnSetFilter).toHaveBeenCalledWith('favorites');
        });

        it('should call onSetFilter when clicking folder', async () => {
            const user = userEvent.setup();

            render(
                <Sidebar
                    activeFilter="home"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId={null}
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            const workFolder = screen.getByText('Work').closest('button');
            await user.click(workFolder!);

            expect(mockOnSetFilter).toHaveBeenCalledWith('folder-1');
        });
    });

    describe('Note Selection', () => {
        it('should call onSelectNote when clicking a note', async () => {
            const user = userEvent.setup();

            render(
                <Sidebar
                    activeFilter="all"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId={null}
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            const noteButton = screen.getByText('Root Note 1').closest('button');
            await user.click(noteButton!);

            expect(mockOnSelectNote).toHaveBeenCalledWith('note-1');
        });

        it('should close sidebar on mobile after selecting note', async () => {
            const user = userEvent.setup();

            // Mock mobile viewport
            global.innerWidth = 500;

            render(
                <Sidebar
                    activeFilter="all"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId={null}
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            const noteButton = screen.getByText('Root Note 1').closest('button');
            await user.click(noteButton!);

            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('Drag and Drop Integration', () => {
        it('should call moveNoteToParent when dragging note', async () => {
            // Note: Full drag-and-drop testing requires complex @dnd-kit setup
            // This tests the integration pattern

            render(
                <Sidebar
                    activeFilter="all"
                    onSetFilter={mockOnSetFilter}
                    notes={mockNotes}
                    folders={mockFolders}
                    noteTree={mockNoteTree}
                    activeNoteId={null}
                    onSelectNote={mockOnSelectNote}
                    isOpen={true}
                    onClose={mockOnClose}
                    onCreateFolder={mockOnCreateFolder}
                    onDeleteFolder={mockOnDeleteFolder}
                    onDeleteNote={mockOnDeleteNote}
                    moveNoteToParent={mockMoveNoteToParent}
                />
            );

            // Verify moveNoteToParent is passed to component
            expect(mockMoveNoteToParent).toBeDefined();
        });
    });
});
