import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';

interface CommandListProps {
    items: any[];
    command: (item: any) => void;
    editor: any;
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isNearBottom, setIsNearBottom] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const menuContainerRef = useRef<HTMLDivElement>(null);

    // Group items by category FIRST to create the correct visual order
    const groupedItems = props.items.reduce((acc: any, item: any) => {
        const category = item.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    const groups = ['AI', 'Basic blocks', 'Media', 'Other'].filter(group => groupedItems[group] && groupedItems[group].length > 0);

    // Create a FLAT array that matches the visual rendering order
    const flatItems = groups.flatMap(category => groupedItems[category]);

    // Detect bottom edge proximity (TUGAS 3)
    useEffect(() => {
        if (menuContainerRef.current) {
            const rect = menuContainerRef.current.getBoundingClientRect();
            const nearBottom = rect.bottom > window.innerHeight - 50;
            setIsNearBottom(nearBottom);
        }
    }, [props.items]);

    const selectItem = (index: number) => {
        const item = flatItems[index];
        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + flatItems.length - 1) % flatItems.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % flatItems.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    // Auto-scroll logic (Notion style)
    useEffect(() => {
        const commandItem = document.getElementById(`command-item-${selectedIndex}`);
        if (commandItem) {
            commandItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedIndex]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                event.preventDefault(); // Prevent cursor movement
                upHandler();
                return true;
            }
            if (event.key === 'ArrowDown') {
                event.preventDefault(); // Prevent cursor movement
                downHandler();
                return true;
            }
            if (event.key === 'Enter') {
                event.preventDefault(); // Strongly prevent editor from receiving Enter
                event.stopPropagation();
                enterHandler();
                return true;
            }
            return false;
        },
    }));

    // If no items match
    if (props.items.length === 0) {
        return null;
    }

    return (
        <div
            ref={menuContainerRef}
            className={`flex flex-col w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden py-2 ring-1 ring-black/5 ${isNearBottom ? 'absolute bottom-full mb-2' : ''
                }`}
        >
            <div
                ref={scrollContainerRef}
                className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-hide"
            >
                {groups.map((category) => (
                    <div key={category} className="mb-2">
                        <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 px-3 py-1.5 uppercase tracking-wider select-none">
                            {category}
                        </div>
                        <div className="flex flex-col gap-0.5 px-2">
                            {groupedItems[category].map((item: any) => {
                                // Find the index in flatItems (visual order) for correct navigation
                                const index = flatItems.indexOf(item);
                                const Icon = item.icon;
                                const isSelected = index === selectedIndex;

                                return (
                                    <button
                                        key={index}
                                        id={`command-item-${index}`}
                                        data-index={index}
                                        className={`flex items-center gap-3 px-2 py-1.5 rounded-[4px] text-sm text-left transition-colors duration-75 w-full cursor-pointer
                                            ${isSelected
                                                ? 'bg-gray-100 dark:bg-gray-700'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                        onClick={() => selectItem(index)}
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-sm shrink-0">
                                            <Icon size={20} strokeWidth={1.5} className="text-gray-600 dark:text-gray-300" />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm text-gray-700 dark:text-gray-200 truncate">
                                                    {item.title}
                                                </span>
                                            </div>
                                            {item.description && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

CommandList.displayName = 'CommandList';
