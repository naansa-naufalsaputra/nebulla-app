import { Note, NoteBlock, BlockStyle } from '../types';

interface UseNoteHandlersParams {
    activeNote: Note | null;
    createNote: (data?: Partial<Note>) => Promise<Note>;
    updateNote: (note: Note) => void;
    moveNote: (noteId: string, folderId: string) => Promise<void>;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsTemplateGalleryOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPreviewData: React.Dispatch<React.SetStateAction<{
        blocks: NoteBlock[];
        font: string;
        title: string;
    } | null>>;
}

interface NoteHandlers {
    handleCreateNote: () => Promise<void>;
    handleMoveNote: (noteId: string, folderId: string) => Promise<void>;
    handleImportNote: (file: File) => Promise<void>;
    handleSaveTemplate: (name: string, category: string) => void;
    handleTemplateSelect: (title: string, blocks: NoteBlock[], font: string) => Promise<void>;
    handleTemplateHover: (title: string | null, blocks: NoteBlock[] | null, font: string | null) => void;
    handleExportToNote: (blocksToAdd: Array<{ content: string }>) => void;
    updateNoteContent: (id: string, newContent: string) => void;
}

/**
 * Custom hook to manage all note-related handler functions
 * Handles: create, import, move, template operations, and content updates
 */
export const useNoteHandlers = ({
    activeNote,
    createNote,
    updateNote,
    moveNote,
    setIsSidebarOpen,
    setIsTemplateGalleryOpen,
    setPreviewData
}: UseNoteHandlersParams): NoteHandlers => {

    const handleCreateNote = async (): Promise<void> => {
        const createdNote = await createNote();
        if (createdNote && window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    const handleMoveNote = async (noteId: string, folderId: string): Promise<void> => {
        await moveNote(noteId, folderId);
    };

    const handleImportNote = async (file: File): Promise<void> => {
        try {
            let extractedText = '';
            const now = new Date().toISOString();

            // Parse different file types
            if (file.name.endsWith('.pdf')) {
                const { parsePDF } = await import('../utils/docParser');
                extractedText = await parsePDF(file);
            } else if (file.name.endsWith('.docx')) {
                const { parseDOCX } = await import('../utils/docParser');
                extractedText = await parseDOCX(file);
            } else {
                extractedText = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsText(file);
                });
            }

            let newNoteData: Partial<Note>;

            if (file.name.endsWith('.json')) {
                const parsed = JSON.parse(extractedText);
                newNoteData = {
                    ...parsed,
                    id: '',
                    createdAt: now,
                    updatedAt: now,
                    lastOpenedAt: now
                };
            } else {
                const blocks: NoteBlock[] = extractedText
                    .split(/\n\s*\n/)
                    .map((para, idx) => ({
                        id: Date.now().toString() + idx,
                        type: 'text' as const,
                        content: para.trim(),
                        style: { fontFamily: 'Inter' as const }
                    }))
                    .filter(b => b.content.length > 0);

                if (blocks.length === 0) {
                    blocks.push({
                        id: Date.now().toString(),
                        type: 'text',
                        content: ''
                    });
                }

                newNoteData = {
                    id: '',
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    blocks,
                    isFavorite: false,
                    isTrashed: false,
                    folder: undefined,
                    tags: [],
                    createdAt: now,
                    updatedAt: now,
                    lastOpenedAt: now
                };
            }

            await createNote(newNoteData);
            alert('Note imported successfully!');
        } catch (err) {
            console.error('Import failed:', err);
            alert('Failed to import note.');
        }
    };

    const handleSaveTemplate = (name: string, category: string): void => {
        const blocks = activeNote?.blocks || [];
        const defaultFont = blocks[0]?.style?.fontFamily || 'Inter';

        const newTemplate = {
            id: `custom_${Date.now()}`,
            name,
            category,
            description: 'Custom',
            default_font: defaultFont,
            layout: blocks,
            isCustom: true,
            content: activeNote?.content
        };

        const existing = JSON.parse(localStorage.getItem('nebulla_custom_templates') || '[]');
        localStorage.setItem('nebulla_custom_templates', JSON.stringify([...existing, newTemplate]));
        alert('Template saved successfully!');
    };

    const handleTemplateSelect = async (title: string, blocks: NoteBlock[], font: string): Promise<void> => {
        const now = new Date().toISOString();
        const freshBlocks = blocks.map((b, idx) => ({
            ...b,
            id: Date.now().toString() + idx,
            style: {
                ...b.style,
                fontFamily: font as BlockStyle['fontFamily']
            }
        }));

        await createNote({
            id: '',
            title,
            blocks: freshBlocks,
            isFavorite: false,
            isTrashed: false,
            tags: ['template'],
            createdAt: now,
            updatedAt: now,
            lastOpenedAt: now
        });

        setIsTemplateGalleryOpen(false);
        setPreviewData(null);
    };

    const handleTemplateHover = (
        title: string | null,
        blocks: NoteBlock[] | null,
        font: string | null
    ): void => {
        if (blocks && title) {
            setPreviewData({
                blocks: blocks.map((b, idx) => ({
                    ...b,
                    id: 'preview-' + idx,
                    style: {
                        ...b.style,
                        fontFamily: (font as BlockStyle['fontFamily']) || 'Inter'
                    }
                })),
                font: font || 'Inter',
                title
            });
        } else {
            setPreviewData(null);
        }
    };

    const handleExportToNote = (blocksToAdd: Array<{ content: string }>): void => {
        if (!activeNote) return;

        const newHtml = blocksToAdd.map((b) => `<p>${b.content}</p>`).join('');
        updateNote({
            ...activeNote,
            content: (activeNote.content || '') + newHtml,
            updatedAt: new Date().toISOString()
        });
    };

    const updateNoteContent = (id: string, newContent: string): void => {
        if (activeNote && activeNote.id === id) {
            updateNote({
                ...activeNote,
                content: newContent,
                updatedAt: new Date().toISOString()
            });
        }
    };

    return {
        handleCreateNote,
        handleMoveNote,
        handleImportNote,
        handleSaveTemplate,
        handleTemplateSelect,
        handleTemplateHover,
        handleExportToNote,
        updateNoteContent
    };
};
