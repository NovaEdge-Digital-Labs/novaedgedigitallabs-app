import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, withAlpha } from '../../constants/colors';
import Text from './Text';

interface StatTileProps {
    label: string;
    value: string | number;
    icon?: keyof typeof Ionicons.glyphMap;
    tint?: string;
    style?: StyleProp<ViewStyle>;
}

/** Compact metric tile for profile/dashboard headers. */
const StatTile: React.FC<StatTileProps> = ({ label, value, icon, tint, style }) => {
    const color = tint ?? COLORS.accent;
    return (
        <View style={[styles.tile, COLORS.panelSubtle, style]}>
            {icon ? (
                <View style={[styles.iconBox, { backgroundColor: withAlpha(color, 0.13) }]}>
                    <Ionicons name={icon} size={15} color={color} />
                </View>
            ) : null}
            <Text variant="h3" numberOfLines={1}>{value}</Text>
            <Text variant="caption" tone="muted" numberOfLines={1} style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tile: {
        flex: 1,
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.md - 2,
        paddingHorizontal: SPACING.sm + 2,
        alignItems: 'center',
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    label: {
        marginTop: 2,
    },
});

export default StatTile;
