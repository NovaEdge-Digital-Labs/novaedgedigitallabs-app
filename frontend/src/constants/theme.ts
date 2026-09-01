/**
 * Compatibility shim. This module used to hold a second, static copy of the
 * design tokens, which drifted from `constants/colors.ts`. Everything now
 * re-exports the single proxied source so both import paths stay in sync.
 */
import theme from './theme.json';
import { COLORS, SPACING, SHADOWS, RADIUS, TYPOGRAPHY, FONTS, withAlpha } from './colors';

export { COLORS, SPACING, SHADOWS, RADIUS, TYPOGRAPHY, FONTS, withAlpha };

export default {
    ...theme,
    COLORS,
    SPACING,
    SHADOWS,
    RADIUS,
    TYPOGRAPHY,
    FONTS,
};
