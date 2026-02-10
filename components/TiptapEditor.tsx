import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { FontSize } from '../extensions/FontSize'
import { ResizableImage } from '../extensions/ResizableImage'
import { DragAndDropImage } from '../extensions/DragAndDropImage'
import { DrawingBlock } from '../extensions/DrawingBlock'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import { SlashCommand, getSuggestionItems, renderItems } from '../extensions/SlashCommand'
import 'tippy.js/dist/tippy.css'
import { useState, useEffect } from 'react'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { Markdown } from 'tiptap-markdown'
import { EditorModals } from './EditorModals'
import { IconPicker } from './editor/IconPicker'
import { CoverImage } from './editor/CoverImage'
import { SimpleBubbleMenu } from './editor/SimpleBubbleMenu'
import { Note } from '../types'

interface TiptapEditorProps {
    note: Note;
    content: string | any; // Accept string (HTML) or JSON
    onChange: (content: string) => void;
    onNoteUpdate?: (note: Note) => void;
    // Page style props (lifted from parent)
    fontStyle: 'sans' | 'serif' | 'mono';
    isFullWidth: boolean;
    isSmallText: boolean;
}

// Helper function to convert legacy blocks to HTML
const convertLegacyBlocksToHTML = (content: any): string => {
    if (typeof content === 'string') {
        return content;
    }

    if (Array.isArray(content)) {
        // Legacy block format
        return content.map((block: any) => {
            if (block.type === 'text') return `<p>${block.content || ''}</p>`;
            if (block.type === 'heading1') return `<h1>${block.content || ''}</h1>`;
            if (block.type === 'heading2') return `<h2>${block.content || ''}</h2>`;
            if (block.type === 'heading3') return `<h3>${block.content || ''}</h3>`;
            return `<p>${block.content || ''}</p>`;
        }).join('');
    }

    // Unknown format - return empty
    return '';
};

const TiptapEditor = ({ note, content, onChange, onNoteUpdate, fontStyle, isFullWidth, isSmallText }: TiptapEditorProps) => {
    // CRITICAL: Convert legacy blocks BEFORE passing to useEditor
    const initialContent = convertLegacyBlocksToHTML(content);

    // Title state
    const [title, setTitle] = useState(note.title);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: "Press '/' for commands, or start writing...",
            }),
            ResizableImage,
            DragAndDropImage,
            GlobalDragHandle,
            SlashCommand.configure({
                suggestion: {
                    items: getSuggestionItems,
                    render: renderItems,
                },
            }),
            Markdown,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TextStyle,
            Color,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            FontSize,
            DrawingBlock,
        ],
        content: initialContent, // Use converted content
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] px-8 py-4 text-text-main dark:text-gray-100 placeholder:text-gray-400 dark:prose-invert max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    })

    const [modalState, setModalState] = useState<{
        isImageOpen: boolean;
        isTableOpen: boolean;
    }>({
        isImageOpen: false,
        isTableOpen: false,
    });

    // CRITICAL FIX: Force content update when note changes to prevent ghost content
    // Also handle data type consistency (string vs object)
    useEffect(() => {
        if (editor && content !== undefined) {
            // Ensure content is a string (HTML)
            let contentToLoad = '';

            if (typeof content === 'string') {
                contentToLoad = content;
            } else if (Array.isArray(content)) {
                // LEGACY FORMAT: Convert old blocks array to HTML
                // Silent conversion: no console logs in production
                contentToLoad = content.map((block: any) => {
                    if (block.type === 'text') return `<p>${block.content || ''}</p>`;
                    if (block.type === 'heading1') return `<h1>${block.content || ''}</h1>`;
                    if (block.type === 'heading2') return `<h2>${block.content || ''}</h2>`;
                    return `<p>${block.content || ''}</p>`;
                }).join('');
            } else if (content && typeof content === 'object') {
                // Unknown object format - skip silently
                contentToLoad = '';
            }

            const currentContent = editor.getHTML();
            // Only update if content actually changed to avoid unnecessary re-renders
            if (currentContent !== contentToLoad) {
                // emitUpdate: false prevents triggering onChange and auto-save loop
                editor.commands.setContent(contentToLoad, { emitUpdate: false });
            }
        }
    }, [content, editor]);

    useEffect(() => {
        const handleModalEvent = (event: CustomEvent) => {
            const { type } = event.detail;
            if (type === 'image') {
                setModalState(prev => ({ ...prev, isImageOpen: true }));
            } else if (type === 'table') {
                setModalState(prev => ({ ...prev, isTableOpen: true }));
            }
        };

        const handleInsertAIContent = (event: CustomEvent) => {
            const { text } = event.detail;
            if (editor && text) {
                // Insert AI-generated content at cursor position
                editor.chain().focus().insertContent(text).run();
            }
        };

        window.addEventListener('editor-modal', handleModalEvent as EventListener);
        window.addEventListener('nebulla:insert-ai-content', handleInsertAIContent as EventListener);

        return () => {
            window.removeEventListener('editor-modal', handleModalEvent as EventListener);
            window.removeEventListener('nebulla:insert-ai-content', handleInsertAIContent as EventListener);
        };
    }, [editor]);

    const closeModals = () => {
        setModalState({ isImageOpen: false, isTableOpen: false });
    };

    const insertImage = (url: string) => {
        if (editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
        closeModals();
    };

    const insertTable = (rows: number, cols: number) => {
        if (editor) {
            editor
                .chain()
                .focus()
                .insertTable({ rows: rows, cols: cols, withHeaderRow: true })
                .run();
        }
        closeModals();
    };

    // Handle title changes with debounced save
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);

        // Debounce save
        const updatedNote = { ...note, title: newTitle };
        onNoteUpdate?.(updatedNote);
    };

    if (!editor) {
        return null;
    }

    return (
        <div
            className="w-full h-full overflow-y-auto custom-scrollbar relative bg-white dark:bg-[#191919]"
            onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.getAttribute('data-type') === 'mention') {
                    e.preventDefault();
                    const noteId = target.getAttribute('data-id');
                    if (noteId) {
                        window.dispatchEvent(new CustomEvent('navigate-note', { detail: { noteId } }));
                    }
                }
            }}
        >
            <EditorModals
                isImageOpen={modalState.isImageOpen}
                onImageClose={closeModals}
                onImageConfirm={insertImage}
                isTableOpen={modalState.isTableOpen}
                onTableClose={closeModals}
                onTableConfirm={insertTable}
            />

            {/* 1. Cover Image: FULL WIDTH (No padding/max-width) */}
            <CoverImage note={note} onUpdate={onNoteUpdate} />

            {/* 2. Main Editor Container (With padding & max-width) */}
            <div className={`
                mx-auto transition-all duration-300
                ${isFullWidth ? 'max-w-full px-24' : 'max-w-3xl px-12'}
                ${fontStyle === 'mono' ? 'font-mono' : fontStyle === 'serif' ? 'font-serif' : 'font-sans'}
                ${isSmallText ? 'text-sm' : 'text-base'}
            `}>
                {/* Icon + Title Section */}
                <div className={`group relative z-10 mb-8 transition-all ${note.cover_url ? '-mt-10' : 'mt-12'}`}>
                    {/* Icon Picker */}
                    <IconPicker note={note} onUpdate={onNoteUpdate} />

                    {/* Title Input */}
                    <input
                        className="w-full bg-transparent border-none text-4xl font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none resize-none overflow-hidden mt-4"
                        placeholder="Untitled"
                        value={title}
                        onChange={handleTitleChange}
                    />
                </div>

                {/* 3. Editor Content */}
                <div className="pb-20">
                    {editor && <SimpleBubbleMenu editor={editor} />}
                    <EditorContent editor={editor} />
                </div>
            </div>

            <style>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.5);
                    border-radius: 20px;
                    border: 3px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(107, 114, 128, 0.8);
                }
                /* Override default Tiptap selection for images */
                .ProseMirror-selectednode {
                    outline: none !important;
                    background-color: transparent !important;
                }
                /* Ensure our custom selection ring is visible */
                .ProseMirror-selectednode .image-resizer {
                    outline: none !important;
                }
                
                /* Global Drag Handle Styles */
                .drag-handle {
                    width: 24px;
                    height: 24px;
                    cursor: grab;
                    background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>');
                    background-repeat: no-repeat;
                    background-position: center;
                    border-radius: 4px;
                    z-index: 50;
                }
                .drag-handle:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                }
                .dark .drag-handle:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    )
}

export default TiptapEditor
