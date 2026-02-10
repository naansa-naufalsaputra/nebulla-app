import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Link, Trash2 } from 'lucide-react';

interface PageStyleMenuProps {
    fontStyle: 'sans' | 'serif' | 'mono';
    setFontStyle: (style: 'sans' | 'serif' | 'mono') => void;
    isFullWidth: boolean;
    setIsFullWidth: (value: boolean) => void;
    isSmallText: boolean;
    setIsSmallText: (value: boolean) => void;
    onDelete?: () => void;
}

export const PageStyleMenu: React.FC<PageStyleMenuProps> = ({
    fontStyle,
    setFontStyle,
    isFullWidth,
    setIsFullWidth,
    isSmallText,
    setIsSmallText,
    onDelete,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsOpen(false);
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Page options"
            >
                <MoreHorizontal size={18} className="text-gray-600 dark:text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2">
                    {/* Typography Section */}
                    <div className="px-3 py-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                            FONT
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {/* Default */}
                            <button
                                onClick={() => setFontStyle('sans')}
                                className={`flex flex-col items-center justify-center p-3 rounded border-2 transition-all ${fontStyle === 'sans'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                            >
                                <span className="text-2xl font-sans mb-1">Ag</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Default</span>
                            </button>

                            {/* Serif */}
                            <button
                                onClick={() => setFontStyle('serif')}
                                className={`flex flex-col items-center justify-center p-3 rounded border-2 transition-all ${fontStyle === 'serif'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                            >
                                <span className="text-2xl font-serif mb-1">Ag</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Serif</span>
                            </button>

                            {/* Mono */}
                            <button
                                onClick={() => setFontStyle('mono')}
                                className={`flex flex-col items-center justify-center p-3 rounded border-2 transition-all ${fontStyle === 'mono'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                            >
                                <span className="text-2xl font-mono mb-1">Ag</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Mono</span>
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

                    {/* Toggle Section */}
                    <div className="px-3 py-1">
                        {/* Small Text Toggle */}
                        <button
                            onClick={() => setIsSmallText(!isSmallText)}
                            className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="text-sm text-gray-700 dark:text-gray-300">Small text</span>
                            <div
                                className={`w-10 h-5 rounded-full transition-colors ${isSmallText ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform transform ${isSmallText ? 'translate-x-5' : 'translate-x-0.5'
                                        } mt-0.5`}
                                />
                            </div>
                        </button>

                        {/* Full Width Toggle */}
                        <button
                            onClick={() => setIsFullWidth(!isFullWidth)}
                            className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="text-sm text-gray-700 dark:text-gray-300">Full width</span>
                            <div
                                className={`w-10 h-5 rounded-full transition-colors ${isFullWidth ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform transform ${isFullWidth ? 'translate-x-5' : 'translate-x-0.5'
                                        } mt-0.5`}
                                />
                            </div>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

                    {/* Actions Section */}
                    <div className="px-3 py-1">
                        {/* Copy Link */}
                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            <Link size={16} className="text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Copy link</span>
                        </button>

                        {/* Delete */}
                        {onDelete && (
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                            >
                                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                                <span className="text-sm text-red-600 dark:text-red-400">Delete</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
