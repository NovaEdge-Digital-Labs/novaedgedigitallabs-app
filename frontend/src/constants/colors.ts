import theme from './theme.json';
import { useThemeStore } from '../store/themeStore';

// Dynamic Proxy so COLORS.primary, COLORS.background, etc. always return the active theme
export const COLORS: any = new Proxy({ ...theme }, {
    get(target: any, prop: string) {
        try {
            const storeTheme = useThemeStore.getState().theme;
            if (storeTheme && (storeTheme as any)[prop] !== undefined) {
                return (storeTheme as any)[prop];
            }
        } catch (e) {}

        if (prop === 'surface') return target.card;
        if (prop === 'textPrimary') return target.text;
        if (prop === 'textSecondary') return target.textLight;
        if (prop === 'textMuted') return target.textMuted;
        if (prop === 'textLight') return target.textLight;
        if (prop === 'textWhite') return target.white;

        if (prop === 'glass') {
            const currentTheme = useThemeStore.getState()?.theme || target;
            const opacity = currentTheme.effects?.glassOpacity ?? target.effects?.glassOpacity ?? 0.04;
            const borderOpacity = currentTheme.effects?.glassBorderOpacity ?? target.effects?.glassBorderOpacity ?? 0.15;
            return {
                backgroundColor: `rgba(255, 255, 255, ${opacity})`,
                borderWidth: 1,
                borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
            };
        }

        if (prop === 'getGradient') {
            return (gradientString: string): [string, string, ...string[]] => {
                return useThemeStore.getState().getGradient(gradientString);
            };
        }

        if (prop === 'getGlow') {
            return (color?: string, size?: number, opacity?: number) => {
                return useThemeStore.getState().getGlow(color, size, opacity);
            };
        }

        return target[prop];
    }
});

export const SPACING = {
    xs: theme.geometry.spacingSmall / 2,
    sm: theme.geometry.spacingSmall,
    md: theme.geometry.spacingMedium,
    lg: theme.geometry.spacingLarge,
    xl: theme.geometry.spacingLarge * 1.5,
    xxl: theme.geometry.spacingLarge * 2,
};

export const SHADOWS = {
    small: {
        shadowColor: theme.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: theme.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: theme.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

export const TYPOGRAPHY = {
    h1: { fontSize: 32, fontWeight: '800' as const },
    h2: { fontSize: 24, fontWeight: '700' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 14, fontWeight: '400' as const },
    caption: { fontSize: 12, fontWeight: '400' as const },
};

export type AppTheme = typeof theme;
