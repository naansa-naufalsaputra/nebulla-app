import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { CommandList } from '../components/CommandList';
import {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Text,
    Quote,
    Code,
    Sparkles,
    Image as ImageIcon,
    CheckSquare,
    Table as TableIcon,
    FileText,
    Pencil
} from 'lucide-react';

export const SlashCommand = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

export const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: 'Page',
            description: 'Embed a sub-page.',
            searchTerms: ['page', 'nested', 'child'],
            icon: FileText,
            category: 'Basic blocks',
            command: ({ editor, range }: any) => {
                const title = 'Untitled Page';
                const id = crypto.randomUUID(); // Client-side ID generation

                // Clear the slash command text
                editor.chain().focus().deleteRange(range).run();

                editor.chain().focus().insertContent([
                    {
                        type: 'text',
                        text: `📄 ${title}`,
                        marks: [
                            {
                                type: 'textStyle',
                                attrs: { color: '#3b82f6' } // Blue color if textStyle is supported, else just text
                            },
                            {
                                type: 'bold'
                            }
                        ]
                    }
                ]).run();

                // Dispatch event to create the note
                window.dispatchEvent(new CustomEvent('create-nested-page', {
                    detail: { id, title }
                }));
            },
        },
        {
            title: 'Ask AI',
            description: 'Generate content with AI',
            searchTerms: ['ai', 'generate', 'ask', 'gemini'],
            icon: Sparkles,
            category: 'AI',
            command: ({ editor, range }: any) => {
                // Clear the slash command text
                editor.chain().focus().deleteRange(range).run();

                // Dispatch event to open AI modal
                window.dispatchEvent(new Event('nebulla:open-ai-modal'));
            },
        },
        {
            title: 'Text',
            description: 'Just start writing with plain text.',
            searchTerms: ['p', 'paragraph'],
            icon: Text,
            category: 'Basic blocks',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                editor.chain().focus().toggleNode('paragraph', 'paragraph').run();
            },
        },
        {
            title: 'Heading 1',
            description: 'Big section heading.',
            searchTerms: ['h1', 'header'],
            icon: Heading1,
            category: 'Basic blocks',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                editor.chain().focus().toggleHeading({ level: 1 }).run();
            },
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading.',
            searchTerms: ['h2', 'subheader'],
            icon: Heading2,
            category: 'Basic blocks',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                editor.chain().focus().toggleHeading({ level: 2 }).run();
            },
        },
        {
            title: 'Heading 3',
            description: 'Small section heading.',
            searchTerms: ['h3', 'subsubheader'],
            icon: Heading3,
            category: 'Basic blocks',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                editor.chain().focus().toggleHeading({ level: 3 }).run();
            },
        },
        {
            title: 'Bullet List',
            description: 'Create a simple bulleted list.',
            searchTerms: ['unordered', 'point'],
            icon: List,
            category: 'Basic blocks',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                editor.chain().focus().toggleBulletList().run();
            },
        },
        {
            title: 'Numbered List',
            description: 'Create a list with numbering.',
            searchTerms: ['ordered'],
            icon: ListOrdered,
            category: 'Basic blocks',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                editor.chain().focus().toggleOrderedList().run();
            },
        },
        {
            title: 'To-do List',
            description: 'Track tasks with a to-do list.',
            searchTerms: ['todo', 'task', 'checkbox'],
            icon: CheckSquare,
            category: 'Basic blocks',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                editor.chain().focus().toggleTaskList().run();
            },
        },
        {
            title: 'Quote',
            description: 'Capture a quote.',
            searchTerms: ['blockquote'],
            icon: Quote,
            category: 'Basic blocks',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                editor.chain().focus().toggleBlockquote().run();
            },
        },
        {
            title: 'Code Block',
            description: 'Capture a code snippet.',
            searchTerms: ['codeblock'],
            icon: Code,
            category: 'Media',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                editor.chain().focus().toggleCodeBlock().run();
            },
        },
        {
            title: 'Image',
            description: 'Insert an image from URL.',
            searchTerms: ['photo', 'picture', 'media'],
            icon: ImageIcon,
            category: 'Media',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                window.dispatchEvent(new CustomEvent('editor-modal', {
                    detail: { type: 'image' }
                }));
            },
        },
        {
            title: 'Table',
            description: 'Insert a table.',
            searchTerms: ['table', 'grid', 'spreadsheet'],
            icon: TableIcon, // We need to import Table as TableIcon or just Table
            category: 'Basic blocks',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                window.dispatchEvent(new CustomEvent('editor-modal', {
                    detail: { type: 'table' }
                }));
            },
        },
        {
            title: 'Drawing',
            description: 'Insert a drawing canvas.',
            searchTerms: ['sketch', 'draw', 'pencil'],
            icon: Pencil,
            category: 'Media',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertContent({ type: 'drawingBlock' }).run();
            },
        },
    ].filter((item) => {
        if (typeof query === 'string' && query.length > 0) {
            const search = query.toLowerCase();
            return (
                item.title.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search) ||
                (item.searchTerms && item.searchTerms.some((term: string) => term.includes(search)))
            );
        }
        return true;
    });
};

export const renderItems = () => {
    let component: ReactRenderer | null = null;
    let popup: any | null = null;

    return {
        onStart: (props: any) => {
            component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
            });

            if (!props.clientRect) {
                return;
            }

            popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                theme: 'light', // or implement custom theme
                maxWidth: 'none',
                zIndex: 9999,
            });
        },

        onUpdate: (props: any) => {
            component?.updateProps(props);

            if (!props.clientRect) {
                return;
            }

            popup[0].setProps({
                getReferenceClientRect: props.clientRect,
            });
        },

        onKeyDown: (props: any) => {
            if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
            }

            return (component?.ref as any)?.onKeyDown(props);
        },

        onExit: () => {
            popup[0].destroy();
            component?.destroy();
        },
    };
};
