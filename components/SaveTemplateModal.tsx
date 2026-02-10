import React, { useState } from 'react';

interface SaveTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, category: string) => void;
}

const CATEGORIES = ['Academic', 'Developer', 'Aesthetic', 'Productivity', 'Personal'];

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Personal');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim(), category);
            setName('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 w-[400px] z-10 border border-border-color dark:border-gray-700 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-text-main dark:text-white">Save as Template</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1.5">Template Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Physics Lab Report"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1.5">Category</label>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={!name.trim()}
                            className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            Save Template
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveTemplateModal;