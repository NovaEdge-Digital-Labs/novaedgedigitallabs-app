import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';

const NotificationsScreen = ({ navigation }: any) => {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [toolUpdates, setToolUpdates] = useState(true);
    const [promotions, setPromotions] = useState(false);
    const [billing, setBilling] = useState(true);
    const [security, setSecurity] = useState(true);
    const [newsletter, setNewsletter] = useState(false);
    const [tips, setTips] = useState(true);

    const ToggleRow = ({ icon, title, subtitle, value, onToggle, color = COLORS.primary, disabled = false }: any) => (
        <View style={[styles.toggleItem, disabled && { opacity: 0.4 }]}>
            <View style={[styles.toggleIcon, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>{title}</Text>
                {subtitle && <Text style={styles.toggleSubtitle}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                disabled={disabled}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={value ? COLORS.primary : COLORS.textMuted}
            />
        </View>
    );

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Master Controls */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Channels</Text>
                    <ToggleRow
                        icon="notifications-outline"
                        title="Push Notifications"
                        subtitle="Alerts on your device"
                        value={pushEnabled}
                        onToggle={setPushEnabled}
                    />
                    <ToggleRow
                        icon="mail-outline"
                        title="Email Notifications"
                        subtitle="Updates in your inbox"
                        value={emailEnabled}
                        onToggle={setEmailEnabled}
                        color={COLORS.info}
                    />
                </View>

                {/* Activity Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Activity</Text>
                    <ToggleRow
                        icon="construct-outline"
                        title="Tool Updates"
                        subtitle="New features & improvements"
                        value={toolUpdates}
                        onToggle={setToolUpdates}
                        color={COLORS.accent}
                        disabled={!pushEnabled && !emailEnabled}
                    />
                    <ToggleRow
                        icon="card-outline"
                        title="Billing & Payments"
                        subtitle="Subscription renewals & receipts"
                        value={billing}
                        onToggle={setBilling}
                        color={COLORS.success}
                        disabled={!pushEnabled && !emailEnabled}
                    />
                    <ToggleRow
                        icon="shield-checkmark-outline"
                        title="Security Alerts"
                        subtitle="Login attempts & account changes"
                        value={security}
                        onToggle={setSecurity}
                        color={COLORS.warning}
                        disabled={!pushEnabled && !emailEnabled}
                    />
                </View>

                {/* Marketing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Marketing</Text>
                    <ToggleRow
                        icon="megaphone-outline"
                        title="Promotions & Offers"
                        subtitle="Exclusive deals and discounts"
                        value={promotions}
                        onToggle={setPromotions}
                        color="#f472b6"
                        disabled={!pushEnabled && !emailEnabled}
                    />
                    <ToggleRow
                        icon="newspaper-outline"
                        title="Newsletter"
                        subtitle="Monthly product digest"
                        value={newsletter}
                        onToggle={setNewsletter}
                        color={COLORS.info}
                        disabled={!emailEnabled}
                    />
                    <ToggleRow
                        icon="bulb-outline"
                        title="Tips & Tricks"
                        subtitle="Get the most out of NovaEdge"
                        value={tips}
                        onToggle={setTips}
                        color={COLORS.accent}
                        disabled={!pushEnabled && !emailEnabled}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>You can update these preferences at any time.</Text>
                </View>
            </ScrollView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15,
        marginTop: Platform.OS === 'android' ? 10 : 0,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
    content: { padding: 20, paddingBottom: 40 },
    section: { marginBottom: 30 },
    sectionTitle: {
        fontSize: 14, fontWeight: 'bold', color: COLORS.textMuted, marginBottom: 15,
        marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1,
    },
    toggleItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSoft,
        padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
    },
    toggleIcon: {
        width: 40, height: 40, borderRadius: 10, justifyContent: 'center',
        alignItems: 'center', marginRight: 15,
    },
    toggleText: { flex: 1 },
    toggleTitle: { fontSize: 16, fontWeight: '600', color: COLORS.white },
    toggleSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
    footer: { alignItems: 'center', marginTop: 10 },
    footerText: { fontSize: 12, color: COLORS.textMuted, opacity: 0.6 },
});

export default NotificationsScreen;
