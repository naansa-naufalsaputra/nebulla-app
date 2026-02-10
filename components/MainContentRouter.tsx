import React from 'react';
import Dashboard from './Dashboard';
import TiptapEditor from './TiptapEditor';
import TiptapPreview from './TiptapPreview';
import { Note, NoteBlock, SidebarFilter } from '../types';

interface UserProfile {
    full_name?: string;
}

interface MainContentRouterProps {
    // State
    activeNote: Note | null;
    activeNoteId: string | null;
    filter: SidebarFilter;
    searchQuery: string;
    filteredNotes: Note[];
    isLoadingData: boolean;

    // Template Preview
    previewData: {
        blocks: NoteBlock[];
        font: string;
        title: string;
    } | null;
    isTemplateGalleryOpen: boolean;

    // Handlers
    onUpdateNote: (note: Note) => void;
    onUpdateNoteContent: (id: string, content: string) => void;
    onSelectNote: (id: string) => void;
    onCreateNote: () => Promise<void>;
    onSearchChange: (query: string) => void;
    onViewFavorites: () => void;
    onViewRecent: () => void;
    onViewTemplates: () => void;

    // Page Style (Notion-style)
    fontStyle: 'sans' | 'serif' | 'mono';
    isFullWidth: boolean;
    isSmallText: boolean;

    // User
    userProfile: UserProfile | null;
}

/**
 * Main content router component
 * Handles rendering of: Template Preview, Active Note Editor, Dashboard, and Search Results
 */
export const MainContentRouter: React.FC<MainContentRouterProps> = ({
    activeNote,
    activeNoteId,
    filter,
    searchQuery,
    filteredNotes,
    isLoadingData,
    previewData,
    isTemplateGalleryOpen,
    onUpdateNote,
    onUpdateNoteContent,
    onSelectNote,
    onCreateNote,
    onSearchChange,
    onViewFavorites,
    onViewRecent,
    onViewTemplates,
    fontStyle,
    isFullWidth,
    isSmallText,
    userProfile
}) => {
    // 1. Template Preview Mode
    if (previewData && isTemplateGalleryOpen) {
        return (
            <div className="flex-1 overflow-y-auto relative p-8">
                <TiptapPreview content={previewData.blocks.map(b => b.content).join('<br/>')} />
            </div>
        );
    }

    // 2. Active Note Editor
    if (activeNoteId && activeNote) {
        return (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Editor (Full Height) */}
                <div
                    className="flex-1 overflow-y-auto relative hidden-scrollbar"
                    id="scrollable-editor-container"
                >
                    <TiptapEditor
                        note={activeNote}
                        content={activeNote.content || ''}
                        onChange={(html) => onUpdateNoteContent(activeNote.id, html)}
                        onNoteUpdate={(updatedNote) => {
                            // Update entire note object (icon, cover_url, title, etc.)
                            onUpdateNote(updatedNote);
                        }}
                        fontStyle={fontStyle}
                        isFullWidth={isFullWidth}
                        isSmallText={isSmallText}
                    />
                </div>
            </div>
        );
    }

    // 3. Dashboard (Home View)
    if (filter === 'home' && !searchQuery) {
        return (
            <Dashboard
                userName={userProfile?.full_name || 'User'}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                onCreateNote={onCreateNote}
                onViewFavorites={onViewFavorites}
                onViewRecent={onViewRecent}
                onViewTemplates={onViewTemplates}
            />
        );
    }

    // 4. Search Results / Filtered Notes Grid
    return (
        <div className="p-4 md:p-8 overflow-y-auto h-full">
            {/* Header */}
            <h2 className="text-xl font-bold mb-6 text-text-main dark:text-white">
                {searchQuery ? 'Search Results' : filter}
            </h2>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredNotes.map(n => (
                    <div
                        key={n.id}
                        onClick={() => {
                            onSelectNote(n.id);
                            if (window.innerWidth < 1024) {
                                // Mobile: close sidebar after selection (handled in App.tsx)
                            }
                        }}
                        className="p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-color cursor-pointer hover:border-primary transition-colors"
                    >
                        <h3 className="font-bold text-text-main dark:text-white mb-2">
                            {n.title || 'Untitled'}
                        </h3>
                        <p className="text-sm text-text-secondary line-clamp-3">
                            {n.content?.replace(/<[^>]*>?/gm, '') || 'No preview'}
                        </p>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!isLoadingData && filteredNotes.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                        folder_open
                    </span>
                    <p>No notes found</p>
                </div>
            )}
        </div>
    );
};
