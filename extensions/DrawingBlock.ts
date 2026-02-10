
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { DrawingComponent } from '../components/DrawingComponent'

export const DrawingBlock = Node.create({
    name: 'drawingBlock',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            lines: {
                default: null,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'drawing-component',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['drawing-component', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return ReactNodeViewRenderer(DrawingComponent)
    },
})
