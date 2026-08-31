import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING } from '../../constants/colors';
import Glass from './Glass';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    /**
     * `glass`  - Liquid Glass surface (native on iOS 26+, blur elsewhere)
     * `default`/`subtle` - flat tinted panel with a purple / white hairline
     */
    variant?: 'glass' | 'default' | 'subtle' | 'plain';
    padded?: boolean;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
}

/**
 * Flat elevated surface with a hairline border — depth comes from the fill
 * being lighter than the page, not from blur or glow. `glass` remains
 * available for the few places a translucent surface genuinely helps.
 */
const Card: React.FC<CardProps> = ({
    children,
    onPress,
    variant = 'default',
    padded = true,
    style,
    disabled,
}) => {
    const scale = useSharedValue(1);
    const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const frame = [
        styles.card,
        variant === 'default' && COLORS.panel,
        variant === 'subtle' && COLORS.panelSubtle,
        variant !== 'glass' && padded && styles.padded,
        disabled && styles.disabled,
        style,
    ];

    // Glass needs the blur layers behind the content, so padding moves inward.
    const body =
        variant === 'glass' ? (
            <Glass radius={RADIUS.lg} style={StyleSheet.absoluteFill} />
        ) : null;

    const content =
        variant === 'glass' ? (
            <View style={padded ? styles.padded : undefined}>{children}</View>
        ) : (
            children
        );

    if (!onPress) {
        return (
            <View style={frame}>
                {body}
                {content}
            </View>
        );
    }

    return (
        <Animated.View style={animated}>
            <Pressable
                onPress={onPress}
                disabled={disabled}
                onPressIn={() => { scale.value = withSpring(0.975, { damping: 18, stiffness: 260 }); }}
                onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 260 }); }}
                style={frame}
            >
                {body}
                {content}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    padded: {
        padding: SPACING.md,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default Card;
