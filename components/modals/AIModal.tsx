import { useState } from 'react';
import { askGemini } from '../../services/aiService';

interface AIModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AIModal({ isOpen, onClose }: AIModalProps) {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult('');

        try {
            const response = await askGemini(prompt);
            setResult(response);
        } catch (err: any) {
            setError(err.message || 'Failed to generate content');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInsert = () => {
        if (!result) return;

        // Dispatch custom event to insert AI content into editor
        window.dispatchEvent(
            new CustomEvent('nebulla:insert-ai-content', {
                detail: { text: result }
            })
        );

        // Close modal and reset state
        handleClose();
    };

    const handleClose = () => {
        setPrompt('');
        setResult('');
        setError('');
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary dark:text-primary-dark text-2xl">
                            auto_awesome
                        </span>
                        <h2 className="text-xl font-semibold text-text-main dark:text-white">
                            ✨ Ask Gemini 3
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-text-secondary hover:text-text-main dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Prompt Input */}
                    <div>
                        <label className="block text-sm font-medium text-text-main dark:text-gray-300 mb-2">
                            What would you like AI to help with?
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Tuliskan sesuatu..."
                            className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark resize-none"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Generate Button */}
                    {!result && (
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt.trim()}
                            className="w-full px-6 py-3 bg-primary dark:bg-primary-dark text-white rounded-lg font-medium hover:bg-primary/90 dark:hover:bg-primary-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">
                                        progress_activity
                                    </span>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Generate
                                </>
                            )}
                        </button>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                                error
                            </span>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                    Error
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Result Preview */}
                    {result && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-text-main dark:text-gray-300">
                                AI Response
                            </label>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <pre className="whitespace-pre-wrap text-text-main dark:text-gray-300 font-sans">
                                        {result}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {result && (
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 text-text-secondary dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleInsert}
                            className="px-6 py-2.5 bg-primary dark:bg-primary-dark text-white rounded-lg font-medium hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Insert into Editor
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
