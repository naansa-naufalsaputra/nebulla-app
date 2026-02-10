import React from 'react';
import { Smile, ImageIcon } from 'lucide-react';

interface HeaderActionsProps {
    hasIcon: boolean;
    hasCover: boolean;
    onAddIcon: () => void;
    onAddCover: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
    hasIcon,
    hasCover,
    onAddIcon,
    onAddCover,
}) => {
    // Don't render if both icon and cover exist
    if (hasIcon && hasCover) {
        return null;
    }

    return (
        <div className="flex items-center gap-4 text-gray-400 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
            {!hasIcon && (
                <button
                    onClick={onAddIcon}
                    className="hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
                >
                    <Smile size={16} />
                    <span>Add icon</span>
                </button>
            )}
            {!hasCover && (
                <button
                    onClick={onAddCover}
                    className="hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
                >
                    <ImageIcon size={16} />
                    <span>Add cover</span>
                </button>
            )}
        </div>
    );
};
