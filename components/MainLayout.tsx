import React from 'react';

interface MainLayoutProps {
    isSidebarOpen: boolean;
    sidebar: React.ReactNode;
    aiSidebar: React.ReactNode;
    floatingModal: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    isSidebarOpen,
    sidebar,
    aiSidebar,
    floatingModal,
    children,
    className = ''
}) => {
    return (
        <div className={`flex h-screen bg-main text-txtMain overflow-hidden font-display transition-colors duration-200 ${className}`}>
            {/* Keyboard Shortcut Modal */}
            {floatingModal}

            {/* Mobile Backdrop (only visible when sidebar is open on mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => {
                        // Close sidebar when clicking backdrop on mobile
                        const event = new CustomEvent('toggle-sidebar');
                        window.dispatchEvent(event);
                    }}
                />
            )}

            {/* Left Sidebar - Collapsible */}
            <aside className={`
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
                md:${isSidebarOpen ? 'w-64' : 'w-0'}
                fixed md:relative inset-y-0 left-0 z-50 md:z-auto
                overflow-hidden
            `}>
                {sidebar}
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                {children}
            </div>

            {/* Right Sidebar */}
            {aiSidebar}
        </div>
    );
};
