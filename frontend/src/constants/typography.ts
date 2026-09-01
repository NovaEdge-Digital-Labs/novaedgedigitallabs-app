import { Platform, TextStyle } from 'react-native';

/**
 * Inter carries the whole interface. This app is mostly dense, read-for-a-while
 * content — job listings, applications, course lists, admin tables — where a
 * loud display face fights the content instead of serving it.
 *
 * Outfit survives in exactly one place: the NovaEdge wordmark, where a brand
 * face earns its keep.
 */
export const FONTS = {
    brand: 'Outfit_700Bold',
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,

    // Back-compat aliases for screens still referencing the old display names.
    display: 'Inter_700Bold',
    displayBold: 'Inter_700Bold',
    displaySemi: 'Inter_600SemiBold',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    bodySemi: 'Inter_600SemiBold',
    bodyBold: 'Inter_700Bold',
};

const stack = (family: string) =>
    Platform.OS === 'web' ? `${family}, system-ui, -apple-system, sans-serif` : family;

type Variant = TextStyle;

/**
 * Sizes are deliberately restrained. The previous scale topped out at 40px,
 * which turned every screen header into a marketing poster and pushed the
 * actual content below the fold.
 */
export const TYPOGRAPHY: Record<string, Variant> = {
    display: {
        fontFamily: stack(FONTS.bold),
        fontSize: 26,
        lineHeight: 32,
        letterSpacing: -0.5,
    },
    h1: {
        fontFamily: stack(FONTS.bold),
        fontSize: 22,
        lineHeight: 28,
        letterSpacing: -0.4,
    },
    h2: {
        fontFamily: stack(FONTS.semibold),
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: -0.3,
    },
    h3: {
        fontFamily: stack(FONTS.semibold),
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: -0.1,
    },
    /** Quiet section label. Far less tracking than the old poster-style kicker. */
    eyebrow: {
        fontFamily: stack(FONTS.semibold),
        fontSize: 11,
        lineHeight: 14,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    bodyLarge: {
        fontFamily: stack(FONTS.regular),
        fontSize: 15,
        lineHeight: 22,
    },
    body: {
        fontFamily: stack(FONTS.regular),
        fontSize: 14,
        lineHeight: 20,
    },
    bodyStrong: {
        fontFamily: stack(FONTS.semibold),
        fontSize: 14,
        lineHeight: 20,
    },
    label: {
        fontFamily: stack(FONTS.medium),
        fontSize: 13,
        lineHeight: 18,
    },
    caption: {
        fontFamily: stack(FONTS.regular),
        fontSize: 12,
        lineHeight: 16,
    },
    button: {
        fontFamily: stack(FONTS.semibold),
        fontSize: 14,
        lineHeight: 18,
        letterSpacing: 0,
    },
    /** NovaEdge wordmark only. */
    wordmark: {
        fontFamily: stack(FONTS.brand),
        fontSize: 19,
        lineHeight: 24,
        letterSpacing: -0.3,
    },
};

export default TYPOGRAPHY;
