import { useState, useEffect } from 'react';

export type ThemeOption = 'light' | 'dark' | 'sakura';

export interface Settings {
    theme: ThemeOption;
    pencilSensitivity: number;
    notifications: boolean;
}

// Default settings if user is new
const DEFAULT_SETTINGS: Settings = {
    theme: 'dark',
    pencilSensitivity: 50,
    notifications: true,
};

export const useSettings = () => {
    // 1. Load settings from LocalStorage on initial render
    const [settings, setSettings] = useState<Settings>(() => {
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem('nebulla-settings');
            return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
        }
        return DEFAULT_SETTINGS;
    });

    // 2. Effect: Update class on HTML element whenever 'settings.theme' changes
    useEffect(() => {
        const root = window.document.documentElement;

        // Clean up old classes to avoid conflicts
        root.classList.remove('dark', 'light', 'theme-sakura');

        // Apply class based on selection
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else if (settings.theme === 'sakura') {
            // Sakura is usually light-based, so we don't add 'dark'
            root.classList.add('theme-sakura');
        } else {
            root.classList.add('light');
        }

        // Save to LocalStorage on any change
        localStorage.setItem('nebulla-settings', JSON.stringify(settings));

    }, [settings]);

    // 3. Helper function to update a specific setting
    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Specific shortcut for changing theme
    const changeTheme = (newTheme: ThemeOption) => updateSetting('theme', newTheme);

    return {
        settings,
        updateSetting,
        changeTheme,
    };
};
