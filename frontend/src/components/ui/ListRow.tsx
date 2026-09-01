import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, withAlpha } from '../../constants/colors';
import Text from './Text';
import Badge from './Badge';

interface ListRowProps {
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    title: string;
    subtitle?: string;
    badge?: string;
    badgeTone?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
    onPress?: () => void;
    right?: React.ReactNode;
    showChevron?: boolean;
    style?: StyleProp<ViewStyle>;
}

/** Single settings/menu row. Replaces the hand-rolled rows in ProfileScreen. */
const ListRow: React.FC<ListRowProps> = ({
    icon,
    iconColor,
    title,
    subtitle,
    badge,
    badgeTone = 'primary',
    onPress,
    right,
    showChevron = true,
    style,
}) => {
    const tint = iconColor ?? COLORS.accent;

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
        >
            {icon ? (
                <View style={[styles.iconBox, { backgroundColor: withAlpha(tint, 0.12), borderColor: withAlpha(tint, 0.25) }]}>
                    <Ionicons name={icon} size={17} color={tint} />
                </View>
            ) : null}

            <View style={styles.textCol}>
                <Text variant="bodyStrong" numberOfLines={1}>{title}</Text>
                {subtitle ? (
                    <Text variant="caption" tone="muted" numberOfLines={1} style={styles.subtitle}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>

            {badge ? <Badge label={badge} tone={badgeTone} style={styles.badge} /> : null}
            {right}
            {onPress && showChevron && !right ? (
                <Ionicons name="chevron-forward" size={17} color={COLORS.textFaint ?? COLORS.textMuted} />
            ) : null}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.md,
    },
    pressed: {
        backgroundColor: withAlpha(COLORS.white, 0.04),
    },
    iconBox: {
        width: 34,
        height: 34,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginRight: SPACING.sm + 2,
    },
    textCol: {
        flex: 1,
    },
    subtitle: {
        marginTop: 2,
    },
    badge: {
        marginRight: SPACING.sm,
    },
});

export default ListRow;
