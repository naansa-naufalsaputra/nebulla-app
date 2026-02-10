import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AISidebar from './components/AISidebar';
import AIFloatingModal from './components/AIFloatingModal';
import LoginScreen from './components/LoginScreen';
import { Toaster } from './components/ui/Toast';
import { supabase } from './lib/supabaseClient';
import { AnimatePresence } from 'framer-motion';
import { useNotes } from './hooks/useNotes';
import { useSettings } from './hooks/useSettings';
import { useAppEffects } from './hooks/useAppEffects';
import { useNoteHandlers } from './hooks/useNoteHandlers';
import { Note, NoteBlock } from './types';

// Architecture Components
import { MainLayout } from './components/MainLayout';
import { ModalManager } from './components/ModalManager';
import { AppHeader } from './components/AppHeader';
import { MainContentRouter } from './components/MainContentRouter';
import { AIModal } from './components/modals/AIModal';

const App: React.FC = () => {
    useSettings();

    // --- Auth State ---
    const [session, setSession] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // --- Modal State ---
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
    const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // --- UI State ---
    const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
    const [isSearchFiltersOpen, setIsSearchFiltersOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        // Persist sidebar state in localStorage
        const saved = localStorage.getItem('nebulla-sidebar-open');
        return saved !== 'false'; // Default to true if not set
    });
    const [localNotesToMigrate, setLocalNotesToMigrate] = useState<Note[] | null>(null);
    const [previewData, setPreviewData] = useState<{
        blocks: NoteBlock[];
        font: string;
        title: string;
    } | null>(null);

    // --- Page Style State (Per-Note, reactive) ---
    const [fontStyle, setFontStyle] = useState<'sans' | 'serif' | 'mono'>('sans');
    const [isFullWidth, setIsFullWidth] = useState(false);
    const [isSmallText, setIsSmallText] = useState(false);

    // --- Notes Logic ---
    const {
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
        isLoading: isLoadingData,
        error: notesError,
        createNote,
        updateNote,
        deleteNote,
        moveNote,
        moveNoteToParent,
        createFolder,
        deleteFolder,
        migrateLocalData,
        filteredNotes,
        emptyTrash,
        noteTree
    } = useNotes(session);

    // --- Custom Hooks ---
    useAppEffects({
        setIsAIModalOpen,
        setSession,
        setAuthLoading,
        isLoadingData,
        notesLength: notes.length,
        setLocalNotesToMigrate,
        setIsMigrationModalOpen,
        notesError
    });

    const handlers = useNoteHandlers({
        activeNote,
        createNote,
        updateNote,
        moveNote,
        setIsSidebarOpen,
        setIsTemplateGalleryOpen,
        setPreviewData
    });

    // --- Event Listeners ---
    useEffect(() => {
        const handleOpenAIModal = () => {
            setIsAIModalOpen(true);
        };

        window.addEventListener('nebulla:open-ai-modal', handleOpenAIModal);

        return () => {
            window.removeEventListener('nebulla:open-ai-modal', handleOpenAIModal);
        };
    }, []);

    // --- Persist Sidebar State ---
    useEffect(() => {
        localStorage.setItem('nebulla-sidebar-open', String(isSidebarOpen));
    }, [isSidebarOpen]);

    // --- Sync page styles with activeNote (prevents style leakage) ---
    useEffect(() => {
        if (activeNote) {
            setFontStyle(activeNote.font_style || 'sans');
            setIsFullWidth(activeNote.is_full_width || false);
            setIsSmallText(activeNote.is_small_text || false);
        } else {
            // Reset to defaults when no note is active
            setFontStyle('sans');
            setIsFullWidth(false);
            setIsSmallText(false);
        }
    }, [activeNote?.id]); // Only re-run when note ID changes

    // --- Derived State ---
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        notes.forEach(note => note.tags?.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, [notes]);

    const availableFolders = folders.map(f => f.name);

    const activeNoteContentString = activeNote
        ? (activeNote.content || activeNote.blocks?.map(b => typeof b.content === 'string' ? b.content : '').join(' ') || '')
        : '';


    // --- Early Return for Unauthenticated ---
    if (!session) {
        return (
            <AnimatePresence>
                {!authLoading && <LoginScreen />}
            </AnimatePresence>
        );
    }

    // --- Main Render ---
    return (
        <MainLayout
            isSidebarOpen={isSidebarOpen}
            sidebar={
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    activeFilter={filter}
                    onSetFilter={(f) => {
                        setFilter(f);
                        setActiveNoteId(null);
                        setSearchQuery('');
                        setIsSidebarOpen(false);
                    }}
                    notes={filteredNotes}
                    folders={folders}
                    noteTree={noteTree}
                    activeNoteId={activeNoteId}
                    onSelectNote={(id) => {
                        setActiveNoteId(id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    onDeleteNote={deleteNote}
                    onDeleteFolder={deleteFolder}
                    onCreateFolder={() => setIsCreateFolderOpen(true)}
                    onImportNote={handlers.handleImportNote}
                    onEmptyTrash={emptyTrash}
                    onOpenTemplateGallery={() => setIsTemplateGalleryOpen(true)}
                    moveNoteToParent={moveNoteToParent}
                />
            }
            aiSidebar={
                <AISidebar
                    isOpen={isAiSidebarOpen}
                    onClose={() => setIsAiSidebarOpen(false)}
                    activeNoteContent={activeNoteContentString}
                    onExportToNote={handlers.handleExportToNote}
                />
            }
            floatingModal={
                <AnimatePresence>
                    {isAIModalOpen && (
                        <AIFloatingModal
                            isOpen={isAIModalOpen}
                            onClose={() => setIsAIModalOpen(false)}
                            currentNoteContent={activeNote ? (activeNote.content || '') : ''}
                        />
                    )}
                </AnimatePresence>
            }
        >
            <AppHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isSearchFiltersOpen={isSearchFiltersOpen}
                onToggleSearchFilters={() => setIsSearchFiltersOpen(!isSearchFiltersOpen)}
                availableTags={availableTags}
                availableFolders={availableFolders}
                advancedFilters={advancedFilters}
                setAdvancedFilters={setAdvancedFilters}
                activeNote={activeNote}
                onSaveTemplate={() => setIsSaveTemplateOpen(true)}
                onExport={() => setIsExportOpen(true)}
                onToggleAISidebar={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onSignOut={() => supabase.auth.signOut()}
                fontStyle={fontStyle}
                setFontStyle={setFontStyle}
                isFullWidth={isFullWidth}
                setIsFullWidth={setIsFullWidth}
                isSmallText={isSmallText}
                setIsSmallText={setIsSmallText}
                onNoteUpdate={(updates) => {
                    if (activeNote) {
                        updateNote({ ...activeNote, ...updates });
                    }
                }}
            />

            <main className="flex-1 flex flex-col relative bg-surface overflow-hidden">
                <MainContentRouter
                    activeNote={activeNote}
                    activeNoteId={activeNoteId}
                    filter={filter}
                    searchQuery={searchQuery}
                    filteredNotes={filteredNotes}
                    isLoadingData={isLoadingData}
                    previewData={previewData}
                    isTemplateGalleryOpen={isTemplateGalleryOpen}
                    onUpdateNote={updateNote}
                    onUpdateNoteContent={handlers.updateNoteContent}
                    onSelectNote={(id) => {
                        setActiveNoteId(id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    onCreateNote={handlers.handleCreateNote}
                    onSearchChange={setSearchQuery}
                    onViewFavorites={() => setFilter('favorites')}
                    onViewRecent={() => setFilter('recent')}
                    onViewTemplates={() => setIsTemplateGalleryOpen(true)}
                    onImportPDF={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handlers.handleImportNote(file);
                        };
                        input.click();
                    }}
                    fontStyle={fontStyle}
                    isFullWidth={isFullWidth}
                    isSmallText={isSmallText}
                    user={session?.user}
                />
            </main>

            <ModalManager
                settings={{
                    isOpen: isSettingsOpen,
                    onClose: () => setIsSettingsOpen(false)
                }}
                createFolder={{
                    isOpen: isCreateFolderOpen,
                    onClose: () => setIsCreateFolderOpen(false),
                    onSave: createFolder
                }}
                exportModal={{
                    isOpen: isExportOpen,
                    onClose: () => setIsExportOpen(false),
                    note: activeNote || undefined
                }}
                saveTemplate={{
                    isOpen: isSaveTemplateOpen,
                    onClose: () => setIsSaveTemplateOpen(false),
                    onSave: handlers.handleSaveTemplate
                }}
                migration={{
                    isOpen: isMigrationModalOpen,
                    onClose: () => setIsMigrationModalOpen(false),
                    onConfirm: () => {
                        if (localNotesToMigrate) migrateLocalData(localNotesToMigrate);
                        setIsMigrationModalOpen(false);
                        setLocalNotesToMigrate(null);
                    }
                }}
                templates={{
                    isOpen: isTemplateGalleryOpen,
                    onClose: () => setIsTemplateGalleryOpen(false),
                    onSelect: handlers.handleTemplateSelect,
                    onHover: handlers.handleTemplateHover
                }}
            />

            {/* AI Modal */}
            <AIModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
            />

            <Toaster />
        </MainLayout>
    );
};

export default App;