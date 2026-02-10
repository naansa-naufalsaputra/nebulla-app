import React, { useState, useEffect } from 'react';
import { X, Check, Image as ImageIcon, Table as TableIcon } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    confirmDisable?: boolean;
    onConfirm: () => void;
}

const BaseModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    icon: Icon,
    children,
    confirmDisable = false,
    onConfirm
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 dark:border-gray-700 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5"
                onKeyDown={(e) => {
                    if (e.key === 'Escape') onClose();
                    if (e.key === 'Enter' && !confirmDisable) onConfirm();
                }}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Icon size={16} />
                        </div>
                        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-4">
                    {children}
                </div>

                <div className="flex items-center justify-end gap-2 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200/50 dark:border-gray-700/50">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={confirmDisable}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md shadow-sm transition-all
                            ${confirmDisable
                                ? 'bg-indigo-300 dark:bg-indigo-500/50 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-indigo-500/20'}`}
                    >
                        {confirmDisable ? (
                            <Check size={14} className="opacity-50" />
                        ) : (
                            <Check size={14} />
                        )}
                        Insert
                    </button>
                </div>
            </div>
        </div>
    );
};

interface EditorModalsProps {
    isImageOpen: boolean;
    onImageClose: () => void;
    onImageConfirm: (url: string) => void;

    isTableOpen: boolean;
    onTableClose: () => void;
    onTableConfirm: (rows: number, cols: number) => void;
}

export const EditorModals: React.FC<EditorModalsProps> = ({
    isImageOpen,
    onImageClose,
    onImageConfirm,
    isTableOpen,
    onTableClose,
    onTableConfirm
}) => {
    // Image State
    const [imageUrl, setImageUrl] = useState('');
    const [isValidUrl, setIsValidUrl] = useState(false);
    const [activeTab, setActiveTab] = useState<'link' | 'upload'>('link');
    const [isUploading, setIsUploading] = useState(false);

    // Table State
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);

    // Reset details when opening/closing
    useEffect(() => {
        if (!isImageOpen) {
            setImageUrl('');
            setIsValidUrl(false);
            setActiveTab('link');
            setIsUploading(false);
        }
    }, [isImageOpen]);

    useEffect(() => {
        if (!isTableOpen) {
            setRows(3);
            setCols(3);
        }
    }, [isTableOpen]);

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrl(url);
        // Basic naive URL check or just check length
        setIsValidUrl(url.length > 0 && (url.startsWith('http') || url.startsWith('data:')));
    };

    return (
        <>
            {/* Image Modal */}
            <BaseModal
                isOpen={isImageOpen}
                onClose={onImageClose}
                title="Insert Image"
                icon={ImageIcon}
                onConfirm={() => onImageConfirm(imageUrl)}
                confirmDisable={!isValidUrl}
            >
                <div className="space-y-4">
                    {/* Tab Switcher */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <button
                            onClick={() => {
                                setActiveTab('link');
                                setImageUrl('');
                                setIsValidUrl(false);
                            }}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'link'
                                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Embed Link
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('upload');
                                setImageUrl('');
                                setIsValidUrl(false);
                            }}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'upload'
                                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Upload File
                        </button>
                    </div>

                    {/* Input Area */}
                    {activeTab === 'link' ? (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Image URL</label>
                            <input
                                type="text"
                                placeholder="https://example.com/image.png"
                                value={imageUrl}
                                onChange={handleImageUrlChange}
                                autoFocus
                                disabled={isUploading}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow disabled:opacity-50"
                            />
                        </div>
                    ) : (
                        <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative cursor-pointer group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setIsUploading(true);
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const result = event.target?.result as string;
                                            setImageUrl(result);
                                            setIsValidUrl(true);
                                            setIsUploading(false);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <div className="flex flex-col items-center text-center">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                                    {isUploading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
                                    ) : (
                                        <ImageIcon size={20} />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {isUploading ? 'Processing...' : 'Click to upload'}
                                </span>
                                {!isUploading && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        SVG, PNG, JPG or GIF (max. 5MB)
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Basic Preview */}
                    {isValidUrl && (
                        <div className="relative mt-2 aspect-video w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center group">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full h-full object-contain"
                                onError={() => setIsValidUrl(false)} // Disable if load fails
                            />
                            {/* Remove button for uploaded image */}
                            <button
                                onClick={() => {
                                    setImageUrl('');
                                    setIsValidUrl(false);
                                }}
                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}
                </div>
            </BaseModal>

            {/* Table Modal */}
            <BaseModal
                isOpen={isTableOpen}
                onClose={onTableClose}
                title="Insert Table"
                icon={TableIcon}
                onConfirm={() => onTableConfirm(rows, cols)}
                confirmDisable={rows < 1 || cols < 1}
            >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Rows</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={rows}
                            onChange={(e) => setRows(Math.min(10, Math.max(1, parseInt(e.target.value) || 0)))}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Columns</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={cols}
                            onChange={(e) => setCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 0)))}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
                        />
                    </div>
                </div>
                <div className="mt-3 p-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-md">
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-300 text-center">
                        Creating a {rows} x {cols} table
                    </p>
                </div>
            </BaseModal>
        </>
    );
};
