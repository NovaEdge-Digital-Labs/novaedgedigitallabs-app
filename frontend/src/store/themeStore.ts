import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api/axiosInstance';
import defaultTheme from '../constants/theme.json';

const THEME_CACHE_KEY = '@app_remote_theme';

export interface ThemeColors {
    preset?: string;
    primary: string;
    primaryDark: string;
    primaryDeep?: string;
    secondary: string;
    background: string;
    backgroundElevated?: string;
    backgroundSoft: string;
    card: string;
    cardHover: string;
    text: string;
    textLight: string;
    textMuted: string;
    textFaint?: string;
    border: string;
    borderSubtle?: string;
    divider: string;
    accent: string;
    glow: string;
    primaryGradient: string;
    accentGradient?: string;
    backgroundGradient: string;
    overlay: string;
    success: string;
    successSoft?: string;
    error: string;
    errorSoft?: string;
    warning: string;
    warningSoft?: string;
    info: string;
    infoSoft?: string;
    pink?: string;
    cyan?: string;
    white: string;
    black: string;
    effects?: any;
    geometry?: any;
}

interface ThemeState {
    theme: ThemeColors;
    isLoading: boolean;
    fetchTheme: () => Promise<void>;
    setTheme: (newTheme: Partial<ThemeColors>) => void;
    getGradient: (gradientString: string) => [string, string, ...string[]];
    getGlow: (color?: string, size?: number, opacity?: number) => any;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: defaultTheme as ThemeColors,
    isLoading: false,

    fetchTheme: async () => {
        set({ isLoading: true });
        try {
            // Load local theme.json as default base
            const currentBase = defaultTheme as ThemeColors;

            // Fetch remote theme from backend API
            const response = await axiosInstance.get('/theme');
            if (response.data && response.data.success && response.data.theme) {
                const remoteTheme = { ...currentBase, ...response.data.theme };
                set({ theme: remoteTheme });
                await AsyncStorage.setItem(THEME_CACHE_KEY, JSON.stringify(remoteTheme));
            } else {
                set({ theme: currentBase });
            }
        } catch (error) {
            // Fallback to local theme.json if offline or error
            set({ theme: defaultTheme as ThemeColors });
        } finally {
            set({ isLoading: false });
        }
    },

    setTheme: (newTheme) => {
        const updated = { ...get().theme, ...newTheme };
        set({ theme: updated });
        AsyncStorage.setItem(THEME_CACHE_KEY, JSON.stringify(updated)).catch(() => {});
    },

    getGradient: (gradientString: string): [string, string, ...string[]] => {
        const fallbackTheme = get().theme || defaultTheme;
        if (!gradientString) return [fallbackTheme.primary, fallbackTheme.accent];

        // Robust regex matching all hex (#fff, #ffffff, #ffffff00) and rgb/rgba color values
        const colors = gradientString.match(/(#(?:[a-fA-F0-9]{3,8})|rgba?\([^)]+\))/g);
        if (colors && colors.length >= 2) {
            return [colors[0], colors[1], ...colors.slice(2)];
        }
        return [fallbackTheme.primary, fallbackTheme.accent];
    },

    /**
     * Kept for the many screens that still call it, but no longer emits a
     * coloured bloom. The theme gets depth from surface elevation, so this
     * resolves to a restrained neutral drop shadow regardless of the colour
     * a caller asks for.
     */
    getGlow: (_color, size = 10, opacity = 0.4) => {
        return {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: Math.min(opacity, 0.25),
            shadowRadius: Math.min(size, 8),
            elevation: Math.min(size, 4),
        };
    }
}));
