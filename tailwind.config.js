/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./lib/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#ee2b8c", // Pink primary for Glassmorphism design
                "primary-hover": "var(--primary-hover)",
                "primary-dark": "#60a5fa",
                "background-light": "#f8f6f7", // Glassmorphism light background
                "background-dark": "#1a1a2e",  // Deep blue-gray dark background
                "surface-light": "var(--bg-surface)", // Legacy mapping
                "surface-dark": "#1a1a2e",          // Deep blue-gray surface
                "glass-light": "rgba(255, 255, 255, 0.7)", // Glass effect light
                "glass-dark": "rgba(26, 26, 46, 0.7)",     // Glass effect dark (matching new bg)

                // New System
                main: "var(--bg-main)",
                surface: "var(--bg-surface)",
                txtMain: "var(--text-main)",
                txtMuted: "var(--text-muted)",
                borderCol: "var(--border-col)",

                "text-main": "var(--text-main)",
                "text-secondary": "var(--text-muted)",
                "border-color": "var(--border-col)",
                "ink-blue": "#1a73e8",
                "ai-bubble": "#f3f4fd",
                "ai-bubble-light": "#f3f4fd",
                "ai-bubble-dark": "#232345",

                // Nebula Deep Space Theme
                void: "#0a0b14",      // Deepest Black/Blue
                "neon-pink": "#ee2b8c", // Electric Pink
                "neon-cyan": "#06b6d4", // Electric Cyan
            },
            fontFamily: {
                display: ['"Plus Jakarta Sans"', "Inter", "sans-serif"], // Glassmorphism font
                handwriting: ["Kalam", "cursive"],
            },
            boxShadow: {
                soft: "0 2px 8px rgba(0, 0, 0, 0.04)",
                float: "0 8px 32px rgba(0, 0, 0, 0.08)",
                menu: "0 12px 40px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -4px rgba(0, 0, 0, 0.08)",
                neon: "0 0 10px rgba(238, 43, 140, 0.5), 0 0 20px rgba(238, 43, 140, 0.3)", // Neon glow
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
