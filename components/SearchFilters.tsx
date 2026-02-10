import React from 'react';

export interface FilterState {
    tags: string[];
    folder: string;
    dateStart: string;
    dateEnd: string;
}

interface SearchFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    availableTags: string[];
    availableFolders: string[];
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
    isOpen,
    onClose,
    availableTags,
    availableFolders,
    filters,
    setFilters
}) => {
    if (!isOpen) return null;

    const toggleTag = (tag: string) => {
        setFilters(prev => {
            const newTags = prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag];
            return { ...prev, tags: newTags };
        });
    };

    const clearFilters = () => {
        setFilters({ tags: [], folder: '', dateStart: '', dateEnd: '' });
    };

    return (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-surface-dark rounded-xl shadow-menu border border-border-color dark:border-gray-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider">Filters</span>
                <div className="flex items-center gap-2">
                    <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-main">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            </div>

            {/* Folders */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Folder</label>
                <select
                    value={filters.folder}
                    onChange={(e) => setFilters(prev => ({ ...prev, folder: e.target.value }))}
                    className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-text-main dark:text-white focus:ring-primary focus:border-primary"
                >
                    <option value="">All Folders</option>
                    {availableFolders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
            </div>

            {/* Date Range */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">Date Range</label>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={filters.dateStart}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateStart: e.target.value }))}
                        className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-text-main dark:text-white"
                        placeholder="Start"
                    />
                    <input
                        type="date"
                        value={filters.dateEnd}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateEnd: e.target.value }))}
                        className="w-full text-xs rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-text-main dark:text-white"
                        placeholder="End"
                    />
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Tags</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-2 py-1 rounded-md text-xs transition-colors border ${filters.tags.includes(tag)
                                    ? 'bg-primary/10 border-primary text-primary font-medium'
                                    : 'bg-gray-100 dark:bg-gray-800 border-transparent text-text-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            #{tag}
                        </button>
                    ))}
                    {availableTags.length === 0 && <span className="text-xs text-gray-400 italic">No tags found</span>}
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;