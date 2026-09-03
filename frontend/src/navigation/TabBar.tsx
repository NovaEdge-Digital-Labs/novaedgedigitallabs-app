import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/colors';
import Text from '../components/ui/Text';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; idle: keyof typeof Ionicons.glyphMap }> = {
    Home: { active: 'home', idle: 'home-outline' },
    Jobs: { active: 'briefcase', idle: 'briefcase-outline' },
    Explore: { active: 'grid', idle: 'grid-outline' },
    Academy: { active: 'school', idle: 'school-outline' },
    Profile: { active: 'person', idle: 'person-outline' },
};

/**
 * Docked, opaque, hairline-topped. The previous bar floated as a rounded
 * translucent slab, which read as a detached widget rather than app chrome —
 * and its blur had nothing behind it, so it just looked like a grey box.
 *
 * Active state is carried by icon fill and colour, not a pill behind the icon.
 */
const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];

                // A custom tabBar receives every registered route, so
                // `tabBarButton: () => null` has to be honoured here.
                if (options.tabBarButton) return null;

                const label =
                    typeof options.tabBarLabel === 'string'
                        ? options.tabBarLabel
                        : options.title ?? route.name;
                const focused = state.index === index;
                const icons = ICONS[route.name] ?? { active: 'ellipse', idle: 'ellipse-outline' };

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });
                    if (!event.defaultPrevented) {
                        navigation.navigate(route.name as never);
                    }
                };

                return (
                    <Pressable
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={focused ? { selected: true } : {}}
                        accessibilityLabel={label}
                        onPress={onPress}
                        onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                        style={styles.item}
                    >
                        <Ionicons
                            name={focused ? icons.active : icons.idle}
                            size={22}
                            color={focused ? COLORS.text : COLORS.textFaint}
                        />
                        <Text
                            variant="caption"
                            color={focused ? COLORS.text : COLORS.textFaint}
                            numberOfLines={1}
                            style={[styles.label, focused && styles.labelActive]}
                        >
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.backgroundElevated,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm + 2,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        marginTop: 4,
        fontSize: 11,
    },
    labelActive: {
        fontWeight: '600',
    },
});

export default TabBar;
