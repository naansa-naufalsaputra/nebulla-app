import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const DragAndDropImage = Extension.create({
    name: 'dragAndDropImage',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('dragAndDropImage'),
                props: {
                    handleDrop: (view, event, _slice, moved) => {
                        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                            const file = event.dataTransfer.files[0];
                            if (file.type.startsWith('image/')) {
                                event.preventDefault();

                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const result = e.target?.result as string;
                                    if (result) {
                                        const { schema } = view.state;
                                        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                                        if (coordinates) {
                                            const node = schema.nodes.image.create({ src: result });
                                            const transaction = view.state.tr.insert(coordinates.pos, node);
                                            view.dispatch(transaction);
                                        }
                                    }
                                };
                                reader.readAsDataURL(file);
                                return true; // Handled
                            }
                        }
                        return false;
                    },
                    handlePaste: (view, event, _slice) => {
                        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
                            const file = event.clipboardData.files[0];
                            if (file.type.startsWith('image/')) {
                                event.preventDefault();

                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const result = e.target?.result as string;
                                    if (result) {
                                        const { schema } = view.state;
                                        const node = schema.nodes.image.create({ src: result });
                                        const transaction = view.state.tr.replaceSelectionWith(node);
                                        view.dispatch(transaction);
                                    }
                                };
                                reader.readAsDataURL(file);
                                return true; // Handled
                            }
                        }
                        return false;
                    }
                },
            }),
        ];
    },
});
