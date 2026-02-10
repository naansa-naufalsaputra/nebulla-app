import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIFloatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentNoteContent: string;
}

const AIFloatingModal: React.FC<AIFloatingModalProps> = ({ isOpen, onClose, currentNoteContent }) => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Auto focus when opened
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() && !currentNoteContent) return;

        setIsLoading(true);
        setResponse(null); // Clear previous

        try {
            // Construct Context-Aware Prompt
            const finalPrompt = `Context: Berikut adalah catatan yang sedang saya buka:\n${currentNoteContent}\n\nUser Request: ${text}`;

            const result = await geminiService.askAssistant(finalPrompt);
            setResponse(result.text);
        } catch (error) {
            console.error(error);
            setResponse("Maaf, terjadi kesalahan saat menghubungi AI.");
        } finally {
            setIsLoading(false);
            setInput(''); // Clear input
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
            {/* Backdrop -> Close on click outside */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-[600px] bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-200">
                {/* Input Area */}
                <div className="p-4 flex items-center gap-3 border-b border-gray-800">
                    <span className="material-symbols-outlined text-purple-400 text-2xl animate-pulse">sparkles</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask AI to write, edit, or plan..."
                        className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-gray-500 font-medium"
                    />
                    {isLoading && (
                        <div className="size-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                </div>

                {/* Response Area */}
                {response && (
                    <div className="p-4 max-h-[400px] overflow-y-auto bg-gray-800/50 text-gray-200 prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{response}</ReactMarkdown>
                    </div>
                )}

                {/* Quick Actions (Only show if no response yet) */}
                {!response && (
                    <div className="p-3 bg-gray-900/50 flex gap-2 overflow-x-auto">
                        <button
                            onClick={() => handleSend("Summarize this note")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors border border-gray-700"
                        >
                            <span className="material-symbols-outlined text-[14px] text-purple-400">summarize</span>
                            Summarize
                        </button>
                        <button
                            onClick={() => handleSend("Translate this note to English")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors border border-gray-700"
                        >
                            <span className="material-symbols-outlined text-[14px] text-blue-400">translate</span>
                            Translate to English
                        </button>
                        <button
                            onClick={() => handleSend("Fix grammar and spelling")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors border border-gray-700"
                        >
                            <span className="material-symbols-outlined text-[14px] text-green-400">spellcheck</span>
                            Fix Grammar
                        </button>
                        <button
                            onClick={() => handleSend("Continue writing based on this")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors border border-gray-700"
                        >
                            <span className="material-symbols-outlined text-[14px] text-amber-400">edit_note</span>
                            Continue Writing
                        </button>
                    </div>
                )}

                {/* Footer Info */}
                <div className="px-4 py-2 bg-gray-950 text-[10px] text-gray-600 flex justify-between items-center">
                    <span>Nebulla AI</span>
                    <div className="flex gap-2">
                        <span>Running on Gemini 1.5 Flash</span>
                        <span className="font-mono bg-gray-900 px-1 rounded">ESC to close</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIFloatingModal;
