import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, withAlpha } from '../../constants/colors';
import Text from './Text';

interface TopBarProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    right?: React.ReactNode;
    /** Stacks a large display title under the controls, magazine-style. */
    large?: boolean;
}

/**
 * Replaces the old fixed-height Header. Back affordance is a tappable circular
 * target rather than a bare chevron — the previous bar had no back control at
 * all, which is a large part of why deep stacks felt like dead ends.
 */
const TopBar: React.FC<TopBarProps> = ({ title, subtitle, showBack, onBack, right, large }) => {
    const navigation = useNavigation<any>();
    const canGoBack = showBack ?? navigation.canGoBack();

    const handleBack = () => {
        if (onBack) return onBack();
        if (navigation.canGoBack()) navigation.goBack();
    };

    if (large) {
        return (
            <View style={styles.largeBar}>
                <View style={styles.largeTop}>
                    {canGoBack ? (
                        <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
                        </Pressable>
                    ) : <View />}
                    {right}
                </View>
                <Text variant="display" style={styles.largeTitle}>{title}</Text>
                {subtitle ? (
                    <Text variant="bodyLarge" tone="muted" style={styles.largeSubtitle}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>
        );
    }

    return (
        <View style={styles.bar}>
            {canGoBack ? (
                <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={20} color={COLORS.text} />
                </Pressable>
            ) : null}

            <View style={styles.titleCol}>
                <Text variant="h2" numberOfLines={1}>{title}</Text>
                {subtitle ? (
                    <Text variant="caption" tone="muted" numberOfLines={1} style={styles.subtitle}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>

            {right ? <View style={styles.right}>{right}</View> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(COLORS.white, 0.06),
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
        marginRight: SPACING.sm,
    },
    titleCol: {
        flex: 1,
    },
    subtitle: {
        marginTop: 2,
    },
    right: {
        marginLeft: SPACING.sm,
    },
    largeBar: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
    },
    largeTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 36,
        marginBottom: SPACING.md,
    },
    largeTitle: {
        marginBottom: 2,
    },
    largeSubtitle: {
        maxWidth: 320,
    },
});

export default TopBar;
