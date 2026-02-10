import React, { useState, useEffect } from 'react';
import { BlockStyle } from '../types';

interface FloatingToolbarProps {
    mode: 'text' | 'draw';
    onModeChange: (mode: 'text' | 'draw') => void;

    // Text Props
    activeFont: string;
    onFontChange: (font: BlockStyle['fontFamily']) => void;
    isBold: boolean;
    onToggleBold: () => void;
    isItalic: boolean;
    onToggleItalic: () => void;
    fontSize: string;
    onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;

    // Draw Props
    brushSize: number;
    onBrushSizeChange: (size: number) => void;
    brushColor: string;
    onBrushColorChange: (color: string) => void;

    // Undo/Redo
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
    mode,
    // onModeChange removed
    activeFont,
    onFontChange,
    isBold,
    onToggleBold,
    isItalic,
    onToggleItalic,
    fontSize,
    onFontSizeChange,
    brushSize,
    onBrushSizeChange,
    brushColor,
    onBrushColorChange,
    canUndo = false,
    canRedo = false,
    onUndo,
    onRedo
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Detect dark mode for dynamic palette
    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
    }, []);

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-float p-3 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
            >
                <span className="material-symbols-outlined text-primary text-[24px] filled">handyman</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-xl rounded-full px-6 py-2 flex items-center gap-4 min-w-[340px]">

                {/* Header / Toggles (Removed Text/Draw Switcher) */}
                <div className="flex items-center justify-end px-2 pt-1">
                    <button onClick={() => setIsMinimized(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                    </button>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-700 w-full"></div>

                {/* Controls Area */}
                <div className="px-2 pb-1 flex items-center gap-4 h-10">

                    {mode === 'text' ? (
                        <>
                            {/* Undo/Redo Buttons */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={onUndo}
                                    disabled={!canUndo}
                                    className="p-1.5 rounded-lg text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                                    title="Undo (Ctrl+Z)"
                                >
                                    <span className="material-symbols-outlined text-[18px]">undo</span>
                                </button>
                                <button
                                    onClick={onRedo}
                                    disabled={!canRedo}
                                    className="p-1.5 rounded-lg text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                                    title="Redo (Ctrl+Y)"
                                >
                                    <span className="material-symbols-outlined text-[18px]">redo</span>
                                </button>
                            </div>

                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

                            {/* Font Family */}
                            <select
                                value={activeFont}
                                onChange={(e) => onFontChange(e.target.value as any)}
                                className="bg-transparent border-none text-xs font-medium text-text-main dark:text-white p-0 pr-6 focus:ring-0 cursor-pointer max-w-[90px] truncate"
                            >
                                <option value="Inter">Inter</option>
                                <option value="Times New Roman">Times</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Arial">Arial</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Fira Code">Fira Code</option>
                            </select>

                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

                            {/* Styles */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={onToggleBold}
                                    className={`size-8 flex items-center justify-center rounded-lg transition-colors ${isBold ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">format_bold</span>
                                </button>
                                <button
                                    onClick={onToggleItalic}
                                    className={`size-8 flex items-center justify-center rounded-lg transition-colors ${isItalic ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">format_italic</span>
                                </button>
                            </div>

                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

                            {/* Size */}
                            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => onFontSizeChange('small')}
                                    className={`px-2 py-1 text-[10px] ${fontSize === 'small' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-500'}`}
                                >S</button>
                                <button
                                    onClick={() => onFontSizeChange('medium')}
                                    className={`px-2 py-1 text-[10px] ${fontSize === 'medium' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-500'}`}
                                >M</button>
                                <button
                                    onClick={() => onFontSizeChange('large')}
                                    className={`px-2 py-1 text-[10px] ${fontSize === 'large' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-500'}`}
                                >L</button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Brush Size */}
                            <div className="flex items-center gap-2 flex-1">
                                <span className="material-symbols-outlined text-[16px] text-gray-400">brush</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={brushSize}
                                    onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                                    className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <span className="text-[10px] font-mono text-gray-500 w-4">{brushSize}</span>
                            </div>

                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

                            {/* Color Palette */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onBrushColorChange(isDarkMode ? '#ffffff' : '#000000')}
                                    className={`size-6 rounded-full border border-gray-200 dark:border-gray-600 ${brushColor === (isDarkMode ? '#ffffff' : '#000000') ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-gray-900' : ''}`}
                                    style={{ backgroundColor: isDarkMode ? '#ffffff' : '#000000' }}
                                />
                                <button
                                    onClick={() => onBrushColorChange('#EF4444')}
                                    className={`size-6 rounded-full border border-gray-200 dark:border-gray-600 ${brushColor === '#EF4444' ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-gray-900' : ''}`}
                                    style={{ backgroundColor: '#EF4444' }}
                                />
                                <button
                                    onClick={() => onBrushColorChange('#3B82F6')}
                                    className={`size-6 rounded-full border border-gray-200 dark:border-gray-600 ${brushColor === '#3B82F6' ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-gray-900' : ''}`}
                                    style={{ backgroundColor: '#3B82F6' }}
                                />
                                {/* Custom Color Input Wrapper */}
                                <div className="relative size-6 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 bg-gradient-to-br from-yellow-400 to-purple-500">
                                    <input
                                        type="color"
                                        value={brushColor}
                                        onChange={(e) => onBrushColorChange(e.target.value)}
                                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FloatingToolbar;