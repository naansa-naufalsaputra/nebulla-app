import React, { useState, useEffect } from 'react';
import { NoteBlock } from '../types';

interface TemplateGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate: (title: string, blocks: NoteBlock[], font: string) => void;
    onHoverTemplate?: (title: string | null, blocks: NoteBlock[] | null, font: string | null) => void;
}

// 1. Updated Template Definitions with new Categories
const STATIC_TEMPLATES = [
    {
        id: "unnes_cornell",
        name: "Cornell Academic - UNNES",
        category: "Academic",
        description: "Standar catatan kuliah dengan kolom recall dan ringkasan.",
        default_font: "Times New Roman",
        layout: [
            { id: 't1', type: 'heading1', content: "📌 Topik Kuliah: [Nama Materi]", style: { fontFamily: "Times New Roman", fontWeight: "bold", textAlign: "center" } },
            { id: 't2', type: 'text', content: "Mata Kuliah: [Nama] | Tanggal: [Tanggal]", style: { fontFamily: "Times New Roman", fontStyle: "italic" } },
            { id: 't3', type: 'table', content: "❓ Pertanyaan / Kata Kunci,📝 Catatan Utama\n[Tulis kata kunci],[Penjelasan detail...]\n[Konsep Penting],[Diagram...]", style: { fontFamily: "Times New Roman" } },
            { id: 't4', type: 'heading2', content: "📋 Ringkasan", style: { fontFamily: "Times New Roman" } },
            { id: 't5', type: 'text', content: "Tulis 2-3 kalimat kesimpulan dari materi hari ini...", style: { fontFamily: "Times New Roman" } }
        ] as NoteBlock[]
    },
    {
        id: "dev_sprint",
        name: "Dev Sprint Tracker",
        category: "Developer",
        description: "Lacak bug dan fitur sprint mingguan.",
        default_font: "Fira Code",
        layout: [
            { id: 'd1', type: 'heading1', content: "🚀 Sprint Log: [Nama Proyek]", style: { fontFamily: "Fira Code" } },
            { id: 'd2', type: 'todo', content: "Fix Navigation Bug (Arrow Keys)", checked: true, style: { fontFamily: "Fira Code" } },
            { id: 'd3', type: 'todo', content: "Integrate Gemini 3 Pro API", checked: false, style: { fontFamily: "Fira Code" } },
            { id: 'd4', type: 'heading2', content: "⚙️ Code Snippet / Logic", style: { fontFamily: "Fira Code" } },
            { id: 'd5', type: 'code', content: "// Tulis logika fungsi di sini\nconst init = () => {\n  console.log('Ready');\n}", metadata: { language: 'typescript' }, style: { fontFamily: "Fira Code" } }
        ] as NoteBlock[]
    },
    {
        id: "kawaii_planner",
        name: "Kawaii Daily",
        category: "Aesthetic",
        description: "Perencana harian yang imut untuk mood booster.",
        default_font: "Roboto",
        layout: [
            { id: 'k1', type: 'heading1', content: "🌸 Hello, User! Happy Today! 🌸", style: { fontFamily: "Roboto", textAlign: "center" } },
            { id: 'k2', type: 'text', content: "☁️ Mood Hari Ini: ⭐⭐⭐⭐⭐", style: { fontFamily: "Roboto", textAlign: "center" } },
            { id: 'k3', type: 'heading2', content: "🍡 Menu Utama (To-Do)", style: { fontFamily: "Roboto" } },
            { id: 'k4', type: 'todo', content: "Self-care time 🛁", checked: false, style: { fontFamily: "Roboto" } },
            { id: 'k5', type: 'todo', content: "Belajar Algoritma 1 jam 📚", checked: false, style: { fontFamily: "Roboto" } }
        ] as NoteBlock[]
    },
    {
        id: "deep_work",
        name: "Deep Work Journal",
        category: "Productivity",
        description: "Refleksi mendalam tanpa gangguan.",
        default_font: "Georgia",
        layout: [
            { id: 'w1', type: 'heading1', content: "🌑 Refleksi Malam", style: { fontFamily: "Georgia" } },
            { id: 'w2', type: 'text', content: "> 'The scariest moment is always just before you start.'", style: { fontFamily: "Georgia", fontStyle: "italic" } },
            { id: 'w3', type: 'text', content: "Tuliskan apa yang ada di pikiranmu secara bebas...", style: { fontFamily: "Georgia" } }
        ] as NoteBlock[]
    },
    {
        id: "lab_report",
        name: "Scientific Report",
        category: "Academic",
        description: "Format laporan praktikum standar akademik.",
        default_font: "Times New Roman",
        layout: [
            { id: 'l1', type: 'heading1', content: "🔬 Laporan Praktikum / Riset", style: { fontFamily: "Times New Roman" } },
            { id: 'l2', type: 'table', content: "Variabel,Hasil Pengamatan\nInput A,Output X\nLatency,20ms", style: { fontFamily: "Times New Roman" } },
            { id: 'l3', type: 'heading2', content: "Analisis Data", style: { fontFamily: "Times New Roman" } },
            { id: 'l4', type: 'text', content: "Berdasarkan data di atas, dapat disimpulkan bahwa...", style: { fontFamily: "Times New Roman" } }
        ] as NoteBlock[]
    }
];

const CATEGORIES = ['All', 'Favorites', 'My Templates', 'Academic', 'Developer', 'Aesthetic', 'Productivity'];

// 2. Component
const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose, onSelectTemplate, onHoverTemplate }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('nebulla_template_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    // Custom templates state
    const [allTemplates, setAllTemplates] = useState(STATIC_TEMPLATES);

    // Load custom templates on open
    useEffect(() => {
        if (isOpen) {
            const stored = localStorage.getItem('nebulla_custom_templates');
            const custom: any[] = stored ? JSON.parse(stored) : [];
            setAllTemplates([...STATIC_TEMPLATES, ...custom]);
        }
    }, [isOpen]);

    // Save favorites
    useEffect(() => {
        localStorage.setItem('nebulla_template_favorites', JSON.stringify(favorites));
    }, [favorites]);

    if (!isOpen) return null;

    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const deleteCustomTemplate = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Delete this custom template?")) {
            // Remove from local storage
            const stored = localStorage.getItem('nebulla_custom_templates');
            if (stored) {
                const custom: any[] = JSON.parse(stored);
                const updated = custom.filter((t: any) => t.id !== id);
                localStorage.setItem('nebulla_custom_templates', JSON.stringify(updated));
                // Update state
                setAllTemplates([...STATIC_TEMPLATES, ...updated]);
            }
        }
    };

    const getBadgeColor = (cat: string) => {
        switch (cat) {
            case 'Academic': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
            case 'Developer': return 'bg-slate-800 text-green-400 dark:bg-slate-700';
            case 'Aesthetic': return 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300';
            case 'Productivity': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    // Filter Logic
    const filteredTemplates = allTemplates.filter((t: any) => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesCategory = true;

        if (selectedCategory === 'All') matchesCategory = true;
        else if (selectedCategory === 'Favorites') matchesCategory = favorites.includes(t.id);
        else if (selectedCategory === 'My Templates') matchesCategory = !!t.isCustom;
        else matchesCategory = t.category === selectedCategory;

        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        // Sort favorites to top in 'All' view
        if (selectedCategory === 'All') {
            const aFav = favorites.includes(a.id);
            const bFav = favorites.includes(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
        }
        return 0;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500`}
                onClick={() => {
                    if (onHoverTemplate) onHoverTemplate(null, null, null);
                    onClose();
                }}
            ></div>

            {/* Modal Content */}
            <div className="bg-background-light dark:bg-background-dark w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-gray-700">

                {/* Header & Filters */}
                <div className="px-6 py-5 border-b border-border-color flex flex-col gap-4 bg-surface-light dark:bg-surface-dark shrink-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-text-main dark:text-white">Template Gallery</h2>
                            <p className="text-sm text-text-secondary dark:text-gray-400">Start with a structured blueprint.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-text-secondary dark:text-gray-400">close</span>
                        </button>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Filter Chips */}
                        <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto hide-scrollbar">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${selectedCategory === cat
                                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {cat === 'Favorites' && <span className="material-symbols-outlined text-[14px] align-text-bottom mr-1">star</span>}
                                    {cat === 'My Templates' && <span className="material-symbols-outlined text-[14px] align-text-bottom mr-1">person</span>}
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-[#0c0c1d] relative">
                    {filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map((t: any) => (
                                <div
                                    key={t.id}
                                    onMouseEnter={() => onHoverTemplate && onHoverTemplate(t.name, t.layout, t.default_font)}
                                    onMouseLeave={() => onHoverTemplate && onHoverTemplate(null, null, null)}
                                    className="group bg-white dark:bg-surface-dark rounded-2xl border border-border-color dark:border-gray-700 overflow-hidden hover:shadow-float hover:border-primary/50 transition-all duration-300 flex flex-col h-full animate-in fade-in zoom-in-95"
                                >
                                    {/* Visual Preview (CSS based) */}
                                    <div className="h-40 bg-gray-50 dark:bg-gray-800/50 border-b border-border-color dark:border-gray-700 p-4 relative overflow-hidden">
                                        <div
                                            className="w-full h-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-700 p-3 flex flex-col gap-2 transform group-hover:scale-[1.02] transition-transform origin-top"
                                            style={{ fontFamily: t.default_font }}
                                        >
                                            {/* Fake Title */}
                                            <div className="w-3/4 h-2.5 bg-gray-800 dark:bg-gray-400 rounded-sm mb-1 opacity-80"></div>
                                            {/* Fake Lines */}
                                            <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-700 rounded-sm"></div>
                                            <div className="w-5/6 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-sm"></div>

                                            {/* Fake Table or List based on Category */}
                                            {t.category === 'Developer' && (
                                                <div className="mt-1 p-2 bg-slate-800 rounded-md">
                                                    <div className="w-1/2 h-1 bg-green-500/50 rounded-sm mb-1"></div>
                                                    <div className="w-1/3 h-1 bg-green-500/30 rounded-sm"></div>
                                                </div>
                                            )}
                                            {t.category === 'Academic' && (
                                                <div className="mt-1 border border-gray-200 dark:border-gray-600 rounded flex flex-col">
                                                    <div className="h-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"></div>
                                                    <div className="h-3 border-b border-gray-200 dark:border-gray-600"></div>
                                                </div>
                                            )}
                                            {t.category === 'Aesthetic' && (
                                                <div className="flex gap-1 mt-1">
                                                    <div className="size-6 bg-pink-100 rounded-full"></div>
                                                    <div className="size-6 bg-purple-100 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Badge */}
                                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${getBadgeColor(t.category)}`}>
                                            {t.category}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="absolute top-3 right-3 flex gap-1">
                                            <button
                                                onClick={(e) => toggleFavorite(e, t.id)}
                                                className="p-1.5 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all"
                                                title="Favorite"
                                            >
                                                <span className={`material-symbols-outlined text-[18px] ${favorites.includes(t.id) ? 'text-amber-400 filled' : 'text-gray-400'}`}>
                                                    star
                                                </span>
                                            </button>

                                            {/* Delete Button for Custom Templates */}
                                            {t.isCustom && (
                                                <button
                                                    onClick={(e) => deleteCustomTemplate(e, t.id)}
                                                    className="p-1.5 rounded-full bg-white/80 dark:bg-black/50 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 shadow-sm transition-all group/delete"
                                                    title="Delete Template"
                                                >
                                                    <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover/delete:text-white">
                                                        delete
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-text-main dark:text-white mb-1 group-hover:text-primary transition-colors">{t.name}</h3>
                                            <p className="text-xs text-text-secondary dark:text-gray-400 line-clamp-2">{t.description}</p>
                                        </div>

                                        <div className="mt-auto">
                                            <button
                                                onClick={() => onSelectTemplate(t.name, t.layout, t.default_font)}
                                                className="w-full py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-text-main dark:text-white rounded-xl text-sm font-bold hover:bg-primary hover:border-primary hover:text-white transition-all shadow-sm active:scale-[0.98]"
                                            >
                                                Use This Template
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Empty State
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-80 animate-in fade-in zoom-in-95">
                            <div className="size-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-gray-400">sentiment_dissatisfied</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-main dark:text-white">Opps! Template not found.</h3>
                            <p className="text-sm text-text-secondary dark:text-gray-400 max-w-xs mt-1">
                                Try a different category or search term.
                            </p>
                            <button
                                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                                className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateGallery;