import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'neutral';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'neutral'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-sm pointer-events-auto border border-border-color dark:border-gray-700 overflow-hidden"
                        >
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        {variant === 'danger' && (
                                            <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
                                            </div>
                                        )}
                                        <h3 className="text-lg font-bold text-text-main dark:text-white">{title}</h3>
                                    </div>
                                    <p className="text-sm text-text-secondary dark:text-gray-400 pl-1">{message}</p>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        onClick={() => {
                                            onConfirm();
                                            onClose();
                                        }}
                                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${variant === 'danger'
                                                ? 'bg-red-500 hover:bg-red-600'
                                                : 'bg-primary hover:bg-primary-dark'
                                            }`}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
