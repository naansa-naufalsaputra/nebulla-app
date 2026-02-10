import React, { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';

interface SimpleBubbleMenuProps {
    editor: Editor;
}

/**
 * Simplified BubbleMenu compatible with Tiptap v3
 * Shows when text is selected with basic formatting options
 */
export const SimpleBubbleMenu: React.FC<SimpleBubbleMenuProps> = ({ editor }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateMenu = () => {
            const { from, to } = editor.state.selection;
            const hasSelection = from !== to;

            if (!hasSelection) {
                setIsVisible(false);
                return;
            }

            // Get the DOM selection to position the menu
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                setIsVisible(false);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Position menu above the selection
            setPosition({
                top: rect.top - 48, // 48px for menu height
                left: rect.left + rect.width / 2,
            });
            setIsVisible(true);
        };

        // Update menu on selection change
        editor.on('selectionUpdate', updateMenu);
        editor.on('transaction', updateMenu);

        return () => {
            editor.off('selectionUpdate', updateMenu);
            editor.off('transaction', updateMenu);
        };
    }, [editor]);

    if (!isVisible) return null;

    return (
        <div
            ref={menuRef}
            className="fixed z-50 -translate-x-1/2"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            <div className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg flex items-center p-1 gap-1">
                {/* Bold */}
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''
                        }`}
                    title="Bold"
                >
                    <span className="material-symbols-outlined text-[18px]">format_bold</span>
                </button>

                {/* Italic */}
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''
                        }`}
                    title="Italic"
                >
                    <span className="material-symbols-outlined text-[18px]">format_italic</span>
                </button>

                {/* Strike */}
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-600' : ''
                        }`}
                    title="Strikethrough"
                >
                    <span className="material-symbols-outlined text-[18px]">strikethrough_s</span>
                </button>

                {/* Code */}
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-600' : ''
                        }`}
                    title="Code"
                >
                    <span className="material-symbols-outlined text-[18px]">code</span>
                </button>
            </div>
        </div>
    );
};
