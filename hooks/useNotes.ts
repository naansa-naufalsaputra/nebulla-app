import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { notesService } from '../services';
import { Note, Folder, SidebarFilter, NoteTreeItem } from '../types';
import { FilterState } from '../components/SearchFilters';

export const useNotes = (session: any) => {
    // --- State ---
    const [notes, setNotes] = useState<Note[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<SidebarFilter>('home');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
        tags: [],
        folder: '',
        dateStart: '',
        dateEnd: ''
    });

    // --- Derived State ---
    const activeNote = useMemo(() =>
        notes.find(n => n.id === activeNoteId) || null
        , [notes, activeNoteId]);

    const activeNoteIdRef = useRef(activeNoteId);
    useEffect(() => {
        activeNoteIdRef.current = activeNoteId;
    }, [activeNoteId]);

    // --- Fetch Data ---
    const fetchNotes = useCallback(async () => {
        if (!session) {
            setNotes([]);
            setFolders([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const [fetchedNotes, fetchedFolders] = await Promise.all([
                notesService.fetchNotes(),
                notesService.fetchFolders()
            ]);
            setNotes(fetchedNotes);
            setFolders(fetchedFolders);
        } catch (err: any) {
            // Silently ignore AbortError - it's expected when requests are cancelled
            if (err.name === 'AbortError') return;

            console.error("Failed to fetch notes:", err);
            setError(err.message || "Failed to load notes");
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // --- filtering ---
    const filteredNotes = useMemo(() => {
        let result = [...notes];

        // 1. Sidebar Filter
        if (filter !== 'trash') {
            result = result.filter(n => !n.isTrashed);
        } else {
            result = result.filter(n => n.isTrashed);
        }

        if (filter === 'favorites') {
            result = result.filter(n => n.isFavorite);
        } else if (filter === 'recent') {
            result = result.sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime());
        } else if (filter !== 'all' && filter !== 'trash' && filter !== 'home') {
            // filter is a folder ID
            result = result.filter(n => n.folder === filter);
        }

        // 2. Search Query
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(n =>
                n.title.toLowerCase().includes(lowerQuery) ||
                n.tags?.some(t => t.toLowerCase().includes(lowerQuery)) ||
                (n.content && n.content.toLowerCase().includes(lowerQuery)) ||
                n.blocks?.some((b: any) => typeof b.content === 'string' && b.content.toLowerCase().includes(lowerQuery))
            );
        }

        // 3. Advanced Filters
        if (advancedFilters.folder) {
            result = result.filter(n => n.folder === advancedFilters.folder);
        }
        if (advancedFilters.tags.length > 0) {
            result = result.filter(n => n.tags?.some(t => advancedFilters.tags.includes(t)));
        }
        if (advancedFilters.dateStart) {
            const start = new Date(advancedFilters.dateStart).getTime();
            result = result.filter(n => new Date(n.updatedAt).getTime() >= start);
        }
        if (advancedFilters.dateEnd) {
            const endDate = new Date(advancedFilters.dateEnd);
            endDate.setHours(23, 59, 59, 999);
            result = result.filter(n => new Date(n.updatedAt).getTime() <= endDate.getTime());
        }

        return result;
    }, [notes, filter, searchQuery, advancedFilters]);

    // --- Actions ---

    // 4. Note Tree (Recursive & Memoized)
    const noteTree = useMemo(() => {
        const buildTree = (notes: Note[]): NoteTreeItem[] => {
            const noteMap = new Map<string, NoteTreeItem>();
            const roots: NoteTreeItem[] = [];

            // 1. Create all nodes
            notes.forEach(note => {
                noteMap.set(note.id, { ...note, children: [] });
            });

            // 2. Assemble tree
            notes.forEach(note => {
                const node = noteMap.get(note.id)!;
                if (note.parentId && noteMap.has(note.parentId)) {
                    const parent = noteMap.get(note.parentId)!;
                    parent.children.push(node);
                } else {
                    roots.push(node);
                }
            });

            return roots;
        };

        return buildTree(filteredNotes);
    }, [filteredNotes]);

    // --- Actions ---

    const createNote = async (overrideData?: Partial<Note>) => {
        const isReservedFilter = ['all', 'favorites', 'recent', 'trash', 'home'].includes(filter);
        const targetFolderId = !isReservedFilter ? filter : undefined;

        // FORCE NULL: Sanitize parentId to prevent empty strings
        let safeParentId: string | null | undefined = null;
        if (overrideData?.parentId) {
            const pid = String(overrideData.parentId).trim();
            if (pid !== "" && pid !== "null" && pid !== "undefined") {
                safeParentId = pid;
            }
        }

        const now = new Date().toISOString();
        const newNoteData: Note = {
            id: '',
            title: overrideData?.title ?? '',
            blocks: [{ id: Date.now().toString(), type: 'text', content: '' }],
            isFavorite: false,
            isTrashed: false,
            folder: targetFolderId,
            tags: [],
            createdAt: now,
            updatedAt: now,
            lastOpenedAt: now,
            ...overrideData,
            parentId: safeParentId, // Override to ensure no empty string
        };

        try {
            const createdNote = await notesService.createNote(newNoteData, session.user.id);
            setNotes(prev => [createdNote, ...prev]);
            setActiveNoteId(createdNote.id);
            setSearchQuery('');
            return createdNote;
        } catch (err: any) {
            console.error("Failed to create note:", err);
            setError("Failed to create note");
            throw err;
        }
    };

    const updateNote = async (note: Note) => {
        // Optimistic update
        setNotes(prev => prev.map(n => n.id === note.id ? note : n));

        // CRITICAL OPTIMIZATION:
        // If this is the currently active note, we ONLY update state.
        // The useEffect hook (auto-save) will handle the API call.
        // This prevents double-saving (once on keypress, once on debounce).
        if (note.id === activeNoteIdRef.current) {
            setSaveStatus('saving'); // UI feedback
            return;
        }

        try {
            await notesService.updateNote(note);
            setSaveStatus('saved');
        } catch (err) {
            console.error("Failed to update note:", err);
            setSaveStatus('error');
            // Revert logic could go here
        }
    };

    // Auto-save logic
    useEffect(() => {
        if (!activeNoteId || !activeNote) return;

        const timeoutId = setTimeout(async () => {
            setSaveStatus('saving');
            try {
                await notesService.updateNote(activeNote);
                setSaveStatus('saved');
            } catch (error) {
                console.error("Auto-save failed:", error);
                setSaveStatus('error');
            }
        }, 1500);

        return () => clearTimeout(timeoutId);
    }, [activeNote?.content, activeNote?.blocks, activeNote?.title, activeNote?.folder, activeNoteId]);


    const deleteNote = async (noteId: string) => {
        try {
            await notesService.trashNote(noteId);
            setNotes(prev => prev.filter(n => n.id !== noteId));
            if (activeNoteId === noteId) setActiveNoteId(null);
        } catch (err: any) {
            console.error("Failed to trash note:", err);
            setError("Failed to delete note");
        }
    };

    const emptyTrash = async () => {
        try {
            const trashedNotes = notes.filter(n => n.isTrashed);
            await Promise.all(trashedNotes.map(n => notesService.deleteNote(n.id)));
            setNotes(prev => prev.filter(n => !n.isTrashed));
        } catch (err) {
            console.error("Error emptying trash:", err);
            setError("Failed to empty trash");
        }
    };

    const moveNote = async (noteId: string, folderId: string) => {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        const updatedNote = { ...note, folder: folderId === '' ? undefined : folderId };
        setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));

        try {
            await notesService.updateNote(updatedNote);
        } catch (err) {
            console.error("Failed to move note:", err);
            // Revert logic could go here
        }
    };

    /**
     * Check if targetId is a descendant of sourceId
     * Prevents circular dependencies (parent becoming child of its own descendant)
     */
    const isDescendant = (
        sourceId: string,
        targetId: string,
        allNotes: Note[]
    ): boolean => {
        const findChildren = (parentId: string): string[] => {
            return allNotes
                .filter(n => n.parentId === parentId)
                .flatMap(n => [n.id, ...findChildren(n.id)]);
        };

        const descendants = findChildren(sourceId);
        return descendants.includes(targetId);
    };

    /**
     * Move note to become child of another note (or root if newParentId is null)
     * Used for drag and drop nesting functionality
     */
    const moveNoteToParent = async (
        noteId: string,
        newParentId: string | null
    ): Promise<void> => {
        // Circular dependency check
        if (newParentId && isDescendant(noteId, newParentId, notes)) {
            setError('Cannot move a note into its own child');
            return;
        }

        const note = notes.find(n => n.id === noteId);
        if (!note) {
            return;
        }

        // Optimistic update
        // CRITICAL: Must clear 'folder' property when moving to root or another parent
        // otherwise note stays in the folder view
        const updatedNote = { ...note, parentId: newParentId, folder: undefined };

        setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));

        try {
            await notesService.updateNote(updatedNote);
        } catch (err) {
            console.error('Failed to move note to parent:', err);
            setError('Failed to move note');
            // Revert on error
            setNotes(prev => prev.map(n => n.id === noteId ? note : n));
        }
    };

    const createFolder = async (folderName: string) => {
        if (!folderName || !folderName.trim()) return;
        try {
            const newFolder = await notesService.createFolder(folderName.trim());
            setFolders(prev => [...prev, newFolder]);
        } catch (err: any) {
            console.error("Failed to create folder:", err);
            setError("Failed to create folder");
        }
    };

    const deleteFolder = async (folderId: string) => {
        try {
            await notesService.deleteFolder(folderId);
            setFolders(prev => prev.filter(f => f.id !== folderId));
            // Move notes in this folder to Uncategorized (null) in local state
            setNotes(prev => prev.map(n => n.folder === folderId ? { ...n, folder: undefined } : n));
        } catch (err: any) {
            console.error("Failed to delete folder:", err);
            setError("Failed to delete folder");
        }
    };

    const migrateLocalData = async (localNotes: Note[]) => {
        setSaveStatus('saving');
        try {
            const createdFolder = await notesService.createFolder('Migrated from Local');
            setFolders(prev => [...prev, createdFolder]);

            for (const note of localNotes) {
                await notesService.createNote({
                    ...note,
                    folder: createdFolder.id
                }, session.user.id);
            }
            fetchNotes(); // Reload to be sure
        } catch (err) {
            console.error("Migration failed", err);
            setError("Migration failed");
        } finally {
            setSaveStatus('saved');
        }
    }

    // --- Global Event Listeners for Nested Pages ---
    useEffect(() => {
        const handleCreateNestedPage = async (e: Event) => {
            const { id, title } = (e as CustomEvent).detail;
            const currentParentId = activeNoteIdRef.current;

            if (!currentParentId) return;

            if (!currentParentId) return;

            // Determine folder from parent
            const parentNote = notes.find(n => n.id === currentParentId);
            let targetFolder = undefined;
            if (parentNote && parentNote.folder) {
                targetFolder = parentNote.folder;
            }

            try {
                await createNote({
                    id,
                    title: title || 'Untitled Page',
                    parentId: currentParentId,
                    folder: targetFolder,
                    blocks: [{ id: Date.now().toString(), type: 'text', content: '' }],
                });

                // 3. Navigation (User Requested)
                // Force URL update so it looks like we navigated
                window.history.pushState({}, '', `/note/${id}`);

            } catch (error) {
                console.error("Failed to create nested page:", error);
            }
        };

        const handleNavigateNote = (e: Event) => {
            const { noteId } = (e as CustomEvent).detail;
            setActiveNoteId(noteId);
        };

        window.addEventListener('create-nested-page', handleCreateNestedPage as EventListener);
        window.addEventListener('navigate-note', handleNavigateNote as EventListener);

        return () => {
            window.removeEventListener('create-nested-page', handleCreateNestedPage as EventListener);
            window.removeEventListener('navigate-note', handleNavigateNote as EventListener);
        };
    }, [notes, createNote]); // Dependencies

    return {
        notes,
        folders,
        activeNote,
        activeNoteId,
        setActiveNoteId,
        searchQuery,
        setSearchQuery,
        filter,
        setFilter,
        advancedFilters,
        setAdvancedFilters,
        isLoading,
        error,
        setError, // Expose to clear error
        saveStatus,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
        moveNote,
        moveNoteToParent, // For drag and drop nesting
        createFolder,
        deleteFolder,
        migrateLocalData,
        // Helper specifically requested?
        filteredNotes,
        emptyTrash,
        noteTree
    };
};
