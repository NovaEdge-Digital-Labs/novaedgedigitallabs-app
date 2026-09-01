import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/colors';
import Text from './Text';

interface SectionHeaderProps {
    /** Small uppercase, letter-spaced kicker above the title. */
    eyebrow?: string;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: StyleProp<ViewStyle>;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    eyebrow,
    title,
    subtitle,
    actionLabel,
    onAction,
    style,
}) => (
    <View style={[styles.container, style]}>
        <View style={styles.textCol}>
            {eyebrow ? (
                <Text variant="eyebrow" tone="accent" style={styles.eyebrow}>
                    {eyebrow}
                </Text>
            ) : null}
            <Text variant="h2">{title}</Text>
            {subtitle ? (
                <Text variant="body" tone="muted" style={styles.subtitle}>
                    {subtitle}
                </Text>
            ) : null}
        </View>

        {actionLabel && onAction ? (
            <Pressable onPress={onAction} hitSlop={10} style={styles.action}>
                <Text variant="label" tone="accent">{actionLabel}</Text>
                <Ionicons name="chevron-forward" size={15} color={COLORS.accent} />
            </Pressable>
        ) : null}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    textCol: {
        flex: 1,
        paddingRight: SPACING.sm,
    },
    eyebrow: {
        marginBottom: 6,
    },
    subtitle: {
        marginTop: 4,
    },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 2,
    },
});

export default SectionHeader;
