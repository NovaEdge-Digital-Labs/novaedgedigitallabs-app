import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, RADIUS, withAlpha } from '../../constants/colors';
import Text from './Text';

type Tone = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
    label: string;
    tone?: Tone;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const toneBase = (tone: Tone): string => {
    switch (tone) {
        case 'success': return COLORS.success;
        case 'error': return COLORS.error;
        case 'warning': return COLORS.warning;
        case 'info': return COLORS.info;
        case 'neutral': return COLORS.textMuted;
        default: return COLORS.primary;
    }
};

/** `rounded-full` tinted pill — the site's tag/status treatment. */
const Badge: React.FC<BadgeProps> = ({ label, tone = 'primary', icon, style }) => {
    const base = toneBase(tone);
    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: withAlpha(base, 0.14), borderColor: withAlpha(base, 0.35) },
                style,
            ]}
        >
            {icon}
            <Text variant="caption" color={base} style={[styles.label, icon ? styles.labelWithIcon : null]}>
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.pill,
        borderWidth: 1,
    },
    label: {
        fontWeight: '600',
    },
    labelWithIcon: {
        marginLeft: 5,
    },
});

export default Badge;
