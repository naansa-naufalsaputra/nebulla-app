import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, SidebarFilter, Folder, NoteTreeItem } from '../types';
import { SidebarItem } from './SidebarItem';
import { RootDropZone } from './RootDropZone';
import {
    DndContext,
    DragEndEvent,
    MouseSensor,
    TouchSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    rectIntersection
} from '@dnd-kit/core';

interface SidebarProps {
    activeFilter: SidebarFilter;
    onSetFilter: (filter: SidebarFilter) => void;
    notes: Note[];
    folders: Folder[];
    noteTree?: NoteTreeItem[]; // New prop for recursive tree
    activeNoteId: string | null;
    onSelectNote: (id: string) => void;
    onDeleteNote: (id: string) => void;
    onDeleteFolder?: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onCreateFolder: () => void;
    onImportNote?: (file: File) => void;
    onOpenTemplateGallery?: () => void;
    onEmptyTrash?: () => void;
    moveNoteToParent?: (noteId: string, newParentId: string | null) => Promise<void>; // For drag and drop
}

interface NavItemProps {
    icon: string;
    label: string;
    isActive: boolean;
    isFilled?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, isFilled, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left group
              ${isActive
                    ? 'bg-primary/10 dark:bg-neon-pink/10 text-primary dark:text-neon-pink font-medium dark:border-r-2 dark:border-neon-pink'
                    : 'hover:bg-gray-100 dark:hover:bg-white/5 text-text-main dark:text-gray-400'}`}
        >
            <span className={`material-symbols-outlined text-[20px] ${isFilled ? 'filled' : ''} ${isActive ? 'text-primary dark:text-neon-pink' : 'text-text-secondary dark:text-gray-500 group-hover:text-primary dark:group-hover:text-neon-pink'}`}>{icon}</span>
            <span className="text-sm">{label}</span>
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({
    activeFilter,
    onSetFilter,
    folders,
    notes,
    noteTree, // Use this
    activeNoteId,
    onSelectNote,
    isOpen,
    onClose,
    onCreateFolder,
    onImportNote,
    onOpenTemplateGallery,
    onEmptyTrash,
    onDeleteFolder,
    onDeleteNote,
    moveNoteToParent
}) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isShowEmptyTrashConfirm, setIsShowEmptyTrashConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8, // 8px movement to start drag
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200, // 200ms hold to start drag on mobile
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Handle Drag End
    const handleDragEnd = (event: DragEndEvent) => {
        if (!moveNoteToParent) return;

        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const sourceNoteId = active.id as string;

        // Check if dropped on root zone
        if (over.id === 'ROOT_DROP_ZONE') {
            moveNoteToParent(sourceNoteId, null); // Move to root
            return;
        }

        const targetNoteId = over.id as string;
        moveNoteToParent(sourceNoteId, targetNoteId); // Move into target
    };

    // Filter tree logic?
    // If we have a filter (like "Search" or "Recent"), we might want to show a flat list instead of tree.
    // For now, let's assume `noteTree` passed from parent is already filtered OR we render `notes` for special filters.

    const shouldShowTree = !['recent', 'trash', 'favorites'].includes(activeFilter) && activeFilter !== 'all' && !activeFilter.startsWith('folder:'); // Simplify logic

    const toggleFolder = (folderId: string, folderName: string) => {
        const newSet = new Set(expandedFolders);
        if (newSet.has(folderId)) {
            newSet.delete(folderId);
        } else {
            newSet.add(folderId);
        }
        setExpandedFolders(newSet);
        onSetFilter(folderName); // This sets activeFilter
        if (window.innerWidth < 1024) onClose();
    };

    const handleFilterClick = (filter: SidebarFilter) => {
        onSetFilter(filter);
        if (window.innerWidth < 1024) onClose();
    };

    const handleSelectNote = (id: string) => {
        onSelectNote(id);
        if (window.innerWidth < 1024) onClose();
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && onImportNote) {
            onImportNote(e.target.files[0]);
            e.target.value = ''; // Reset
        }
    };

    const containerClasses = isOpen
        ? "fixed inset-y-0 left-0 w-64 bg-surface-light dark:bg-void/90 dark:backdrop-blur-xl z-50 shadow-2xl transition-transform duration-300 transform translate-x-0 dark:border-r dark:border-white/20 dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
        : "hidden lg:flex w-64 bg-surface-light dark:bg-void/90 dark:backdrop-blur-xl border-r border-border-color dark:border-white/20 flex-shrink-0 transition-all duration-300 dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)]";

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            <aside className={`${containerClasses} flex-col justify-between overflow-y-auto h-full`}>
                <div className="flex flex-col p-4 gap-6">

                    {/* Mobile Header with Close Button */}
                    <div className="flex items-center justify-between lg:hidden px-2 mb-2">
                        <span className="font-bold text-lg text-text-main dark:text-white">Menu</span>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close menu">
                            <span className="material-symbols-outlined" aria-hidden="true">close</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 px-2">
                        <p className="text-text-secondary dark:text-gray-500 text-xs font-bold uppercase tracking-wider">Workspace</p>
                        <div className="flex items-center justify-between cursor-pointer group mt-1">
                            <h1 className="text-text-main dark:text-white text-base font-semibold leading-normal group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">Personal Notes</h1>
                            <span className="material-symbols-outlined text-text-secondary dark:text-gray-500 text-sm">unfold_more</span>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-0.5">
                        <NavItem
                            icon="home"
                            label="Home"
                            isActive={activeFilter === 'home'}
                            onClick={() => handleFilterClick('home')}
                        />

                        <div className="h-px bg-border-color w-full my-2 opacity-50"></div>

                        <NavItem
                            icon="description"
                            label="All Notes"
                            isActive={activeFilter === 'all'}
                            onClick={() => handleFilterClick('all')}
                        />
                        <NavItem
                            icon="star"
                            label="Favorites"
                            isActive={activeFilter === 'favorites'}
                            isFilled={activeFilter === 'favorites'}
                            onClick={() => handleFilterClick('favorites')}
                        />
                        <NavItem
                            icon="schedule"
                            label="Recent"
                            isActive={activeFilter === 'recent'}
                            onClick={() => handleFilterClick('recent')}
                        />

                        <NavItem
                            icon="dashboard"
                            label="Templates"
                            isActive={false}
                            onClick={() => {
                                if (onOpenTemplateGallery) onOpenTemplateGallery();
                                if (window.innerWidth < 1024) onClose();
                            }}
                        />

                        <NavItem
                            icon="delete"
                            label="Trash"
                            isActive={activeFilter === 'trash'}
                            onClick={() => handleFilterClick('trash')}
                        />

                        {/* Empty Trash Action - Only visible in Trash */}
                        {activeFilter === 'trash' && onEmptyTrash && (
                            <motion.button
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onClick={() => setIsShowEmptyTrashConfirm(true)}
                                className="mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors w-full group"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                <span className="text-sm font-medium">Empty Trash</span>
                            </motion.button>
                        )}
                    </nav>

                    <div className="h-px bg-border-color dark:bg-gray-800 w-full my-1"></div>

                    {/* DndContext wraps both Root Drop Zone and note list */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={rectIntersection}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-text-secondary dark:text-gray-500 text-xs font-bold uppercase tracking-wider">Folders</p>
                                <button
                                    onClick={onCreateFolder}
                                    className="text-text-secondary hover:text-primary dark:hover:text-primary-dark transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Create New Folder"
                                    aria-label="Create New Folder"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                            <nav className="flex flex-col gap-0.5">
                                {folders.map(folder => {
                                    const isExpanded = expandedFolders.has(folder.id);
                                    // If Tree Mode: Filter roots in this folder
                                    // If Flat Mode: Filter notes in this folder
                                    const folderItems = shouldShowTree && noteTree
                                        ? noteTree.filter(n => n.folder === folder.id)
                                        : notes.filter(n => n.folder === folder.id);

                                    return (
                                        <div key={folder.id} className="flex flex-col">
                                            <div className="group relative">
                                                <div
                                                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeFilter === folder.name ? 'bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-gray-300'}`}
                                                    onClick={() => toggleFolder(folder.id, folder.name)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            toggleFolder(folder.id, folder.name);
                                                        }
                                                    }}
                                                    aria-expanded={expandedFolders.has(folder.id)}
                                                >
                                                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                                        <span className={`material-symbols-outlined text-[18px] transition-transform ${expandedFolders.has(folder.id) ? 'rotate-90' : ''}`} aria-hidden="true">chevron_right</span>
                                                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">folder</span>
                                                        <span className="text-sm truncate">{folder.name}</span>
                                                    </div>

                                                    {onDeleteFolder && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm(`Delete folder "${folder.name}"? Notes inside will be moved to Uncategorized.`)) {
                                                                    onDeleteFolder(folder.id);
                                                                }
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                                            title="Delete Folder"
                                                            aria-label={`Delete folder ${folder.name}`}
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                                        </button>
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="flex flex-col mt-0.5 ml-2 pl-2 border-l border-border-color"
                                                        >
                                                            {folderItems.length > 0 ? (
                                                                folderItems.map(item => (
                                                                    <SidebarItem
                                                                        key={item.id}
                                                                        item={shouldShowTree ? (item as NoteTreeItem) : { ...item, children: [] } as NoteTreeItem}
                                                                        activeNoteId={activeNoteId || ''}
                                                                        onSelectNote={handleSelectNote}
                                                                        onDeleteNote={onDeleteNote}
                                                                        depth={0}
                                                                    />
                                                                ))
                                                            ) : (
                                                                <span className="px-2 py-1.5 text-xs text-text-secondary/50 dark:text-gray-600 italic">Empty folder</span>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Uncategorized / Root Pages */}
                        <div className="flex flex-col gap-0.5 mt-2 px-2">
                            <div className="mb-1 px-2">
                                <p className="text-text-secondary dark:text-gray-500 text-xs font-bold uppercase tracking-wider">Pages</p>
                            </div>
                            <nav className="flex flex-col gap-0.5">
                                {(shouldShowTree && noteTree
                                    ? noteTree.filter(n => !n.folder)
                                    : notes.filter(n => !n.folder)
                                ).map(item => (
                                    <SidebarItem
                                        key={item.id}
                                        item={shouldShowTree ? (item as NoteTreeItem) : { ...item, children: [] } as NoteTreeItem}
                                        activeNoteId={activeNoteId || ''}
                                        onSelectNote={handleSelectNote}
                                        onDeleteNote={onDeleteNote}
                                    />
                                ))}
                            </nav>
                        </div>

                        {/* Root Drop Zone - AFTER Pages so it's accessible */}
                        {moveNoteToParent && <RootDropZone />}
                    </DndContext>

                </div>

                {/* Upgrade Banner & Import */}
                <div className="p-4 border-t border-border-color space-y-2">
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json,.md,.txt,.pdf,.docx"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={triggerImport}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-white border border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                        Import Note (JSON/MD)
                    </button>


                </div>

            </aside >

            {/* Confirmation Modal Portal */}
            {
                typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {isShowEmptyTrashConfirm && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                    onClick={() => setIsShowEmptyTrashConfirm(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 border border-border-color dark:border-gray-700"
                                >
                                    <div className="p-6 flex flex-col items-center text-center gap-4">
                                        <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[24px]">delete_forever</span>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-text-main dark:text-white">Empty Trash?</h3>
                                            <p className="text-text-secondary dark:text-gray-400 text-sm">
                                                Are you sure you want to permanently delete all notes in the trash? This action cannot be undone.
                                            </p>
                                        </div>
                                        <div className="flex gap-3 w-full mt-2">
                                            <button
                                                onClick={() => setIsShowEmptyTrashConfirm(false)}
                                                className="flex-1 px-4 py-2.5 rounded-xl border border-border-color dark:border-gray-700 font-medium text-text-main dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (onEmptyTrash) onEmptyTrash();
                                                    setIsShowEmptyTrashConfirm(false);
                                                }}
                                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
                                            >
                                                Yes, Delete All
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }
        </>
    );
};

export default Sidebar;