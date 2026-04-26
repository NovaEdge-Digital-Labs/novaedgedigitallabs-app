import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { LinearGradient } from 'expo-linear-gradient';

const PrivacySecurityScreen = ({ navigation }: any) => {
    const [biometric, setBiometric] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [analytics, setAnalytics] = useState(true);
    const [crashReports, setCrashReports] = useState(true);

    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    const handleChangePassword = () => {
        Alert.alert(
            'Change Password',
            'A password reset link will be sent to your registered email address.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send Link', onPress: () => Alert.alert('Done', 'Password reset email sent successfully!') },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            '⚠️ Delete Account',
            'This action is permanent and cannot be undone. All your data, subscription, and usage history will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: () => Alert.alert('Request Submitted', 'Your account deletion request has been submitted. It may take up to 48 hours to process.'),
                },
            ]
        );
    };

    const handleDownloadData = () => {
        Alert.alert(
            'Download Your Data',
            'We will prepare a copy of your data and send it to your registered email within 24 hours.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Request Data', onPress: () => Alert.alert('Requested', 'Your data export request has been submitted.') },
            ]
        );
    };

    const ToggleItem = ({ icon, title, subtitle, value, onToggle, color = COLORS.primary }: any) => (
        <View style={styles.settingItem}>
            <View style={[styles.settingIcon, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
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
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>

                    <ToggleItem
                        icon="finger-print-outline"
                        title="Biometric Login"
                        subtitle="Use fingerprint or face to unlock"
                        value={biometric}
                        onToggle={setBiometric}
                    />
                    <ToggleItem
                        icon="shield-checkmark-outline"
                        title="Two-Factor Auth"
                        subtitle="Extra layer of account protection"
                        value={twoFactor}
                        onToggle={setTwoFactor}
                        color={COLORS.success}
                    />

                    <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword} activeOpacity={0.7}>
                        <View style={[styles.settingIcon, { backgroundColor: COLORS.warning + '15' }]}>
                            <Ionicons name="key-outline" size={20} color={COLORS.warning} />
                        </View>
                        <View style={styles.settingText}>
                            <Text style={styles.settingTitle}>Change Password</Text>
                            <Text style={styles.settingSubtitle}>Update your account password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Privacy Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy</Text>

                    <ToggleItem
                        icon="analytics-outline"
                        title="Usage Analytics"
                        subtitle="Help us improve with anonymous data"
                        value={analytics}
                        onToggle={setAnalytics}
                        color={COLORS.info}
                    />
                    <ToggleItem
                        icon="bug-outline"
                        title="Crash Reports"
                        subtitle="Auto-send crash data for fixes"
                        value={crashReports}
                        onToggle={setCrashReports}
                        color={COLORS.accent}
                    />
                </View>

                {/* Data Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Management</Text>

                    <TouchableOpacity style={styles.actionItem} onPress={handleDownloadData} activeOpacity={0.7}>
                        <View style={[styles.settingIcon, { backgroundColor: COLORS.info + '15' }]}>
                            <Ionicons name="download-outline" size={20} color={COLORS.info} />
                        </View>
                        <View style={styles.settingText}>
                            <Text style={styles.settingTitle}>Download My Data</Text>
                            <Text style={styles.settingSubtitle}>Export your data as a zip file</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionItem, styles.dangerItem]} onPress={handleDeleteAccount} activeOpacity={0.7}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </View>
                        <View style={styles.settingText}>
                            <Text style={[styles.settingTitle, { color: '#ef4444' }]}>Delete Account</Text>
                            <Text style={styles.settingSubtitle}>Permanently remove your account</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Your data is encrypted and stored securely.</Text>
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
    settingItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSoft,
        padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
    },
    actionItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSoft,
        padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
    },
    dangerItem: { borderColor: 'rgba(239, 68, 68, 0.2)' },
    settingIcon: {
        width: 40, height: 40, borderRadius: 10, justifyContent: 'center',
        alignItems: 'center', marginRight: 15,
    },
    settingText: { flex: 1 },
    settingTitle: { fontSize: 16, fontWeight: '600', color: COLORS.white },
    settingSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
    footer: { alignItems: 'center', marginTop: 10 },
    footerText: { fontSize: 12, color: COLORS.textMuted, opacity: 0.6 },
});

export default PrivacySecurityScreen;
