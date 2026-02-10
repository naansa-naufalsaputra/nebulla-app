import React from 'react';
import { NoteBlock } from '../types';

interface TemplateLibraryProps {
    onSelectTemplate: (title: string, blocks: NoteBlock[]) => void;
    onClose: () => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate, onClose }) => {
    
    const handleTemplateClick = (type: string) => {
        let title = "New Note";
        let blocks: NoteBlock[] = [];
        const idBase = Date.now().toString();

        switch (type) {
            case 'dream_journal':
                title = "Dream Journal";
                blocks = [
                    { id: idBase + '1', type: 'heading1', content: 'Dream Journal 🌙' },
                    { id: idBase + '2', type: 'text', content: `Date: ${new Date().toLocaleDateString()}` },
                    { id: idBase + '3', type: 'heading2', content: 'The Dream' },
                    { id: idBase + '4', type: 'text', content: 'Describe what happened...' },
                    { id: idBase + '5', type: 'heading2', content: 'Interpretation' },
                    { id: idBase + '6', type: 'text', content: 'How did it make you feel?' },
                ];
                break;
            case 'mood_tracker':
                title = "Mood Tracker";
                blocks = [
                    { id: idBase + '1', type: 'heading1', content: 'Daily Mood Tracker 🌱' },
                    { id: idBase + '2', type: 'text', content: 'How are you feeling today?' },
                    { id: idBase + '3', type: 'bullet_list', content: 'Morning: ' },
                    { id: idBase + '4', type: 'bullet_list', content: 'Afternoon: ' },
                    { id: idBase + '5', type: 'bullet_list', content: 'Evening: ' },
                    { id: idBase + '6', type: 'heading2', content: 'Gratitude' },
                    { id: idBase + '7', type: 'todo', content: 'List 3 things you are grateful for' },
                ];
                break;
            case 'project_roadmap':
                title = "Project Roadmap";
                blocks = [
                    { id: idBase + '1', type: 'heading1', content: 'Project Roadmap 🚀' },
                    { id: idBase + '2', type: 'text', content: 'Objective: ' },
                    { id: idBase + '3', type: 'table', content: 'Phase,Owner,Status,Due Date\nQ1 Planning,Team,Done,Jan 15\nDev Sprint 1,Devs,In Progress,Feb 1' },
                    { id: idBase + '4', type: 'heading2', content: 'Key Milestones' },
                    { id: idBase + '5', type: 'todo', content: 'Kickoff Meeting', checked: true },
                    { id: idBase + '6', type: 'todo', content: 'MVP Launch', checked: false },
                ];
                break;
            case 'meeting_minutes':
                title = "Meeting Minutes";
                blocks = [
                    { id: idBase + '1', type: 'heading1', content: 'Meeting Minutes' },
                    { id: idBase + '2', type: 'text', content: `Date: ${new Date().toLocaleDateString()} | Attendees: ` },
                    { id: idBase + '3', type: 'heading2', content: 'Agenda' },
                    { id: idBase + '4', type: 'bullet_list', content: 'Topic 1' },
                    { id: idBase + '5', type: 'heading2', content: 'Action Items' },
                    { id: idBase + '6', type: 'todo', content: 'Follow up email' },
                ];
                break;
            case 'daily_planner':
                title = "Daily Planner";
                blocks = [
                    { id: idBase + '1', type: 'heading1', content: 'Daily Plan 🗓️' },
                    { id: idBase + '2', type: 'heading2', content: 'Top Priorities' },
                    { id: idBase + '3', type: 'todo', content: 'Priority 1' },
                    { id: idBase + '4', type: 'todo', content: 'Priority 2' },
                    { id: idBase + '5', type: 'heading2', content: 'Schedule' },
                    { id: idBase + '6', type: 'table', content: 'Time,Task\n09:00, \n12:00, Lunch' },
                ];
                break;
            default:
                title = "New Note";
                blocks = [{ id: idBase + '1', type: 'heading1', content: 'Untitled' }];
        }
        
        onSelectTemplate(title, blocks);
    };

    return (
        <div className="flex-1 w-full h-full overflow-y-auto bg-background-light dark:bg-background-dark p-8 md:p-12 pb-24 relative">
             <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none dot-grid" style={{ backgroundSize: '32px 32px' }}></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col gap-8 mb-12">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-text-main dark:text-white tracking-tight">Template Library</h1>
                            <p className="text-text-secondary dark:text-gray-400">Kickstart your next project with a pre-built structure.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-text-secondary dark:text-gray-400">close</span>
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full max-w-2xl group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">search</span>
                            </div>
                            <input className="block w-full pl-12 pr-4 py-3.5 bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-2xl text-text-main dark:text-white placeholder:text-text-secondary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="Search templates..." type="text"/>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 hide-scrollbar">
                            <button className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium shadow-sm whitespace-nowrap">All</button>
                            <button className="px-5 py-2 bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Cute</button>
                            <button className="px-5 py-2 bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Professional</button>
                            <button className="px-5 py-2 bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full text-sm font-medium whitespace-nowrap transition-colors">Functional</button>
                        </div>
                    </div>
                </div>

                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl text-pink-500">
                            <span className="material-symbols-outlined">palette</span>
                        </div>
                        <h2 className="text-xl font-bold text-text-main dark:text-white">Cute &amp; Aesthetic</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div onClick={() => handleTemplateClick('dream_journal')} className="group relative flex flex-col bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-800/30 rounded-[32px] p-6 hover:shadow-float transition-all cursor-pointer overflow-hidden h-72">
                            <span className="material-symbols-outlined absolute top-4 right-4 text-pink-200/50 text-6xl rotate-12 filled">cloud</span>
                            <span className="material-symbols-outlined absolute bottom-4 right-12 text-pink-300/30 text-4xl -rotate-12 filled">star</span>
                            <div className="w-full h-32 bg-white/60 dark:bg-white/10 rounded-3xl mb-5 flex items-center justify-center backdrop-blur-sm border border-pink-100/50 shadow-sm group-hover:scale-[1.02] transition-transform">
                                <span className="material-symbols-outlined text-4xl text-pink-400">auto_stories</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-pink-50 mb-1">Dream Journal</h3>
                                <p className="text-sm text-gray-600 dark:text-pink-200/70 leading-relaxed">Pastel pages for your nightly thoughts.</p>
                            </div>
                        </div>
                        <div onClick={() => handleTemplateClick('mood_tracker')} className="group relative flex flex-col bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-[32px] p-6 hover:shadow-float transition-all cursor-pointer overflow-hidden h-72">
                            <span className="material-symbols-outlined absolute -top-2 -right-2 text-purple-200/50 text-8xl filled">spa</span>
                            <div className="w-full h-32 bg-white/60 dark:bg-white/10 rounded-3xl mb-5 flex items-center justify-center backdrop-blur-sm border border-purple-100/50 shadow-sm group-hover:scale-[1.02] transition-transform">
                                <span className="material-symbols-outlined text-4xl text-purple-400">mood</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-purple-50 mb-1">Mood Tracker</h3>
                                <p className="text-sm text-gray-600 dark:text-purple-200/70 leading-relaxed">Track your feelings with cute emojis.</p>
                            </div>
                        </div>
                        <div onClick={() => handleTemplateClick('scrapbook')} className="group relative flex flex-col bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/30 rounded-[32px] p-6 hover:shadow-float transition-all cursor-pointer overflow-hidden h-72">
                            <span className="material-symbols-outlined absolute bottom-6 right-6 text-sky-200/50 text-5xl rotate-45 filled">pets</span>
                            <div className="w-full h-32 bg-white/60 dark:bg-white/10 rounded-3xl mb-5 flex items-center justify-center backdrop-blur-sm border border-sky-100/50 shadow-sm group-hover:scale-[1.02] transition-transform">
                                <span className="material-symbols-outlined text-4xl text-sky-400">photo_album</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-sky-50 mb-1">Scrapbook</h3>
                                <p className="text-sm text-gray-600 dark:text-sky-200/70 leading-relaxed">Digital stickers and memories.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined">work</span>
                        </div>
                        <h2 className="text-xl font-bold text-text-main dark:text-white">Professional</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div onClick={() => handleTemplateClick('project_roadmap')} className="group flex flex-col bg-white dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-xl p-0 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer overflow-hidden">
                            <div className="w-full h-36 bg-gray-50 dark:bg-gray-800/50 border-b border-border-color dark:border-gray-700 flex flex-col items-center justify-center p-4">
                                <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-2"></div>
                                <div className="w-1/2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-4"></div>
                                <div className="flex gap-2">
                                    <div className="w-16 h-10 bg-white dark:bg-gray-700 rounded shadow-sm border border-gray-100 dark:border-gray-600"></div>
                                    <div className="w-16 h-10 bg-white dark:bg-gray-700 rounded shadow-sm border border-gray-100 dark:border-gray-600"></div>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-text-main dark:text-white mb-1">Project Roadmap</h3>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">arrow_outward</span>
                                </div>
                                <p className="text-sm text-text-secondary dark:text-gray-400">Quarterly planning with Gantt style view.</p>
                            </div>
                        </div>
                        <div onClick={() => handleTemplateClick('meeting_minutes')} className="group flex flex-col bg-white dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-xl p-0 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer overflow-hidden">
                            <div className="w-full h-36 bg-gray-50 dark:bg-gray-800/50 border-b border-border-color dark:border-gray-700 flex items-center justify-center p-4">
                                <span className="material-symbols-outlined text-4xl text-gray-400">table_chart</span>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-text-main dark:text-white mb-1">Meeting Minutes</h3>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">arrow_outward</span>
                                </div>
                                <p className="text-sm text-text-secondary dark:text-gray-400">Standardized format for corporate notes.</p>
                            </div>
                        </div>
                        <div onClick={() => handleTemplateClick('okr')} className="group flex flex-col bg-white dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-xl p-0 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer overflow-hidden">
                            <div className="w-full h-36 bg-gray-50 dark:bg-gray-800/50 border-b border-border-color dark:border-gray-700 flex items-center justify-center p-4">
                                <span className="material-symbols-outlined text-4xl text-gray-400">analytics</span>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-text-main dark:text-white mb-1">OKR Tracker</h3>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">arrow_outward</span>
                                </div>
                                <p className="text-sm text-text-secondary dark:text-gray-400">Track objectives and key results.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-500">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <h2 className="text-xl font-bold text-text-main dark:text-white">Functional</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div onClick={() => handleTemplateClick('daily_planner')} className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-border-color dark:border-gray-700 hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex gap-4 items-center">
                            <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined">calendar_today</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-main dark:text-white text-sm">Daily Planner</h3>
                                <p className="text-xs text-text-secondary mt-0.5">Time blocking</p>
                            </div>
                        </div>
                        <div onClick={() => handleTemplateClick('habit_tracker')} className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-border-color dark:border-gray-700 hover:border-green-500/50 hover:shadow-md transition-all cursor-pointer flex gap-4 items-center">
                            <div className="size-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined">fact_check</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-main dark:text-white text-sm">Habit Tracker</h3>
                                <p className="text-xs text-text-secondary mt-0.5">Daily streaks</p>
                            </div>
                        </div>
                        <div onClick={() => handleTemplateClick('grocery_list')} className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-border-color dark:border-gray-700 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer flex gap-4 items-center">
                            <div className="size-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined">list_alt</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-main dark:text-white text-sm">Grocery List</h3>
                                <p className="text-xs text-text-secondary mt-0.5">Smart categories</p>
                            </div>
                        </div>
                        <div onClick={() => handleTemplateClick('pomodoro')} className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-border-color dark:border-gray-700 hover:border-red-500/50 hover:shadow-md transition-all cursor-pointer flex gap-4 items-center">
                            <div className="size-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined">timer</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-main dark:text-white text-sm">Pomodoro</h3>
                                <p className="text-xs text-text-secondary mt-0.5">Focus blocks</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TemplateLibrary;