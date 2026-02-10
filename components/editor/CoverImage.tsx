import React, { useState, useRef } from 'react';
import { Note } from '../../types';
import { notesService } from '../../services';
import { supabase } from '../../lib/supabaseClient';

interface CoverImageProps {
    note: Note;
    onUpdate?: (updatedNote: Note) => void;
}

export const CoverImage: React.FC<CoverImageProps> = ({ note, onUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isRepositioning, setIsRepositioning] = useState(false);
    const [positionY, setPositionY] = useState(note.cover_position ?? 50);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef(0);
    const startPositionRef = useRef(50);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            // Generate unique filename with timestamp to avoid caching
            const fileExt = file.name.split('.').pop();
            const fileName = `cover-${note.id}-${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('covers')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('covers')
                .getPublicUrl(fileName);

            // Update note with cover URL
            const updatedNote = { ...note, cover_url: publicUrl, cover_position: 50 };
            await notesService.updateNote(updatedNote);
            onUpdate?.(updatedNote);
            setPositionY(50);
        } catch (error) {
            console.error('Failed to upload cover image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveCover = async () => {
        if (!note.cover_url) return;

        setIsUploading(true);

        try {
            // Extract filename from URL
            const urlParts = note.cover_url.split('/');
            const fileName = urlParts[urlParts.length - 1];

            // Delete from storage
            const { error: deleteError } = await supabase.storage
                .from('covers')
                .remove([fileName]);

            if (deleteError) {
                console.warn('Failed to delete file from storage:', deleteError);
            }

            // Update note to remove cover URL
            const updatedNote = { ...note, cover_url: null, cover_position: 50 };
            await notesService.updateNote(updatedNote);
            onUpdate?.(updatedNote);
            setPositionY(50);
        } catch (error) {
            console.error('Failed to remove cover image:', error);
            alert('Failed to remove cover. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleChangeCover = () => {
        fileInputRef.current?.click();
    };

    // Reposition Mode Handlers
    const handleStartReposition = () => {
        setIsRepositioning(true);
        startPositionRef.current = note.cover_position ?? 50;
        setPositionY(note.cover_position ?? 50);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isRepositioning) return;
        setIsDragging(true);
        startYRef.current = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const deltaY = e.clientY - startYRef.current;
        const containerHeight = containerRef.current.offsetHeight;
        const deltaPercentage = (deltaY / containerHeight) * 100;

        // Calculate new position and clamp between 0-100
        const newPosition = Math.max(0, Math.min(100, startPositionRef.current + deltaPercentage));
        setPositionY(newPosition);
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };

    const handleSavePosition = async () => {
        try {
            const updatedNote = { ...note, cover_position: positionY };
            await notesService.updateNote(updatedNote);
            onUpdate?.(updatedNote);
            setIsRepositioning(false);
            setIsDragging(false);
        } catch (error) {
            console.error('Failed to save cover position:', error);
            alert('Failed to save position. Please try again.');
        }
    };

    const handleCancelReposition = () => {
        // Revert to original position from database
        setPositionY(note.cover_position ?? 50);
        setIsRepositioning(false);
        setIsDragging(false);
    };

    // Attach global mouse event listeners for dragging
    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    // Empty state - show "Add cover" button
    if (!note.cover_url) {
        return (
            <div className="group min-h-[40px] flex items-center mb-4">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-all border border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                >
                    <span className="material-symbols-outlined text-[18px]">image</span>
                    Add cover
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        );
    }

    // Display cover image with hover actions
    return (
        <div
            ref={containerRef}
            className={`group relative w-full h-48 overflow-hidden ${isRepositioning ? 'cursor-move' : ''}`}
        >
            {isUploading ? (
                // Loading state
                <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                    </div>
                </div>
            ) : (
                <>
                    <img
                        src={note.cover_url}
                        alt="Cover"
                        className={`w-full h-48 object-cover select-none ${isDragging ? 'cursor-grabbing' : isRepositioning ? 'cursor-grab' : ''}`}
                        style={{ objectPosition: `center ${positionY}%` }}
                        onMouseDown={handleMouseDown}
                        draggable={false}
                    />

                    {/* Reposition Mode UI */}
                    {isRepositioning && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded text-xs backdrop-blur-sm z-50">
                            Drag image to reposition
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                        {isRepositioning ? (
                            <>
                                <button
                                    onClick={handleSavePosition}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded backdrop-blur-sm transition-colors flex items-center gap-1 cursor-pointer font-medium"
                                >
                                    <span className="material-symbols-outlined text-[14px]">check</span>
                                    Save Position
                                </button>
                                <button
                                    onClick={handleCancelReposition}
                                    className="text-xs bg-black/30 hover:bg-black/60 text-white px-3 py-1.5 rounded backdrop-blur-sm transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleStartReposition}
                                    className="text-xs bg-black/30 hover:bg-black/60 text-white px-2 py-1 rounded backdrop-blur-sm transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[14px]">open_with</span>
                                    Reposition
                                </button>
                                <button
                                    onClick={handleChangeCover}
                                    className="text-xs bg-black/30 hover:bg-black/60 text-white px-2 py-1 rounded backdrop-blur-sm transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[14px]">image</span>
                                    Change
                                </button>
                                <button
                                    onClick={handleRemoveCover}
                                    className="text-xs bg-black/30 hover:bg-black/60 text-white px-2 py-1 rounded backdrop-blur-sm transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                    Remove
                                </button>
                            </>
                        )}
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </>
            )}
        </div>
    );
};
