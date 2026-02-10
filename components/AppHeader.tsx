import React, { useState, useEffect, useRef } from 'react';
import SearchFilters from './SearchFilters';
import { Note } from '../types';
import { FilterState } from './SearchFilters';
import { PageStyleMenu } from './editor/PageStyleMenu';
import { supabase } from '../lib/supabaseClient';
import { Ghost } from 'lucide-react';

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
    onNoteUpdate
}) => {
    const [isPageStyleMenuOpen, setIsPageStyleMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [userName, setUserName] = useState('User');
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState<'Owner' | 'Member' | 'Guest'>('Guest');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const isOwner = user.email === 'naufalnamikaze175@gmail.com';
                const isGuest = !user || user.is_anonymous;
                const role = isOwner ? 'Owner' : (isGuest ? 'Guest' : 'Member');

                const displayName = user.user_metadata?.full_name
                    || user.email?.split('@')[0]
                    || 'User';

                setUserName(displayName);
                setUserEmail(user.email || '');
                setUserRole(role);
                setAvatarUrl(user.user_metadata?.avatar_url || null);
            } else {
                setUserName('Guest User');
                setUserEmail('');
                setUserRole('Guest');
                setAvatarUrl(null);
            }
        };
        fetchUser();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper function to get initials
    const getInitials = (name: string): string => {
        const parts = name.split(' ').filter(p => p.length > 0);
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

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

                {/* User Avatar with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="size-8 rounded-full bg-gradient-to-br from-neon-pink to-purple-600 flex items-center justify-center text-white font-bold hover:opacity-90 transition-opacity overflow-hidden"
                        aria-label="User menu"
                        title="Profile & Settings"
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="User avatar"
                                className="size-8 rounded-full object-cover"
                            />
                        ) : userRole === 'Guest' ? (
                            <Ghost size={18} className="text-gray-300" />
                        ) : (
                            <span className="text-sm font-bold">{getInitials(userName)}</span>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                            {/* Header with Name & Email */}
                            <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {userName}
                                </p>
                                {userEmail && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        {userEmail}
                                    </p>
                                )}
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        onOpenSettings();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">settings</span>
                                    Settings
                                </button>
                                <button
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        onSignOut();
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
