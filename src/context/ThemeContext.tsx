import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeName = 'lime' | 'purple' | 'green' | 'pink' | 'blue';

interface ThemeMeta { accent: string; accentRgb: string; accentText: string; label: string; }

export const THEME_META: Record<ThemeName, ThemeMeta> = {
    lime: { accent: '#CCFF00', accentRgb: '204,255,0', accentText: '#000000', label: 'Lime' },
    purple: { accent: '#A78BFA', accentRgb: '167,139,250', accentText: '#000000', label: 'Purple' },
    green: { accent: '#4ADE80', accentRgb: '74,222,128', accentText: '#000000', label: 'Green' },
    pink: { accent: '#F472B6', accentRgb: '244,114,182', accentText: '#000000', label: 'Pink' },
    blue: { accent: '#60A5FA', accentRgb: '96,165,250', accentText: '#000000', label: 'Blue' },
};

interface ThemeContextValue {
    theme: ThemeName;
    setTheme: (t: ThemeName) => void;
    meta: ThemeMeta;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'lime',
    setTheme: () => { },
    meta: THEME_META.lime,
});

function applyTheme(name: ThemeName) {
    const { accent, accentRgb, accentText } = THEME_META[name];
    const root = document.documentElement;
    // Keep data-theme for CSS [data-theme] selectors
    root.setAttribute('data-theme', name);
    // Also set vars explicitly for JS-created inline styles that need them
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-rgb', accentRgb);
    root.style.setProperty('--accent-text', accentText);
    root.style.setProperty('--accent-glow', `rgba(${accentRgb},0.18)`);
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const stored = (localStorage.getItem('liyan-theme') as ThemeName | null) ?? 'lime';
    const [theme, setThemeState] = useState<ThemeName>(stored);

    const setTheme = (t: ThemeName) => {
        setThemeState(t);
        localStorage.setItem('liyan-theme', t);
        applyTheme(t);
    };

    useEffect(() => { applyTheme(theme); }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, meta: THEME_META[theme] }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
