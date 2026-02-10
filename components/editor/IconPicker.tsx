import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Note } from '../../types';
import { notesService } from '../../services';

interface IconPickerProps {
    note: Note;
    onUpdate?: (updatedNote: Note) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ note, onUpdate }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    const handleEmojiClick = async (emojiData: EmojiClickData) => {
        setIsUpdating(true);
        setShowPicker(false);

        const updatedNote = { ...note, icon: emojiData.emoji };

        try {
            await notesService.updateNote(updatedNote);
            onUpdate?.(updatedNote);
        } catch (error) {
            console.error('Failed to update icon:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveIcon = async () => {
        setIsUpdating(true);
        const updatedNote = { ...note, icon: null };

        try {
            await notesService.updateNote(updatedNote);
            onUpdate?.(updatedNote);
        } catch (error) {
            console.error('Failed to remove icon:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative group">
            {note.icon ? (
                // Display current icon
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        disabled={isUpdating}
                        className="text-6xl hover:scale-110 transition-transform cursor-pointer disabled:opacity-50"
                        title="Change icon"
                    >
                        {note.icon}
                    </button>

                    {/* Remove icon button (hover-visible) */}
                    <button
                        onClick={handleRemoveIcon}
                        disabled={isUpdating}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        title="Remove icon"
                    >
                        <span className="material-symbols-outlined text-[18px] text-gray-500">close</span>
                    </button>
                </div>
            ) : (
                // Add icon button (hover-visible)
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    disabled={isUpdating}
                    data-icon-picker-trigger
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-[18px]">add_reaction</span>
                    Add Icon
                </button>
            )}

            {/* Emoji Picker Popup */}
            {showPicker && (
                <div ref={pickerRef} className="absolute top-full left-0 mt-2 z-50 shadow-2xl">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        autoFocusSearch={false}
                        width={350}
                        height={400}
                    />
                </div>
            )}
        </div>
    );
};
