
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus } from 'lucide-react';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (folderName: string) => void;
    initialValue?: string;
    title?: string;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialValue = '',
    title = 'Create New Folder'
}) => {
    const [folderName, setFolderName] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFolderName(initialValue);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (folderName.trim()) {
            onSave(folderName.trim());
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-border-color dark:border-gray-700 overflow-hidden font-display"
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <FolderPlus size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-text-main dark:text-white tracking-tight">{title}</h2>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label className="block text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                        Folder Name
                                    </label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                        className="w-full px-4 py-3 bg-background-light dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-text-main dark:text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-base"
                                        placeholder="e.g. University Projects"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95"
                                    >
                                        Create Folder
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateFolderModal;
