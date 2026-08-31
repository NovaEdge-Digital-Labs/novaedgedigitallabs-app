import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ThemeWrapper from '../components/ThemeWrapper';
import { Screen, Text, SectionHeader } from '../components/ui';
import { COLORS, SPACING, RADIUS, withAlpha } from '../constants/colors';
import { useAuthStore } from '../store/authStore';

type Destination = {
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    tint: string;
    /** Tab to switch to, or a route inside the Explore stack. */
    tab?: string;
    route?: string;
    adminOnly?: boolean;
};

type Group = {
    eyebrow: string;
    title: string;
    items: Destination[];
};

/**
 * Explore replaces the old pattern where Tools, Store and Services were
 * reachable only by scrolling a 20-item list inside Profile. Grouping by
 * intent — earn / build / shop — keeps every product area two taps deep.
 */
const GROUPS: Group[] = [
    {
        eyebrow: 'Earn',
        title: 'Find work',
        items: [
            {
                label: 'Marketplace',
                description: 'Browse gigs and post projects',
                icon: 'people',
                tint: '#ac4bff',
                tab: 'Marketplace',
            },
            {
                label: 'Jobs',
                description: 'Openings, applications and saved roles',
                icon: 'briefcase',
                tint: '#3080ff',
                tab: 'Jobs',
            },
        ],
    },
    {
        eyebrow: 'Build',
        title: 'Ship faster',
        items: [
            {
                label: 'Tools',
                description: 'QR, JWT, JSON, EMI and more',
                icon: 'construct',
                tint: '#00bb7f',
                route: 'Tools',
            },
            {
                label: 'Workspace',
                description: 'Your projects and deliverables',
                icon: 'folder-open',
                tint: '#00b7d7',
                route: 'MyWorkspace',
            },
            {
                label: 'API Dashboard',
                description: 'Keys, usage and quotas',
                icon: 'code-slash',
                tint: '#c07eff',
                route: 'ApiDashboard',
            },
        ],
    },
    {
        eyebrow: 'Shop',
        title: 'Products & services',
        items: [
            {
                label: 'Store',
                description: 'Templates, kits and digital products',
                icon: 'bag-handle',
                tint: '#f6339a',
                route: 'Store',
            },
            {
                label: 'Services',
                description: 'Hire the studio for custom work',
                icon: 'sparkles',
                tint: '#f99c00',
                route: 'Services',
            },
            {
                label: 'Academy',
                description: 'Courses and lectures',
                icon: 'school',
                tint: '#5ee9b5',
                tab: 'Academy',
            },
        ],
    },
    {
        eyebrow: 'Admin',
        title: 'Operations',
        items: [
            {
                label: 'Admin Dashboard',
                description: 'Platform stats and controls',
                icon: 'speedometer',
                tint: '#ff6568',
                route: 'AdminDashboard',
                adminOnly: true,
            },
            {
                label: 'Manage Users',
                description: 'Roles, plans and access',
                icon: 'shield-checkmark',
                tint: '#fcbb00',
                route: 'AdminUsers',
                adminOnly: true,
            },
        ],
    },
];

const ExploreScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'admin';

    const go = (item: Destination) => {
        if (item.tab) {
            navigation.navigate(item.tab);
        } else if (item.route) {
            navigation.navigate(item.route);
        }
    };

    const groups = GROUPS
        .map((g) => ({ ...g, items: g.items.filter((i) => !i.adminOnly || isAdmin) }))
        .filter((g) => g.items.length > 0);

    return (
        <ThemeWrapper>
            <Screen title="Explore" subtitle="Everything NovaEdge does, in one place" showBack={false} scroll>
                {groups.map((group) => (
                    <View key={group.eyebrow} style={styles.group}>
                        <SectionHeader eyebrow={group.eyebrow} title={group.title} />
                        <View style={styles.grid}>
                            {group.items.map((item) => (
                                <Pressable
                                    key={item.label}
                                    onPress={() => go(item)}
                                    style={({ pressed }) => [
                                        styles.tile,
                                        COLORS.panel,
                                        pressed && styles.tilePressed,
                                    ]}
                                >
                                    <LinearGradient
                                        colors={[withAlpha(item.tint, 0.22), 'transparent']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <View
                                        style={[
                                            styles.iconBox,
                                            {
                                                backgroundColor: withAlpha(item.tint, 0.16),
                                                borderColor: withAlpha(item.tint, 0.4),
                                            },
                                        ]}
                                    >
                                        <Ionicons name={item.icon} size={20} color={item.tint} />
                                    </View>
                                    <Text variant="bodyStrong" numberOfLines={1}>{item.label}</Text>
                                    <Text variant="caption" tone="muted" numberOfLines={2} style={styles.tileDesc}>
                                        {item.description}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                ))}
            </Screen>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    group: {
        marginBottom: SPACING.lg,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -SPACING.xs,
    },
    tile: {
        // flexBasis just under 50% so two tiles fit a row once margins apply
        flexGrow: 1,
        flexBasis: '44%',
        margin: SPACING.xs,
        padding: SPACING.md - 2,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        minHeight: 132,
    },
    tilePressed: {
        opacity: 0.75,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginBottom: SPACING.sm + 2,
    },
    tileDesc: {
        marginTop: 3,
    },
});

export default ExploreScreen;
