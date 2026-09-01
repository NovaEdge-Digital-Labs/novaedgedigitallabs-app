import React, { useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle, DimensionValue, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, withAlpha } from '../../constants/colors';

interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    radius?: number;
    style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 14, radius = RADIUS.sm, style }) => {
    const opacity = useSharedValue(0.35);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.85, { duration: 850, easing: Easing.inOut(Easing.quad) }),
            -1,
            true,
        );
    }, [opacity]);

    const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View
            style={[
                { width, height, borderRadius: radius, backgroundColor: withAlpha(COLORS.white, 0.08) },
                animated,
                style,
            ]}
        />
    );
};

/** Placeholder matching the Card silhouette, for list loading states. */
export const SkeletonCard: React.FC<{ lines?: number; style?: StyleProp<ViewStyle> }> = ({ lines = 3, style }) => (
    <View style={[styles.card, COLORS.panelSubtle, style]}>
        <Skeleton width="55%" height={18} />
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                width={i === lines - 1 ? '70%' : '100%'}
                height={11}
                style={styles.line}
            />
        ))}
    </View>
);

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm + 4,
    },
    line: {
        marginTop: SPACING.sm + 2,
    },
});

export default Skeleton;
