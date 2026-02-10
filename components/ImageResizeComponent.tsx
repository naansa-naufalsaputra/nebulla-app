import { NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { Resizable } from 're-resizable';

export const ImageResizeComponent = (props: any) => {
    // Tiptap passes `selected` prop to the node view component
    const { selected, node, updateAttributes } = props;
    const [width, setWidth] = React.useState(node.attrs.width || 'auto');
    const [height, setHeight] = React.useState(node.attrs.height || 'auto');

    // Sync local state if remote attributes change (e.g. undo/redo)
    React.useEffect(() => {
        setWidth(node.attrs.width || 'auto');
        setHeight(node.attrs.height || 'auto');
    }, [node.attrs.width, node.attrs.height]);

    return (
        <NodeViewWrapper
            style={{ display: 'inline-block', lineHeight: '0', float: 'none', maxWidth: '100%' }}
            className={`relative ${selected ? 'ProseMirror-selectednode-focused' : ''}`}
        >
            <Resizable
                size={{ width, height }}
                lockAspectRatio={true}
                onResize={(_e, _direction, ref, _d) => {
                    setWidth(ref.style.width);
                    setHeight(ref.style.height);
                }}
                onResizeStop={(_e, _direction, ref, _d) => {
                    updateAttributes({
                        width: ref.style.width,
                        height: ref.style.height,
                    });
                }}
                enable={selected ? {
                    top: false,
                    right: true,
                    bottom: true,
                    left: true,
                    topRight: true,
                    bottomRight: true,
                    bottomLeft: true,
                    topLeft: true,
                } : {
                    top: false, right: false, bottom: false, left: false,
                    topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
                }}
                handleComponent={{
                    bottomRight: <ResizeHandle />,
                    topRight: <ResizeHandle />,
                    bottomLeft: <ResizeHandle />,
                    topLeft: <ResizeHandle />,
                }}
                className={`transition-all duration-200 ${selected ? 'ring-2 ring-blue-500 z-10' : 'ring-0'} rounded-sm`}
                handleStyles={{
                    bottomRight: { bottom: -6, right: -6 },
                    topRight: { top: -6, right: -6 },
                    bottomLeft: { bottom: -6, left: -6 },
                    topLeft: { top: -6, left: -6 },
                }}
            >
                <img
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    className="block w-full h-full object-cover rounded-sm"
                />
            </Resizable>
        </NodeViewWrapper>
    );
};

const ResizeHandle = () => (
    <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow-sm box-border" />
);
