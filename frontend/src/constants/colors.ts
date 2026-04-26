import theme from './theme.json';

export const COLORS = {
    ...theme,
    // Backward compatibility mapping for older screens
    surface: theme.card,
    textPrimary: theme.text,
    textSecondary: theme.textLight,
    textMuted: theme.textMuted,
    textLight: theme.textLight,
    textWhite: theme.white,

    // Effect Helpers derived from JSON
    glass: {
        backgroundColor: `rgba(255, 255, 255, ${theme.effects.glassOpacity})`,
        borderWidth: 1,
        borderColor: `rgba(255, 255, 255, ${theme.effects.glassBorderOpacity})`,
    },
    // Utility for Linear Gradients
    getGradient: (gradientString: string): [string, string, ...string[]] => {
        const match = gradientString.match(/linear-gradient\([^,]+,\s*(#[a-fA-F0-9]+),\s*(#[a-fA-F0-9]+)\)/);
        if (match) return [match[1], match[2]];
        const radialMatch = gradientString.match(/radial-gradient\([^,]+,\s*(#[a-fA-F0-9]+),\s*(#[a-fA-F0-9]+)\)/);
        if (radialMatch) return [radialMatch[1], radialMatch[2]];
        return [theme.primary, theme.accent];
    },
    // Utility for glow effects using JSON defaults
    getGlow: (color = theme.glow, size = theme.effects.glowRadius, opacity = theme.effects.glowOpacity) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: opacity,
        shadowRadius: size,
        elevation: size,
    })
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

export const TYPOGRAPHY = {
    h1: { fontSize: 32, fontWeight: '800' },
    h2: { fontSize: 24, fontWeight: '700' },
    h3: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 14, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '400' },
};

export type AppTheme = typeof theme;

