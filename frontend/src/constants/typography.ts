import { Platform, TextStyle } from 'react-native';

/**
 * Type system mirrored from novaedgedigitallabs.tech:
 *   - Outfit  -> display / headings (font-black, font-bold)
 *   - Inter   -> body, labels, UI chrome
 */
export const FONTS = {
    display: 'Outfit_800ExtraBold',
    displayBold: 'Outfit_700Bold',
    displaySemi: 'Outfit_600SemiBold',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    bodySemi: 'Inter_600SemiBold',
    bodyBold: 'Inter_700Bold',
    mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
};

/**
 * The web build renders before fonts resolve, so every style keeps a system
 * fallback stack rather than relying on the custom family alone.
 */
const stack = (family: string) =>
    Platform.OS === 'web' ? `${family}, system-ui, -apple-system, sans-serif` : family;

type Variant = TextStyle;

export const TYPOGRAPHY: Record<string, Variant> = {
    /** Hero numerals and screen-opening statements. */
    display: {
        fontFamily: stack(FONTS.display),
        fontSize: 34,
        lineHeight: 40,
        letterSpacing: -0.8,
    },
    h1: {
        fontFamily: stack(FONTS.display),
        fontSize: 28,
        lineHeight: 34,
        letterSpacing: -0.6,
    },
    h2: {
        fontFamily: stack(FONTS.displayBold),
        fontSize: 22,
        lineHeight: 28,
        letterSpacing: -0.4,
    },
    h3: {
        fontFamily: stack(FONTS.displaySemi),
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: -0.2,
    },
    /** `uppercase tracking-widest text-xs` section labels from the site. */
    eyebrow: {
        fontFamily: stack(FONTS.bodySemi),
        fontSize: 11,
        lineHeight: 14,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
    },
    bodyLarge: {
        fontFamily: stack(FONTS.body),
        fontSize: 16,
        lineHeight: 24,
    },
    body: {
        fontFamily: stack(FONTS.body),
        fontSize: 14,
        lineHeight: 21,
    },
    bodyStrong: {
        fontFamily: stack(FONTS.bodySemi),
        fontSize: 14,
        lineHeight: 21,
    },
    label: {
        fontFamily: stack(FONTS.bodyMedium),
        fontSize: 13,
        lineHeight: 18,
    },
    caption: {
        fontFamily: stack(FONTS.body),
        fontSize: 12,
        lineHeight: 16,
    },
    button: {
        fontFamily: stack(FONTS.bodySemi),
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: 0.2,
    },
};

export default TYPOGRAPHY;
