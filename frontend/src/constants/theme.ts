import theme from './theme.json';

export const COLORS = {
    ...theme,
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
};

export const TYPOGRAPHY = {
    h1: {
        fontSize: 32,
        fontWeight: '800' as const,
    },
    h2: {
        fontSize: 24,
        fontWeight: '700' as const,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 14,
        fontWeight: '400' as const,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
    },
};

export default {
    ...theme,
    COLORS,
    SPACING,
    SHADOWS,
    TYPOGRAPHY,
};
