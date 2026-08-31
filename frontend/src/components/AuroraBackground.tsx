import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { COLORS, withAlpha } from '../constants/colors';

/**
 * The app background. Three layers, painted back to front:
 *
 *   1. a deep vertical wash from near-black violet to true black
 *   2. slow-drifting aurora blooms in the brand purple / magenta / cyan
 *   3. a faint vignette that pulls focus back to the centre
 *
 * Everything is pointerEvents="none" — a decorative layer that eats scroll
 * gestures is exactly the bug this app just had.
 */
const AuroraBackground: React.FC<{ animated?: boolean }> = ({ animated = true }) => {
    const { width, height } = useWindowDimensions();
    const drift = useSharedValue(0);

    useEffect(() => {
        if (!animated) return;
        drift.value = withRepeat(
            withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
            -1,
            true,
        );
    }, [animated, drift]);

    const blobA = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(drift.value, [0, 1], [-30, 30]) },
            { translateY: interpolate(drift.value, [0, 1], [0, 40]) },
            { scale: interpolate(drift.value, [0, 1], [1, 1.15]) },
        ],
    }));

    const blobB = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(drift.value, [0, 1], [25, -25]) },
            { translateY: interpolate(drift.value, [0, 1], [20, -20]) },
            { scale: interpolate(drift.value, [0, 1], [1.1, 0.95]) },
        ],
    }));

    const blobC = useAnimatedStyle(() => ({
        opacity: interpolate(drift.value, [0, 1], [0.35, 0.6]),
        transform: [{ translateY: interpolate(drift.value, [0, 1], [-20, 20]) }],
    }));

    const size = Math.max(width, height) * 0.95;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient
                colors={['#160029', '#0a0014', '#070010', '#000000']}
                locations={[0, 0.35, 0.7, 1]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <Animated.View
                style={[
                    styles.blob,
                    { width: size, height: size, borderRadius: size / 2, top: -size * 0.35, left: -size * 0.28 },
                    { backgroundColor: withAlpha(COLORS.primary, 0.28) },
                    blobA,
                ]}
            />
            <Animated.View
                style={[
                    styles.blob,
                    { width: size * 0.85, height: size * 0.85, borderRadius: size, bottom: -size * 0.3, right: -size * 0.25 },
                    { backgroundColor: withAlpha('#f6339a', 0.16) },
                    blobB,
                ]}
            />
            <Animated.View
                style={[
                    styles.blob,
                    { width: size * 0.7, height: size * 0.7, borderRadius: size, top: height * 0.32, right: -size * 0.3 },
                    { backgroundColor: withAlpha('#00b7d7', 0.12) },
                    blobC,
                ]}
            />

            {/* Vignette: darkens the edges so content keeps contrast over the blooms. */}
            <LinearGradient
                colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.75)']}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    blob: {
        position: 'absolute',
        // Large, very soft shapes; opacity does the diffusion since RN has no
        // real blur filter on plain Views across all three platforms.
        opacity: 0.6,
    },
});

export default AuroraBackground;
