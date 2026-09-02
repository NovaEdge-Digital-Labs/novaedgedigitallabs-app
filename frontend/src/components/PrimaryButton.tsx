import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp, Pressable } from 'react-native';
import { COLORS } from '../constants/colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    icon?: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    style,
    containerStyle,
    textStyle,
    icon
}) => {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });

    const handlePressIn = () => {
        if (!disabled && !loading) {
            scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
        }
    };

    const handlePressOut = () => {
        if (!disabled && !loading) {
            scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        }
    };

    return (
        <Animated.View style={[animatedStyle, containerStyle]}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    (disabled || loading) && styles.disabled,
                    style
                ]}
                onPress={onPress}
                disabled={disabled || loading}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <>
                        {icon}
                        <Text style={[styles.text, textStyle]}>{title}</Text>
                    </>
                )}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: COLORS.primary,
        height: 50,
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    text: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default PrimaryButton;
