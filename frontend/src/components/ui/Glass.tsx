import React from 'react';
import { View, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { COLORS, RADIUS, withAlpha } from '../../constants/colors';

/**
 * True Liquid Glass is a UIKit feature: it exists only on iOS 26 and later.
 * Evaluated once at module load — the OS cannot change mid-session.
 */
export const LIQUID_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

export type GlassIntensity = 'clear' | 'regular' | 'thick';

interface GlassProps {
    children?: React.ReactNode;
    intensity?: GlassIntensity;
    /** Colour wash over the glass. Defaults to the theme's near-black violet. */
    tint?: string;
    radius?: number;
    /** Adds the specular top hairline that reads as a lit glass edge. */
    highlight?: boolean;
    style?: StyleProp<ViewStyle>;
}

const BLUR_AMOUNT: Record<GlassIntensity, number> = {
    clear: 18,
    regular: 34,
    thick: 55,
};

const TINT_ALPHA: Record<GlassIntensity, number> = {
    clear: 0.4,
    regular: 0.62,
    thick: 0.8,
};

/**
 * One surface, three renderings:
 *   iOS 26+        -> GlassView, the real thing (refraction + specular response)
 *   iOS < 26 / And -> BlurView backdrop + tint + lit edge
 *   web            -> BlurView compiles to backdrop-filter
 *
 * The fallback is deliberately close in value and edge treatment so a screen
 * doesn't restyle itself depending on which device opened it.
 */
const Glass: React.FC<GlassProps> = ({
    children,
    intensity = 'regular',
    tint,
    radius = RADIUS.lg,
    highlight = true,
    style,
}) => {
    const base = tint ?? COLORS.backgroundElevated ?? '#0a0014';

    if (LIQUID_GLASS) {
        return (
            <GlassView
                glassEffectStyle={intensity === 'thick' ? 'regular' : intensity === 'clear' ? 'clear' : 'regular'}
                tintColor={withAlpha(base, intensity === 'clear' ? 0.18 : 0.3)}
                colorScheme="dark"
                style={[{ borderRadius: radius, overflow: 'hidden' }, style]}
            >
                {children}
            </GlassView>
        );
    }

    return (
        <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
            <BlurView
                intensity={BLUR_AMOUNT[intensity]}
                tint="dark"
                style={StyleSheet.absoluteFill}
            />
            <View
                style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: withAlpha(base, TINT_ALPHA[intensity]) },
                ]}
            />
            {highlight ? (
                <>
                    {/* Lit top edge + darker outer ring: what sells depth without a real refraction pass. */}
                    <View
                        pointerEvents="none"
                        style={[
                            StyleSheet.absoluteFill,
                            styles.ring,
                            { borderRadius: radius, borderColor: withAlpha(COLORS.white, 0.12) },
                        ]}
                    />
                    <View
                        pointerEvents="none"
                        style={[styles.specular, { borderRadius: radius }]}
                    />
                </>
            ) : null}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    ring: {
        borderWidth: 1,
    },
    specular: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.22)',
    },
});

export default Glass;
