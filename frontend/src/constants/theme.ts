import { COLORS as APP_COLORS } from './colors';
import theme from './theme.json';

export const COLORS = APP_COLORS;

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
    h1: {
        fontSize: 32,
        fontWeight: '800',
    },
    h2: {
        fontSize: 24,
        fontWeight: '700',
    },
    h3: {
        fontSize: 18,
        fontWeight: '600',
    },
    body: {
        fontSize: 14,
        fontWeight: '400',
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
    },
};

export default {
    COLORS,
    SPACING,
    SHADOWS,
    TYPOGRAPHY,
};
