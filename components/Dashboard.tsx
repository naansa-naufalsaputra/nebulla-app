import React from 'react';

interface DashboardProps {
    userName: string;
    onSearchChange: (query: string) => void;
    searchQuery: string;
    onCreateNote: () => void;
    onViewFavorites: () => void;
    onViewRecent: () => void;
    onViewTemplates: () => void;
    onImportPDF: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    userName,
    onSearchChange,
    searchQuery,
    onCreateNote,
    onViewFavorites,
    onViewRecent,
    onViewTemplates,
    onImportPDF
}) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="flex-1 w-full h-full pt-4 px-8 md:px-12 pb-8 overflow-y-auto flex flex-col items-center justify-center bg-background-light dark:bg-background-dark relative">
            {/* Background Dot Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none dot-grid" style={{ backgroundSize: '32px 32px' }}></div>

            {/* Nebula Ambient Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-pink/20 blur-[120px] rounded-full pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/20 blur-[120px] rounded-full pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000"></div>

            <div className="w-full max-w-5xl flex flex-col gap-12 z-10">
                {/* Greeting & Search */}
                <div className="flex flex-col items-center gap-10 w-full">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-5xl font-bold text-text-main dark:text-white tracking-tight">
                            {getGreeting()}, {userName}
                        </h1>
                        <p className="text-lg text-text-secondary dark:text-gray-400">
                            What would you like to capture today?
                        </p>
                    </div>

                    <div className="w-full max-w-3xl relative group">
                        <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-text-secondary text-[28px] group-focus-within:text-primary transition-colors">search</span>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-20 pr-8 py-6 bg-surface-light dark:bg-surface-dark border-none rounded-[28px] text-xl text-text-main dark:text-white placeholder:text-text-secondary/60 focus:ring-2 focus:ring-primary/20 shadow-soft hover:shadow-float transition-all"
                            placeholder="Search your thoughts, notes, and documents..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-4">
                    <button onClick={onCreateNote} className="flex flex-col items-center text-center p-8 gap-5 bg-surface-light dark:bg-surface-dark/50 dark:backdrop-blur-xl rounded-[28px] shadow-soft hover:shadow-float hover:-translate-y-1 transition-all group aspect-square justify-center border border-gray-200 dark:border-white/10 hover:border-primary/20 hover:dark:border-primary/30">
                        <div className="size-20 rounded-3xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-[40px]">add</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block font-bold text-text-main dark:text-white text-xl">New Note</span>
                            <span className="block text-sm text-text-secondary dark:text-gray-400">Create blank canvas</span>
                        </div>
                    </button>

                    <button onClick={onViewFavorites} className="flex flex-col items-center text-center p-8 gap-5 bg-surface-light dark:bg-surface-dark/50 dark:backdrop-blur-xl rounded-[28px] shadow-soft hover:shadow-float hover:-translate-y-1 transition-all group aspect-square justify-center border border-gray-200 dark:border-white/10 hover:border-amber-500/20 hover:dark:border-amber-500/30">
                        <div className="size-20 rounded-3xl bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-[40px] filled">star</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block font-bold text-text-main dark:text-white text-xl">Favorites</span>
                            <span className="block text-sm text-text-secondary dark:text-gray-400">Important items</span>
                        </div>
                    </button>

                    <button onClick={onViewRecent} className="flex flex-col items-center text-center p-8 gap-5 bg-surface-light dark:bg-surface-dark/50 dark:backdrop-blur-xl rounded-[28px] shadow-soft hover:shadow-float hover:-translate-y-1 transition-all group aspect-square justify-center border border-gray-200 dark:border-white/10 hover:border-blue-500/20 hover:dark:border-blue-500/30">
                        <div className="size-20 rounded-3xl bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-[40px]">schedule</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block font-bold text-text-main dark:text-white text-xl">Recent Documents</span>
                            <span className="block text-sm text-text-secondary dark:text-gray-400">Continue working</span>
                        </div>
                    </button>

                    <button onClick={onViewTemplates} className="flex flex-col items-center text-center p-8 gap-5 bg-surface-light dark:bg-surface-dark/50 dark:backdrop-blur-xl rounded-[28px] shadow-soft hover:shadow-float hover:-translate-y-1 transition-all group aspect-square justify-center border border-gray-200 dark:border-white/10 hover:border-purple-500/20 hover:dark:border-purple-500/30">
                        <div className="size-20 rounded-3xl bg-purple-100 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-[40px]">dashboard</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block font-bold text-text-main dark:text-white text-xl">Templates</span>
                            <span className="block text-sm text-text-secondary dark:text-gray-400">Start faster</span>
                        </div>
                    </button>

                    <button onClick={onImportPDF} className="flex flex-col items-center text-center p-8 gap-5 bg-surface-light dark:bg-surface-dark/50 dark:backdrop-blur-xl rounded-[28px] shadow-soft hover:shadow-float hover:-translate-y-1 transition-all group aspect-square justify-center border border-gray-200 dark:border-white/10 hover:border-red-500/20 hover:dark:border-red-500/30">
                        <div className="size-20 rounded-3xl bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-[40px]">upload_file</span>
                        </div>
                        <div className="space-y-1">
                            <span className="block font-bold text-text-main dark:text-white text-xl">Import PDF</span>
                            <span className="block text-sm text-text-secondary dark:text-gray-400">Upload document</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;