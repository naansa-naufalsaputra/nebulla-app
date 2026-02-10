import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoteTreeItem } from '../types';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface SidebarItemProps {
    item: NoteTreeItem;
    depth?: number;
    activeNoteId: string | null;
    onSelectNote: (id: string) => void;
    onDeleteNote?: (id: string) => void;
    onToggleExpand?: (id: string) => void; // Optional if we handle state locally
    expandedNodes?: Set<string>; // Optional global state
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
    item,
    depth = 0,
    activeNoteId,
    onSelectNote,
    onDeleteNote
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    // Draggable setup
    const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
        id: item.id,
        data: { note: item }
    });

    // Droppable setup
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: item.id,
        data: { note: item }
    });

    // Combine refs
    const setRefs = (element: HTMLDivElement | null) => {
        setDragRef(element);
        setDropRef(element);
    };

    // Visual feedback styles
    const dragStyle = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab'
    };

    const dropStyle = {
        backgroundColor: isOver
            ? 'rgba(59, 130, 246, 0.15)' // More prominent background
            : 'transparent',
        borderLeft: isOver ? '4px solid rgb(59, 130, 246)' : 'none',
        borderRadius: isOver ? '8px' : '0',
        transition: 'all 0.2s ease'
    };

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDeleteNote) {
            if (window.confirm(`Delete "${item.title}"?`)) {
                onDeleteNote(item.id);
            }
        }
    };

    const handleCreateChild = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Dispatch event to create nested page
        window.dispatchEvent(new CustomEvent('create-nested-page', {
            detail: { id: crypto.randomUUID(), title: 'Untitled Page', parentId: item.id }
        }));
        setIsExpanded(true); // Auto expand to show new child
    };

    return (
        <div className="flex flex-col select-none">
            <div
                ref={setRefs}
                {...attributes}
                {...listeners}
                style={{ ...dragStyle, ...dropStyle, paddingLeft: `${depth * 12 + 12}px` }}
                className={`group flex items-center gap-2 pr-3 py-1.5 rounded-lg cursor-pointer transition-colors relative
                    ${activeNoteId === item.id
                        ? 'bg-primary/10 text-primary dark:text-primary-dark font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-gray-300'}
                `}
                onClick={() => onSelectNote(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onSelectNote(item.id);
                    }
                }}
                aria-label={`Select ${item.title || 'Untitled note'}`}
            >
                {/* Expand Toggle */}
                <button
                    className={`material-symbols-outlined text-[16px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-transform p-0.5 rounded flex items-center justify-center
                        ${hasChildren ? 'opacity-100' : 'opacity-0'}
                        ${isExpanded ? 'rotate-90' : ''}
                    `}
                    onClick={(e) => {
                        if (hasChildren) handleExpandClick(e);
                    }}
                    disabled={!hasChildren}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    aria-expanded={isExpanded}
                >
                    chevron_right
                </button>

                {/* Icon */}
                <span className="material-symbols-outlined text-[18px] flex-shrink-0" aria-hidden="true">
                    description
                </span>

                {/* Title - Truncates if too long */}
                <span className="text-sm flex-1 truncate mr-2">
                    {item.title || 'Untitled'}
                </span>

                {/* Quick Actions (Hover) - Notion-style */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                    <button
                        onClick={handleCreateChild}
                        className="p-1 text-gray-400 hover:text-primary dark:hover:text-primary-dark rounded transition-colors"
                        title="Add child page"
                        aria-label="Add child page"
                    >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                    {onDeleteNote && (
                        <button
                            onClick={handleDeleteClick}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                            title="Delete note"
                            aria-label={`Delete ${item.title || 'note'}`}
                        >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                    )}
                </div>

                {/* Nesting Indicator - CRITICAL for UX */}
                {isOver && (
                    <div className="absolute -bottom-1 left-0 right-0 flex items-center gap-1 text-xs text-primary dark:text-primary-dark animate-pulse px-3">
                        <span className="material-symbols-outlined text-sm">subdirectory_arrow_right</span>
                        <span className="font-medium">Will become child of this note</span>
                    </div>
                )}
            </div>

            {/* Children (Recursive) */}
            <AnimatePresence>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        {item.children.map(child => (
                            <SidebarItem
                                key={child.id}
                                item={child}
                                depth={depth + 1}
                                activeNoteId={activeNoteId}
                                onSelectNote={onSelectNote}
                                onDeleteNote={onDeleteNote}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
