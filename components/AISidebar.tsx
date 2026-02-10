import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import { ChatMessage, NoteBlock } from '../types';

interface AISidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeNoteContent?: string;
    onExportToNote: (blocks: { type: NoteBlock['type'], content: string, style?: any }[]) => void;
}

const AISidebar: React.FC<AISidebarProps> = ({ isOpen, onClose, activeNoteContent, onExportToNote }) => {
    // --- State Management ---
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = localStorage.getItem('nebulla_ai_history');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- Effects ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = setTimeout(() => {
            localStorage.setItem('nebulla_ai_history', JSON.stringify(messages));
        }, 1000);
        return () => clearTimeout(handler);
    }, [messages]);

    if (!isOpen) return null;

    // --- Handlers ---
    const handleClearChat = () => {
        if (window.confirm("Clear chat history?")) {
            setMessages([]);
            localStorage.removeItem('nebulla_ai_history');
        }
    };

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || isLoading) return;

        // User Message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: textToSend
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // AI Placeholder
        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg: ChatMessage = {
            id: aiMsgId,
            role: 'model',
            text: '',
            isStreaming: true
        };
        setMessages(prev => [...prev, aiMsg]);

        try {
            const stream = geminiService.askAssistantStream(textToSend, activeNoteContent);
            let fullText = '';

            for await (const chunk of stream) {
                fullText += chunk;
                setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: fullText } : msg));
            }

            setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg));
        } catch (error) {
            setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: "Sorry, I encountered an error.", isStreaming: false } : msg));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // --- Render Helpers ---
    // User Bubble Component
    const UserBubble = ({ text }: { text: string }) => (
        <div className="flex flex-col items-end gap-1 animate-in slide-in-from-right-2 duration-300">
            <div className="bg-surface border border-borderCol text-txtMain px-5 py-3 rounded-2xl rounded-tr-sm text-sm max-w-[90%] shadow-sm">
                {text}
            </div>
            <span className="text-[10px] text-txtMuted mr-1 font-semibold">You</span>
        </div>
    );

    // AI Bubble Component
    const AIBubble = ({ msg }: { msg: ChatMessage }) => {
        // Function to render Markdown
        return (
            <div className="flex flex-col items-start gap-2 animate-in slide-in-from-left-2 duration-300 w-full group">
                <div className={`bg-surface p-5 rounded-[24px] rounded-tl-sm text-sm w-full max-w-[95%] border border-borderCol shadow-sm ${msg.isStreaming ? 'animate-pulse' : ''}`}>

                    <div className="prose prose-sm max-w-none font-display text-txtMain
                            prose-headings:text-txtMain prose-p:text-txtMain prose-strong:text-primary prose-li:text-txtMain prose-ul:text-txtMain
                            prose-code:text-primary prose-code:bg-primary/10 prose-pre:bg-gray-800 prose-pre:text-gray-100
                            marker:text-txtMuted">
                        {/* React Markdown for Rich Text */}
                        <ReactMarkdown
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    return !inline ? (
                                        <div className="relative group/code">
                                            <pre className="rounded-lg p-3 overflow-x-auto my-2 border border-borderCol/20 bg-[#1e1e1e] text-gray-100">
                                                <code {...props} className={className}>
                                                    {children}
                                                </code>
                                            </pre>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(String(children))}
                                                className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-md opacity-0 group-hover/code:opacity-100 transition-opacity"
                                                title="Copy Code"
                                            >
                                                <span className="material-symbols-outlined text-[14px] text-white">content_copy</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <code {...props} className={`${className} bg-primary/10 text-primary px-1 py-0.5 rounded font-mono text-xs`}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {msg.text || (msg.isStreaming ? '_Thinking..._' : '')}
                        </ReactMarkdown>
                    </div>

                    <div className="flex items-center gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-txtMuted font-bold tracking-wide">Nebulla AI</span>
                        {!msg.isStreaming && (
                            <>
                                <button onClick={() => navigator.clipboard.writeText(msg.text)} className="text-txtMuted hover:text-primary transition-transform hover:scale-110" title="Copy">
                                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                </button>
                                <button onClick={() => onExportToNote && onExportToNote([{ type: 'text', content: msg.text }])} className="text-txtMuted hover:text-primary transition-transform hover:scale-110" title="Insert to Note">
                                    <span className="material-symbols-outlined text-[14px]">post_add</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const QuickActionButton = ({ icon, label, prompt }: { icon: string, label: string, prompt: string }) => (
        <button
            onClick={() => handleSend(prompt)}
            className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 bg-surface border border-borderCol rounded-full text-xs font-bold text-txtMain hover:border-primary hover:text-primary transition-colors shadow-sm"
        >
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
            {label}
        </button>
    );

    return (
        <aside className="w-80 flex-shrink-0 flex flex-col bg-surface border-l border-borderCol z-20 shadow-xl h-full font-display transition-colors duration-300">

            {/* 1. Header Sidebar */}
            <div className="px-5 py-4 border-b border-borderCol flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-txtMain text-lg">✨ Nebulla AI</h3>
                </div>
                <div className="flex gap-1">
                    <button onClick={handleClearChat} className="text-txtMuted hover:text-red-500 transition-colors p-1" title="Clear Chat">
                        <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                    </button>
                    <button onClick={onClose} className="text-txtMuted hover:text-primary transition-colors p-1">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
            </div>

            {/* 2. Quick Actions */}
            <div className="flex-shrink-0 p-4 border-b border-borderCol bg-main/50">
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    <QuickActionButton icon="summarize" label="Summarize" prompt="Summarize the active note" />
                    <QuickActionButton icon="gesture" label="Review" prompt="Review the writing style" />
                    <QuickActionButton icon="calculate" label="Math" prompt="Solve any math in this note" />
                </div>
            </div>

            {/* 3. Chat History Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

                {/* State Kosong (Intro) */}
                {messages.length === 0 && (
                    <div className="text-center my-4">
                        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-3 animate-pulse">
                            <span className="material-symbols-outlined text-primary text-[28px]">psychology</span>
                        </div>
                        <p className="text-xs text-txtMuted font-medium px-4">
                            Ask me anything about your notes or drag content here to analyze.
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    msg.role === 'user'
                        ? <UserBubble key={msg.id} text={msg.text} />
                        : <AIBubble key={msg.id} msg={msg} />
                ))}

                <div ref={messagesEndRef} />

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex flex-col items-start gap-1">
                        <div className="bg-primary/10 px-4 py-3 rounded-2xl rounded-tl-sm text-sm w-16 flex items-center justify-center gap-1">
                            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. Input Area (Bawah) */}
            <div className="p-4 pt-2 bg-surface">
                <div className={`relative flex items-end gap-2 bg-main border border-borderCol focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 rounded-3xl p-2 transition-all shadow-sm ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>

                    <button className="p-2 text-txtMuted hover:text-primary transition-colors flex-shrink-0 self-end">
                        <span className="material-symbols-outlined text-[24px]">add_circle</span>
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none focus:ring-0 p-2 text-sm text-txtMain placeholder:text-txtMuted/70 resize-none max-h-32 self-center font-medium outline-none"
                        placeholder="Ask AI to write, edit, or plan..."
                        rows={1}
                    />

                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        className="p-2 bg-primary text-white rounded-2xl shadow-md shadow-primary/20 hover:bg-primary-hover transition-colors flex-shrink-0 self-end disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    </button>
                </div>
                <p className="text-[10px] text-center text-txtMuted/60 mt-2 font-medium">
                    AI can make mistakes. Check important info.
                </p>
            </div>

        </aside>
    );
};

export default AISidebar;