
import { NodeViewWrapper } from '@tiptap/react'
import { Tldraw, Editor, getSnapshot, loadSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { useCallback, useEffect, useState } from 'react'

export const DrawingComponent = (props: any) => {
    const [editor, setEditor] = useState<Editor | null>(null)

    const handleMount = useCallback((editor: Editor) => {
        setEditor(editor)
    }, [])

    useEffect(() => {
        if (editor && props.node.attrs.lines) {
            try {
                const snapshot = JSON.parse(props.node.attrs.lines)
                loadSnapshot(editor.store, snapshot)
            } catch (e) {
                console.error("Failed to load drawing snapshot", e)
            }
        }
    }, [editor]) // Only run once when editor is ready.

    const isReadOnly = !props.editor.isEditable

    useEffect(() => {
        if (!editor) return
        editor.updateInstanceState({ isReadonly: isReadOnly })
    }, [editor, isReadOnly])

    // Persistence listener
    useEffect(() => {
        if (!editor) return

        const handleChange = () => {
            const snapshot = getSnapshot(editor.store)
            const jsonString = JSON.stringify(snapshot)

            if (props.node.attrs.lines !== jsonString) {
                props.updateAttributes({
                    lines: jsonString,
                })
            }
        }

        const cleanup = editor.store.listen(
            handleChange,
            { scope: 'document', source: 'user' }
        )

        return () => {
            cleanup()
        }
    }, [editor, props.updateAttributes])



    return (
        <NodeViewWrapper className="drawing-component my-4">
            <div
                className="relative w-full h-[500px] border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-100"
                style={{ height: '500px' }}
            >
                <Tldraw
                    onMount={handleMount}
                    hideUi={isReadOnly}
                />
            </div>
        </NodeViewWrapper>
    )
}
