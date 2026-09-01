import React, { useState } from 'react';
import {
    View,
    TextInput,
    TextInputProps,
    Pressable,
    Platform,
    StyleSheet,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, withAlpha } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import Text from './Text';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    /** Renders a show/hide toggle and manages secureTextEntry internally. */
    password?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    hint,
    icon,
    password,
    containerStyle,
    style,
    ...rest
}) => {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(true);

    const borderColor = error
        ? COLORS.error
        : focused
            ? COLORS.primary
            : COLORS.borderSubtle;

    return (
        <View style={[styles.container, containerStyle]}>
            {label ? (
                <Text variant="label" tone="secondary" style={styles.label}>{label}</Text>
            ) : null}

            <View style={[styles.field, { borderColor }, focused && styles.fieldFocused]}>
                {icon ? (
                    <Ionicons
                        name={icon}
                        size={18}
                        color={focused ? COLORS.accent : COLORS.textMuted}
                        style={styles.icon}
                    />
                ) : null}

                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={COLORS.textFaint ?? COLORS.textMuted}
                    secureTextEntry={password ? hidden : rest.secureTextEntry}
                    onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
                    {...rest}
                />

                {password ? (
                    <Pressable onPress={() => setHidden((v) => !v)} hitSlop={10} style={styles.trailing}>
                        <Ionicons
                            name={hidden ? 'eye-outline' : 'eye-off-outline'}
                            size={18}
                            color={COLORS.textMuted}
                        />
                    </Pressable>
                ) : null}
            </View>

            {error ? (
                <Text variant="caption" tone="error" style={styles.helper}>{error}</Text>
            ) : hint ? (
                <Text variant="caption" tone="muted" style={styles.helper}>{hint}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        marginBottom: 7,
    },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 50,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        backgroundColor: withAlpha(COLORS.white, 0.05),
        paddingHorizontal: SPACING.md - 2,
    },
    fieldFocused: {
        backgroundColor: withAlpha(COLORS.primary, 0.07),
    },
    icon: {
        marginRight: SPACING.sm + 2,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        paddingVertical: 12,
        ...TYPOGRAPHY.body,
        // RN Web renders a TextInput as an <input>, which draws the browser's
        // default blue focus ring on top of our own focus border.
        ...Platform.select({ web: { outlineStyle: 'none', outlineWidth: 0 } as any, default: {} }),
    },
    trailing: {
        marginLeft: SPACING.sm,
    },
    helper: {
        marginTop: 6,
    },
});

export default Input;
