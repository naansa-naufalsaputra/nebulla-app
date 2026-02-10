import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'

interface TiptapPreviewProps {
    content: string | any;
}

const TiptapPreview = ({ content }: TiptapPreviewProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Image,
        ],
        content: content,
        editable: false, // Read-only
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none px-8 py-4 text-text-main dark:text-gray-100 dark:prose-invert max-w-none',
            },
        },
    })

    if (!editor) {
        return null;
    }

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar">
            <EditorContent editor={editor} />
        </div>
    )
}

export default TiptapPreview
