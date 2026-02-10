import { useDroppable } from '@dnd-kit/core';

export function RootDropZone() {
    const { setNodeRef, isOver } = useDroppable({
        id: 'ROOT_DROP_ZONE',
        data: { isRoot: true }
    });

    return (
        <div
            ref={setNodeRef}
            className={`mx-2 px-4 py-4 mt-3 mb-2 rounded-lg transition-all duration-200 min-h-[60px] flex items-center relative z-20 ${isOver
                ? 'bg-primary/15 dark:bg-primary-dark/15 border-2 border-primary dark:border-primary-dark border-dashed'
                : 'bg-gray-50/50 dark:bg-gray-800/30 border-2 border-dashed border-gray-300 dark:border-gray-700'
                }`}
            style={{ pointerEvents: 'auto' }}
        >
            <div className="flex items-center gap-2 text-sm font-medium text-text-main dark:text-gray-300 w-full">
                <span className="material-symbols-outlined text-lg">folder_open</span>
                <span>All Notes (Root)</span>
                {isOver && (
                    <span className="text-xs text-primary dark:text-primary-dark ml-auto animate-pulse font-bold">
                        Drop here to move to root
                    </span>
                )}
            </div>
        </div>
    );
}
