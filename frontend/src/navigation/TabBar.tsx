import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, useDerivedValue } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, withAlpha } from '../constants/colors';
import Text from '../components/ui/Text';
import Glass from '../components/ui/Glass';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; idle: keyof typeof Ionicons.glyphMap }> = {
    Home: { active: 'home', idle: 'home-outline' },
    Jobs: { active: 'briefcase', idle: 'briefcase-outline' },
    Explore: { active: 'grid', idle: 'grid-outline' },
    Academy: { active: 'school', idle: 'school-outline' },
    Profile: { active: 'person-circle', idle: 'person-circle-outline' },
};

const TabItem: React.FC<{
    label: string;
    routeName: string;
    focused: boolean;
    onPress: () => void;
    onLongPress: () => void;
}> = ({ label, routeName, focused, onPress, onLongPress }) => {
    const target = useDerivedValue(() => (focused ? 1 : 0), [focused]);

    const pillStyle = useAnimatedStyle(() => ({
        opacity: withSpring(target.value, { damping: 18, stiffness: 220 }),
        transform: [{ scale: withSpring(0.85 + target.value * 0.15, { damping: 18, stiffness: 220 }) }],
    }));

    const icons = ICONS[routeName] ?? { active: 'ellipse', idle: 'ellipse-outline' };

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.item}
        >
            <View style={styles.iconWrap}>
                <Animated.View style={[styles.pill, pillStyle]} />
                <Ionicons
                    name={focused ? icons.active : icons.idle}
                    size={21}
                    color={focused ? COLORS.accent : COLORS.textMuted}
                />
            </View>
            <Text
                variant="caption"
                color={focused ? COLORS.accent : COLORS.textMuted}
                numberOfLines={1}
                style={[styles.label, focused && styles.labelActive]}
            >
                {label}
            </Text>
        </Pressable>
    );
};

/**
 * Floating translucent bar. Replaces the flat 60px bar that sat flush against
 * the screen edge and gave no indication of the active tab beyond tint.
 */
const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, SPACING.sm) }]} pointerEvents="box-none">
            <Glass intensity="thick" radius={RADIUS.lg} style={styles.bar}>
                <View style={styles.barInner}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];

                        // A custom tabBar receives every registered route, so
                        // `tabBarButton: () => null` has to be honoured here —
                        // the navigator's own hiding never runs.
                        if (options.tabBarButton) return null;

                        const label =
                            typeof options.tabBarLabel === 'string'
                                ? options.tabBarLabel
                                : options.title ?? route.name;
                        const focused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (!focused && !event.defaultPrevented) {
                                navigation.navigate(route.name as never);
                            }
                        };

                        const onLongPress = () => {
                            navigation.emit({ type: 'tabLongPress', target: route.key });
                        };

                        return (
                            <TabItem
                                key={route.key}
                                label={label}
                                routeName={route.name}
                                focused={focused}
                                onPress={onPress}
                                onLongPress={onLongPress}
                            />
                        );
                    })}
                </View>
            </Glass>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: SPACING.sm + 4,
    },
    bar: {
        // Glass draws its own edge and tint; the container only positions it.
        overflow: 'hidden',
    },
    barInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrap: {
        width: 46,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pill: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: RADIUS.pill,
        backgroundColor: withAlpha(COLORS.primary, 0.18),
        borderWidth: 1,
        borderColor: withAlpha(COLORS.primary, 0.35),
    },
    label: {
        marginTop: 3,
        fontSize: 10.5,
    },
    labelActive: {
        fontWeight: '700',
    },
});

export default TabBar;
