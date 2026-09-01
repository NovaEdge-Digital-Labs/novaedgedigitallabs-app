import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, withAlpha } from '../../constants/colors';
import Text from './Text';
import Button from './Button';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: StyleProp<ViewStyle>;
}

/**
 * Every list previously rendered a bare "No data" string. A named next action
 * here is what turns a dead end into a route forward.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'sparkles-outline',
    title,
    message,
    actionLabel,
    onAction,
    style,
}) => (
    <View style={[styles.container, style]}>
        <View style={styles.iconRing}>
            <Ionicons name={icon} size={26} color={COLORS.accent} />
        </View>
        <Text variant="h3" center style={styles.title}>{title}</Text>
        {message ? (
            <Text variant="body" tone="muted" center style={styles.message}>{message}</Text>
        ) : null}
        {actionLabel && onAction ? (
            <Button title={actionLabel} onPress={onAction} size="sm" fullWidth={false} style={styles.action} />
        ) : null}
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl,
        paddingHorizontal: SPACING.lg,
    },
    iconRing: {
        width: 64,
        height: 64,
        borderRadius: RADIUS.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(COLORS.primary, 0.12),
        borderWidth: 1,
        borderColor: withAlpha(COLORS.primary, 0.3),
        marginBottom: SPACING.md,
    },
    title: {
        marginBottom: 6,
    },
    message: {
        maxWidth: 300,
    },
    action: {
        marginTop: SPACING.lg,
    },
});

export default EmptyState;
