import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';

const NOTIF_STORAGE_KEY = 'NOVAEDGE_NOTIFICATION_PREFERENCES_V1';

interface NotificationPreferences {
    pushEnabled: boolean;
    emailEnabled: boolean;
    toolUpdates: boolean;
    billing: boolean;
    security: boolean;
    promotions: boolean;
    newsletter: boolean;
    tips: boolean;
}

const defaultPreferences: NotificationPreferences = {
    pushEnabled: true,
    emailEnabled: true,
    toolUpdates: true,
    billing: true,
    security: true,
    promotions: false,
    newsletter: false,
    tips: true,
};

const NotificationsScreen = ({ navigation }: any) => {
    const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPreferences);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved preferences from AsyncStorage
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const saved = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
                if (saved) {
                    setPrefs(JSON.parse(saved));
                }
            } catch (err) {
                console.error('Failed to load notification settings:', err);
            } finally {
                setIsLoaded(true);
            }
        };
        loadPreferences();
    }, []);

    // Save preferences to AsyncStorage
    const savePreference = async (key: keyof NotificationPreferences, value: boolean) => {
        // Special check when turning on Push Notifications
        if (key === 'pushEnabled' && value) {
            try {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(
                        'Permission Denied',
                        'Push notification permissions were not granted in your device settings.'
                    );
                    return;
                }
            } catch (error) {
                console.log('Push notification permission check error:', error);
            }
        }

        const updated = { ...prefs, [key]: value };
        setPrefs(updated);
        try {
            await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
        } catch (err) {
            console.error('Failed to save notification settings:', err);
        }
    };

    const ToggleRow = ({
        icon,
        title,
        subtitle,
        prefKey,
        color = '#a855f7',
        disabled = false
    }: {
        icon: any;
        title: string;
        subtitle?: string;
        prefKey: keyof NotificationPreferences;
        color?: string;
        disabled?: boolean;
    }) => {
        const value = prefs[prefKey];
        return (
            <View style={[styles.toggleItem, disabled && { opacity: 0.4 }]}>
                <View style={[styles.toggleIconContainer, { backgroundColor: `${color}18`, borderColor: `${color}35`, borderWidth: 1 }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <View style={styles.toggleText}>
                    <Text style={styles.toggleTitle}>{title}</Text>
                    {subtitle && <Text style={styles.toggleSubtitle}>{subtitle}</Text>}
                </View>
                <Switch
                    value={value}
                    onValueChange={(val) => savePreference(prefKey, val)}
                    disabled={disabled || !isLoaded}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#9127FF80' }}
                    thumbColor={value ? '#9127FF' : '#94A3B8'}
                />
            </View>
        );
    };

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Master Channels */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notification Channels</Text>
                    <ToggleRow
                        icon="notifications-outline"
                        title="Push Notifications"
                        subtitle="Alerts on your device"
                        prefKey="pushEnabled"
                        color="#a855f7"
                    />
                    <ToggleRow
                        icon="mail-outline"
                        title="Email Notifications"
                        subtitle="Updates in your inbox"
                        prefKey="emailEnabled"
                        color="#38bdf8"
                    />
                </View>

                {/* Activity Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Activity Alerts</Text>
                    <ToggleRow
                        icon="construct-outline"
                        title="Tool Updates"
                        subtitle="New features & improvements"
                        prefKey="toolUpdates"
                        color="#c042ff"
                        disabled={!prefs.pushEnabled && !prefs.emailEnabled}
                    />
                    <ToggleRow
                        icon="card-outline"
                        title="Billing & Payments"
                        subtitle="Subscription renewals & receipts"
                        prefKey="billing"
                        color="#34d399"
                        disabled={!prefs.pushEnabled && !prefs.emailEnabled}
                    />
                    <ToggleRow
                        icon="shield-checkmark-outline"
                        title="Security Alerts"
                        subtitle="Login attempts & account changes"
                        prefKey="security"
                        color="#fbbf24"
                        disabled={!prefs.pushEnabled && !prefs.emailEnabled}
                    />
                </View>

                {/* Marketing & Content */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Marketing & Digests</Text>
                    <ToggleRow
                        icon="megaphone-outline"
                        title="Promotions & Offers"
                        subtitle="Exclusive deals and discounts"
                        prefKey="promotions"
                        color="#f43f5e"
                        disabled={!prefs.pushEnabled && !prefs.emailEnabled}
                    />
                    <ToggleRow
                        icon="newspaper-outline"
                        title="Newsletter"
                        subtitle="Monthly product digest"
                        prefKey="newsletter"
                        color="#38bdf8"
                        disabled={!prefs.emailEnabled}
                    />
                    <ToggleRow
                        icon="bulb-outline"
                        title="Tips & Tricks"
                        subtitle="Get the most out of NovaEdge"
                        prefKey="tips"
                        color="#fbbf24"
                        disabled={!prefs.pushEnabled && !prefs.emailEnabled}
                    />
                </View>

                <View style={styles.footer}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#34d399" style={{ marginBottom: 4 }} />
                    <Text style={styles.footerText}>Preferences are automatically saved to your account.</Text>
                </View>
            </ScrollView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginTop: Platform.OS === 'android' ? 10 : 0,
    },
    backButton: {
        padding: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 26,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#A5B4FC',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        padding: 14,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    toggleIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    toggleText: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    toggleSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    footer: {
        alignItems: 'center',
        marginTop: 10,
        paddingVertical: 10,
    },
    footerText: {
        fontSize: 12,
        color: '#94A3B8',
    },
});

export default NotificationsScreen;
