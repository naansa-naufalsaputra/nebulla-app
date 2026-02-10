import React from 'react';
import { BubbleMenu as BubbleMenuComponent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';


interface EditorBubbleMenuProps {
    editor: Editor;
}

export const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({ editor }) => {
    const fontFamilies = [
        { label: 'Sans', value: 'Inter, sans-serif' },
        { label: 'Serif', value: 'Georgia, serif' },
        { label: 'Mono', value: 'Courier New, monospace' },
        { label: 'Times', value: 'Times New Roman, serif' },
        { label: 'Arial', value: 'Arial, sans-serif' },
        { label: 'Comic Sans', value: 'Comic Sans MS, cursive' },
    ];

    const fontSizes = ['12', '14', '16', '18', '20', '24', '30', '36'];

    const currentFontFamily = editor.getAttributes('textStyle').fontFamily || 'Inter, sans-serif';
    const currentFontSize = editor.getAttributes('textStyle').fontSize || '16';

    return (
        <BubbleMenuComponent
            editor={editor}
            tippyOptions={{
                placement: 'top',
                duration: 100,
            }}
            shouldShow={({ from, to }: { from: number; to: number }) => {
                // Only show when there's a text selection
                return from !== to;
            }}
            className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg flex items-center p-1 gap-1"
        >
            {/* Font Family Dropdown */}
            <select
                value={currentFontFamily}
                onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                className="text-xs px-2 py-1 rounded bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 border-none outline-none cursor-pointer"
            >
                {fontFamilies.map((font) => (
                    <option key={font.value} value={font.value}>
                        {font.label}
                    </option>
                ))}
            </select>

            {/* Font Size Dropdown */}
            <select
                value={currentFontSize}
                onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
                className="text-xs px-2 py-1 rounded bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 border-none outline-none cursor-pointer w-16"
            >
                {fontSizes.map((size) => (
                    <option key={size} value={size}>
                        {size}px
                    </option>
                ))}
            </select>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Bold */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''
                    }`}
                title="Bold (Ctrl+B)"
            >
                <span className="material-symbols-outlined text-[18px]">format_bold</span>
            </button>

            {/* Italic */}
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''
                    }`}
                title="Italic (Ctrl+I)"
            >
                <span className="material-symbols-outlined text-[18px]">format_italic</span>
            </button>

            {/* Strike */}
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-600' : ''
                    }`}
                title="Strikethrough"
            >
                <span className="material-symbols-outlined text-[18px]">strikethrough_s</span>
            </button>

            {/* Code */}
            <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-600' : ''
                    }`}
                title="Code"
            >
                <span className="material-symbols-outlined text-[18px]">code</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Link */}
            <button
                onClick={() => {
                    const url = window.prompt('Enter URL:');
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                    }
                }}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-600' : ''
                    }`}
                title="Add Link"
            >
                <span className="material-symbols-outlined text-[18px]">link</span>
            </button>

            {/* Color Picker */}
            <input
                type="color"
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                className="w-6 h-6 rounded cursor-pointer border-none"
                title="Text Color"
            />
        </BubbleMenuComponent>
    );
};
