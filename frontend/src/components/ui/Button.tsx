import React from 'react';
import {
    Pressable,
    ActivityIndicator,
    StyleSheet,
    View,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, RADIUS, SHADOWS, withAlpha } from '../../constants/colors';
import Text from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    disabled?: boolean;
    /** Rendered to the left of the label; pass a sized icon element. */
    icon?: React.ReactNode;
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

const HEIGHTS: Record<Size, number> = { sm: 38, md: 46, lg: 54 };

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    fullWidth = true,
    style,
    textStyle,
}) => {
    const scale = useSharedValue(1);
    const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const inert = disabled || loading;

    const labelColor =
        variant === 'primary' || variant === 'danger'
            ? COLORS.white
            : variant === 'secondary'
                ? COLORS.text
                : COLORS.accent;

    const body = loading ? (
        <ActivityIndicator color={labelColor} size="small" />
    ) : (
        <View style={styles.row}>
            {icon}
            <Text variant="button" color={labelColor} style={[icon ? styles.labelWithIcon : null, textStyle]}>
                {title}
            </Text>
        </View>
    );

    const frame: StyleProp<ViewStyle> = [
        styles.base,
        { height: HEIGHTS[size] },
        fullWidth && styles.fullWidth,
        inert && styles.disabled,
        style,
    ];

    return (
        <Animated.View style={[animated, fullWidth && styles.fullWidth]}>
            <Pressable
                onPress={onPress}
                disabled={inert}
                onPressIn={() => { if (!inert) scale.value = withSpring(0.96, { damping: 16, stiffness: 260 }); }}
                onPressOut={() => { if (!inert) scale.value = withSpring(1, { damping: 16, stiffness: 260 }); }}
                style={frame.concat([variantStyle(variant)])}
            >
                {body}
            </Pressable>
        </Animated.View>
    );
};

const variantStyle = (variant: Variant): ViewStyle => {
    switch (variant) {
        case 'primary':
            return { backgroundColor: COLORS.primary };
        case 'secondary':
            return { backgroundColor: withAlpha(COLORS.white, 0.06), borderWidth: 1, borderColor: COLORS.borderSubtle };
        case 'ghost':
            return { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border };
        case 'danger':
            return { backgroundColor: COLORS.error };
        default:
            return {};
    }
};

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: RADIUS.pill,
    },
    base: {
        borderRadius: RADIUS.pill,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 22,
    },
    fullWidth: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    labelWithIcon: {
        marginLeft: 8,
    },
    disabled: {
        opacity: 0.45,
    },
});

export default Button;
