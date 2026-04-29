import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

import ThemeWrapper from '../components/ThemeWrapper';

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]
        );
    };

    const MenuItem = ({ icon, title, subtitle, onPress, color = COLORS.text }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.menuIconContainer, { backgroundColor: 'transparent' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: color === COLORS.text ? COLORS.white : color }]}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
    );

    return (
        <ThemeWrapper>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={[styles.avatarContainer, COLORS.getGlow(COLORS.primary, 20, 0.4)]}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>

                    <View style={[styles.planBadge, { backgroundColor: user?.plan === 'free' ? COLORS.backgroundSoft : COLORS.primary }]}>
                        <Ionicons name="star" size={12} color="white" style={{ marginRight: 5 }} />
                        <Text style={styles.planText}>{user?.plan?.toUpperCase() || 'FREE'} PLAN</Text>
                    </View>
                </View>

                <View style={[styles.statsContainer, COLORS.getGlow(COLORS.primary, 10, 0.1)]}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Tools Used</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>Pro</Text>
                        <Text style={styles.statLabel}>Next Tier</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>85%</Text>
                        <Text style={styles.statLabel}>Limit Left</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <MenuItem
                        icon="person-outline"
                        title="Edit Profile"
                        subtitle="Update your personal details"
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <MenuItem
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Manage alerts and news"
                        onPress={() => navigation.navigate('Notifications')}
                    />
                    <MenuItem
                        icon="download-outline"
                        title="My Purchases"
                        subtitle="Assets you have bought"
                        onPress={() => navigation.navigate('MyPurchases')}
                    />
                    <MenuItem
                        icon="shield-checkmark-outline"
                        title="Privacy & Security"
                        subtitle="Password and data settings"
                        onPress={() => navigation.navigate('PrivacySecurity')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Subscription</Text>
                    <MenuItem
                        icon="card-outline"
                        title="Manage Subscription"
                        subtitle="View billing history and plans"
                        onPress={() => navigation.navigate('Subscription')}
                    />
                    <MenuItem
                        icon="gift-outline"
                        title="Refer and Earn"
                        subtitle="Invite friends and get Pro free"
                        onPress={() => navigation.navigate('ReferEarn')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <MenuItem
                        icon="help-circle-outline"
                        title="Help Center"
                        subtitle="FAQs and guides"
                        onPress={() => navigation.navigate('Support', { title: 'Help Center' })}
                    />
                    <MenuItem
                        icon="chatbubble-ellipses-outline"
                        title="Contact Support"
                        subtitle="Talk to our experts"
                        onPress={() => navigation.navigate('Support', { title: 'Contact Support' })}
                    />
                    <MenuItem
                        icon="book-outline"
                        title="About NovaEdge"
                        onPress={() => navigation.navigate('About')}
                    />
                </View>

                {/* Admin Section (Fallback check, normally driven by role/email) */}
                {(user?.email?.includes('admin') || (user as any)?.role === 'admin' || (user as any)?.isAdmin) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Admin</Text>
                        <MenuItem
                            icon="shield-half-outline"
                            title="Admin Dashboard"
                            subtitle="Manage users, jobs, courses"
                            onPress={() => navigation.navigate('AdminDashboard')}
                            color={COLORS.secondary}
                        />
                    </View>
                )}

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0 (Build 42)</Text>
            </ScrollView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: COLORS.white + '30',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: '900',
        color: 'white',
    },
    userName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 6,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 20,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    planText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        ...COLORS.glass,
        borderRadius: COLORS.geometry.radiusLarge,
        padding: 20,
        marginBottom: 35,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: COLORS.border,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 15,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        ...COLORS.glass,
        padding: 16,
        borderRadius: COLORS.geometry.radiusMedium,
        marginBottom: 10,
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    menuSubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 3,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 18,
        borderRadius: COLORS.geometry.radiusMedium,
        marginTop: 10,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: 12,
        marginBottom: 10,
        opacity: 0.7,
    },
});

export default ProfileScreen;
