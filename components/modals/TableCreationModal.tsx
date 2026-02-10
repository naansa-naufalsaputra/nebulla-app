import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TableCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rows: number, cols: number) => void;
}

const TableCreationModal: React.FC<TableCreationModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(rows, cols);
        onClose();
    };

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
                            <div className="px-6 py-4 border-b border-border-color dark:border-gray-700">
                                <h3 className="text-lg font-bold text-text-main dark:text-white">Insert Table</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-secondary dark:text-gray-400">Rows</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={rows}
                                            onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-border-color dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-main dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-secondary dark:text-gray-400">Columns</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={cols}
                                            onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-border-color dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-main dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors"
                                    >
                                        Insert Table
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TableCreationModal;
