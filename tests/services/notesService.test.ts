import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notesService } from '../../services/notesService';
import { supabase } from '../../lib/supabaseClient';
import { Note } from '../../types';

// Mock Supabase
vi.mock('../../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(),
    },
}));

describe('notesService', () => {
    const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
    };

    const mockNote = {
        id: 'note-1',
        user_id: 'test-user-id',
        title: 'Test Note',
        blocks: '<p>Test content</p>',
        folder_id: null,
        parent_id: null,
        tags: ['test'],
        is_favorite: false,
        is_trashed: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_opened_at: '2024-01-01T00:00:00Z',
        icon: null,
        cover_url: null,
        cover_position: 50,
        font_style: 'sans',
        is_full_width: false,
        is_small_text: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup authenticated user by default
        (supabase.auth.getUser as any).mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });
    });

    describe('fetchNotes', () => {
        it('should fetch and map notes correctly', async () => {
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({
                    data: [mockNote],
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const notes = await notesService.fetchNotes();

            expect(supabase.from).toHaveBeenCalledWith('notes');
            expect(mockChain.select).toHaveBeenCalledWith('*');
            expect(mockChain.eq).toHaveBeenCalledWith('user_id', mockUser.id);
            expect(mockChain.order).toHaveBeenCalledWith('updated_at', { ascending: false });

            expect(notes).toHaveLength(1);
            expect(notes[0]).toMatchObject({
                id: 'note-1',
                title: 'Test Note',
                content: '<p>Test content</p>', // CRITICAL: blocks mapped to content
                blocks: '<p>Test content</p>',
                tags: ['test'],
                isFavorite: false,
                isTrashed: false,
            });
        });

        it('should throw error when user not authenticated', async () => {
            (supabase.auth.getUser as any).mockResolvedValue({
                data: { user: null },
                error: null,
            });

            await expect(notesService.fetchNotes()).rejects.toThrow('User not authenticated');
        });

        it('should handle database errors', async () => {
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockResolvedValue({
                    data: null,
                    error: new Error('Database error'),
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            await expect(notesService.fetchNotes()).rejects.toThrow('Database error');
        });
    });

    describe('createNote', () => {
        it('should sanitize parent_id correctly - valid UUID', async () => {
            const mockChain = {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: { ...mockNote, parent_id: 'parent-uuid' },
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const newNote: Partial<Note> = {
                title: 'Child Note',
                content: '<p>Content</p>',
                parentId: 'parent-uuid',
            };

            await notesService.createNote(newNote, mockUser.id);

            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    parent_id: 'parent-uuid',
                })
            );
        });

        it('should sanitize parent_id correctly - NULL', async () => {
            const mockChain = {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: mockNote,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const newNote: Partial<Note> = {
                title: 'Root Note',
                content: '<p>Content</p>',
                parentId: undefined,
            };

            await notesService.createNote(newNote, mockUser.id);

            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    parent_id: null,
                })
            );
        });

        it('should sanitize parent_id correctly - empty string to NULL', async () => {
            const mockChain = {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: mockNote,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const newNote: Partial<Note> = {
                title: 'Root Note',
                content: '<p>Content</p>',
                parentId: '',
            };

            await notesService.createNote(newNote, mockUser.id);

            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    parent_id: null,
                })
            );
        });

        it('should sanitize parent_id correctly - "null" string to NULL', async () => {
            const mockChain = {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: mockNote,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const newNote: Partial<Note> = {
                title: 'Root Note',
                content: '<p>Content</p>',
                parentId: 'null',
            };

            await notesService.createNote(newNote, mockUser.id);

            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    parent_id: null,
                })
            );
        });

        it('should map content to blocks column', async () => {
            const mockChain = {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: mockNote,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const newNote: Partial<Note> = {
                title: 'Test Note',
                content: '<p>HTML content</p>',
            };

            await notesService.createNote(newNote, mockUser.id);

            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    blocks: '<p>HTML content</p>', // CRITICAL: content mapped to blocks
                })
            );
        });

        it('should include page style fields', async () => {
            const mockChain = {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: mockNote,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const newNote: Partial<Note> = {
                title: 'Styled Note',
                content: '<p>Content</p>',
                font_style: 'serif',
                is_full_width: true,
                is_small_text: true,
            };

            await notesService.createNote(newNote, mockUser.id);

            expect(mockChain.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    font_style: 'serif',
                    is_full_width: true,
                    is_small_text: true,
                })
            );
        });
    });

    describe('updateNote', () => {
        it('should map content to blocks column', async () => {
            const mockChain = {
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const updatedNote: Note = {
                id: 'note-1',
                title: 'Updated Note',
                content: '<p>Updated HTML content</p>',
                blocks: [],
                tags: [],
                isFavorite: false,
                isTrashed: false,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                lastOpenedAt: '2024-01-01T00:00:00Z',
            };

            await notesService.updateNote(updatedNote);

            expect(mockChain.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    blocks: '<p>Updated HTML content</p>', // CRITICAL: content mapped to blocks
                })
            );
        });

        it('should persist page style fields', async () => {
            const mockChain = {
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const updatedNote: Note = {
                id: 'note-1',
                title: 'Styled Note',
                content: '<p>Content</p>',
                blocks: [],
                tags: [],
                isFavorite: false,
                isTrashed: false,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                lastOpenedAt: '2024-01-01T00:00:00Z',
                font_style: 'mono',
                is_full_width: true,
                is_small_text: false,
            };

            await notesService.updateNote(updatedNote);

            expect(mockChain.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    font_style: 'mono',
                    is_full_width: true,
                    is_small_text: false,
                })
            );
        });
    });

    describe('trashNote', () => {
        it('should soft delete note', async () => {
            const mockChain = {
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            await notesService.trashNote('note-1');

            expect(mockChain.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    is_trashed: true,
                })
            );
            expect(mockChain.eq).toHaveBeenCalledWith('id', 'note-1');
        });
    });

    describe('deleteNote', () => {
        it('should permanently delete note', async () => {
            const mockChain = {
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            await notesService.deleteNote('note-1');

            expect(supabase.from).toHaveBeenCalledWith('notes');
            expect(mockChain.delete).toHaveBeenCalled();
            expect(mockChain.eq).toHaveBeenCalledWith('id', 'note-1');
        });
    });

    describe('emptyTrash', () => {
        it('should delete all trashed notes for user', async () => {
            const mockChain = {
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
            };

            // First eq call returns this, second eq call resolves
            mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({
                data: null,
                error: null,
            });

            (supabase.from as any).mockReturnValue(mockChain);

            await notesService.emptyTrash();

            expect(mockChain.delete).toHaveBeenCalled();
            expect(mockChain.eq).toHaveBeenCalledWith('user_id', mockUser.id);
            expect(mockChain.eq).toHaveBeenCalledWith('is_trashed', true);
        });
    });

    describe('Folder operations', () => {
        it('should fetch folders', async () => {
            const mockFolders = [
                { id: 'folder-1', name: 'Work', user_id: mockUser.id },
                { id: 'folder-2', name: 'Personal', user_id: mockUser.id },
            ];

            const mockChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({
                    data: mockFolders,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const folders = await notesService.fetchFolders();

            expect(supabase.from).toHaveBeenCalledWith('folders');
            expect(folders).toEqual(mockFolders);
        });

        it('should create folder', async () => {
            const newFolder = { id: 'folder-1', name: 'New Folder', user_id: mockUser.id };

            const mockChain = {
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: newFolder,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            const folder = await notesService.createFolder('New Folder');

            expect(mockChain.insert).toHaveBeenCalledWith({
                user_id: mockUser.id,
                name: 'New Folder',
            });
            expect(folder).toEqual(newFolder);
        });

        it('should delete folder', async () => {
            const mockChain = {
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                }),
            };

            (supabase.from as any).mockReturnValue(mockChain);

            await notesService.deleteFolder('folder-1');

            expect(mockChain.delete).toHaveBeenCalled();
            expect(mockChain.eq).toHaveBeenCalledWith('id', 'folder-1');
        });
    });
});
