import theme from './theme.json';
import { useThemeStore } from '../store/themeStore';
import { TYPOGRAPHY as TYPE_SCALE, FONTS } from './typography';

/** Turn a #rrggbb (or #rgb) token into an rgba() string at the given alpha. */
export const withAlpha = (color: string, alpha: number): string => {
    if (!color || typeof color !== 'string') return `rgba(255,255,255,${alpha})`;
    if (color.startsWith('rgba')) return color.replace(/[\d.]+\)$/, `${alpha})`);
    if (color.startsWith('rgb(')) return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    if (!color.startsWith('#')) return color;

    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length !== 6) return color;

    const num = parseInt(hex, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
};

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

        /**
         * Legacy token used by screens not yet migrated to <Card>/<Glass>.
         * Retuned to sit at the same value and edge treatment as the real
         * glass surface, so mixed screens don't read as two design systems.
         */
        if (prop === 'glass') {
            const currentTheme = useThemeStore.getState()?.theme || target;
            const elevated = currentTheme.backgroundElevated ?? target.backgroundElevated ?? '#0a0014';
            return {
                backgroundColor: withAlpha(elevated, 0.62),
                borderWidth: 1,
                borderColor: withAlpha('#ffffff', 0.12),
            };
        }

        /**
         * The site's signature card: near-black gray-900/50 fill with a faint
         * purple-500/20 hairline. Used everywhere in place of ad-hoc glass.
         */
        if (prop === 'panel') {
            const currentTheme = useThemeStore.getState()?.theme || target;
            return {
                backgroundColor: currentTheme.card ?? target.card,
                borderWidth: 1,
                borderColor: currentTheme.border ?? target.border,
            };
        }

        if (prop === 'panelSubtle') {
            const currentTheme = useThemeStore.getState()?.theme || target;
            return {
                backgroundColor: currentTheme.card ?? target.card,
                borderWidth: 1,
                borderColor: currentTheme.borderSubtle ?? target.borderSubtle,
            };
        }

        if (prop === 'withAlpha') return withAlpha;

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

export const RADIUS = {
    sm: theme.geometry.radiusSmall,
    md: theme.geometry.radiusMedium,
    lg: theme.geometry.radiusLarge,
    pill: theme.geometry.radiusPill,
};

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
    /** Purple bloom used behind primary CTAs and active tab pills. */
    glow: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
    },
};

export { FONTS };
export const TYPOGRAPHY = TYPE_SCALE;

export type AppTheme = typeof theme;
