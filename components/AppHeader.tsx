import React, { useState } from 'react';
import SearchFilters from './SearchFilters';
import { Note } from '../types';
import { FilterState } from './SearchFilters';
import { PageStyleMenu } from './editor/PageStyleMenu';

interface UserProfile {
    full_name?: string;
    avatar_url?: string;
}

interface AppHeaderProps {
    // Search
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isSearchFiltersOpen: boolean;
    onToggleSearchFilters: () => void;

    // Filters
    availableTags: string[];
    availableFolders: string[];
    advancedFilters: FilterState;
    setAdvancedFilters: React.Dispatch<React.SetStateAction<FilterState>>;

    // Actions
    activeNote: Note | null;
    onSaveTemplate: () => void;
    onExport: () => void;
    onToggleAISidebar: () => void;
    onToggleSidebar: () => void;
    onOpenSettings: () => void;
    onSignOut: () => void;

    // Page Styles
    fontStyle: 'sans' | 'serif' | 'mono';
    setFontStyle: (style: 'sans' | 'serif' | 'mono') => void;
    isFullWidth: boolean;
    setIsFullWidth: (value: boolean) => void;
    isSmallText: boolean;
    setIsSmallText: (value: boolean) => void;
    onNoteUpdate: (updates: Partial<Note>) => void;

    // User
    userProfile: UserProfile | null;
}

/**
 * Application header component with search, actions, and user menu
 * Responsive design with mobile sidebar toggle
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
    searchQuery,
    onSearchChange,
    isSearchFiltersOpen,
    onToggleSearchFilters,
    availableTags,
    availableFolders,
    advancedFilters,
    setAdvancedFilters,
    activeNote,
    onSaveTemplate,
    onExport,
    onToggleAISidebar,
    onToggleSidebar,
    onOpenSettings,
    onSignOut,
    fontStyle,
    setFontStyle,
    isFullWidth,
    setIsFullWidth,
    isSmallText,
    setIsSmallText,
    onNoteUpdate,
    userProfile
}) => {
    const [isPageStyleMenuOpen, setIsPageStyleMenuOpen] = useState(false);

    return (
        <header className="flex items-center justify-between border-b border-border-color dark:border-white/10 bg-surface-light dark:bg-void/30 dark:backdrop-blur-md px-4 py-3 z-20 transition-colors duration-300">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                {/* Hamburger Menu Button (Desktop + Mobile) */}
                <button
                    onClick={onToggleSidebar}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                {/* Logo */}
                <h2 className="font-bold text-xl hidden sm:block">Nebulla</h2>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex relative items-center bg-background-light dark:bg-background-dark rounded-full border px-2">
                    <span className="material-symbols-outlined text-gray-400">search</span>
                    <input
                        className="bg-transparent border-none text-sm p-1 focus:ring-0 w-48"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <button
                        onClick={onToggleSearchFilters}
                        className="p-1"
                        aria-label="Toggle search filters"
                    >
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                    </button>
                </div>

                {/* Search Filters Panel */}
                <SearchFilters
                    isOpen={isSearchFiltersOpen}
                    onClose={() => onToggleSearchFilters()}
                    availableTags={availableTags}
                    availableFolders={availableFolders}
                    filters={advancedFilters}
                    setFilters={setAdvancedFilters}
                />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Note Actions (Only when note is active) */}
                {activeNote && (
                    <>
                        <button
                            onClick={onSaveTemplate}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Save as template"
                            title="Save as Template"
                        >
                            <span className="material-symbols-outlined">save_as</span>
                        </button>
                        <button
                            onClick={onExport}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Export note"
                            title="Export Note"
                        >
                            <span className="material-symbols-outlined">ios_share</span>
                        </button>

                        {/* Page Style Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsPageStyleMenuOpen(!isPageStyleMenuOpen)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                aria-label="Page style options"
                                title="Page Style"
                            >
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>

                            {isPageStyleMenuOpen && (
                                <PageStyleMenu
                                    fontStyle={fontStyle}
                                    setFontStyle={(style) => {
                                        setFontStyle(style);
                                        if (activeNote) {
                                            onNoteUpdate({ ...activeNote, font_style: style });
                                        }
                                    }}
                                    isFullWidth={isFullWidth}
                                    setIsFullWidth={(value) => {
                                        setIsFullWidth(value);
                                        if (activeNote) {
                                            onNoteUpdate({ ...activeNote, is_full_width: value });
                                        }
                                    }}
                                    isSmallText={isSmallText}
                                    setIsSmallText={(value) => {
                                        setIsSmallText(value);
                                        if (activeNote) {
                                            onNoteUpdate({ ...activeNote, is_small_text: value });
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </>
                )}

                {/* AI Sidebar Toggle */}
                <button
                    onClick={onToggleAISidebar}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Toggle AI sidebar"
                    title="Ask AI"
                >
                    <span className="material-symbols-outlined">auto_awesome</span>
                </button>

                {/* Settings */}
                <button
                    onClick={onOpenSettings}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Open settings"
                    title="Settings"
                >
                    <span className="material-symbols-outlined">settings</span>
                </button>

                {/* User Avatar / Sign Out */}
                <button
                    onClick={onSignOut}
                    className="size-8 rounded-full bg-primary flex items-center justify-center text-white font-bold hover:opacity-90 transition-opacity"
                    aria-label="Sign out"
                    title="Profile & Sign Out"
                >
                    {userProfile?.avatar_url ? (
                        <img
                            src={userProfile.avatar_url}
                            alt="User avatar"
                            className="size-8 rounded-full object-cover"
                        />
                    ) : (
                        'A'
                    )}
                </button>
            </div>
        </header>
    );
};
