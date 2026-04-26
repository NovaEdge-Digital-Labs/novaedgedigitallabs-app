import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

const REFERRAL_CODE = 'NOVA2026';

const ReferEarnScreen = ({ navigation }: any) => {
    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    const handleCopyCode = async () => {
        await Clipboard.setStringAsync(REFERRAL_CODE);
        Alert.alert('Copied!', 'Referral code copied to clipboard.');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join NovaEdge Digital Labs and get premium tools for FREE! Use my referral code: ${REFERRAL_CODE}\n\nDownload now: https://novaedge.com/download`,
            });
        } catch (error) {
            // User cancelled share
        }
    };

    const rewards = [
        { icon: 'gift-outline', title: 'Refer 1 Friend', reward: '7 days Pro free', color: COLORS.info },
        { icon: 'people-outline', title: 'Refer 3 Friends', reward: '1 month Pro free', color: COLORS.warning },
        { icon: 'trophy-outline', title: 'Refer 5 Friends', reward: '3 months Pro free', color: COLORS.accent },
        { icon: 'diamond-outline', title: 'Refer 10 Friends', reward: 'Lifetime Business plan', color: COLORS.primary },
    ];

    const steps = [
        { step: '1', title: 'Share Your Code', desc: 'Send your unique referral code to friends' },
        { step: '2', title: 'Friend Signs Up', desc: 'They create an account using your code' },
        { step: '3', title: 'Both Get Rewarded', desc: 'You and your friend receive Pro benefits' },
    ];

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Refer & Earn</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <LinearGradient
                    colors={primaryGradient}
                    style={styles.heroCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="gift" size={48} color="white" style={{ marginBottom: 15 }} />
                    <Text style={styles.heroTitle}>Invite Friends, Earn Pro!</Text>
                    <Text style={styles.heroDesc}>Share NovaEdge with friends and unlock premium features for free.</Text>
                </LinearGradient>

                {/* Referral Code Card */}
                <View style={[styles.codeCard, COLORS.getGlow(COLORS.primary, 15, 0.2)]}>
                    <Text style={styles.codeLabel}>Your Referral Code</Text>
                    <View style={styles.codeRow}>
                        <Text style={styles.codeText}>{REFERRAL_CODE}</Text>
                        <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton} activeOpacity={0.7}>
                            <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
                        <LinearGradient
                            colors={primaryGradient}
                            style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Ionicons name="share-social" size={18} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.shareButtonText}>Share with Friends</Text>
                    </TouchableOpacity>
                </View>

                {/* How It Works */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How It Works</Text>
                    {steps.map((item, index) => (
                        <View key={index} style={styles.stepItem}>
                            <View style={styles.stepCircle}>
                                <Text style={styles.stepNumber}>{item.step}</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>{item.title}</Text>
                                <Text style={styles.stepDesc}>{item.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Reward Tiers */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reward Tiers</Text>
                    {rewards.map((item, index) => (
                        <View key={index} style={styles.rewardItem}>
                            <View style={[styles.rewardIcon, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name={item.icon as any} size={22} color={item.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rewardTitle}>{item.title}</Text>
                                <Text style={styles.rewardValue}>{item.reward}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                        </View>
                    ))}
                </View>

                {/* Stats */}
                <View style={[styles.statsCard, COLORS.getGlow(COLORS.accent, 10, 0.1)]}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Referrals</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Rewards</Text>
                    </View>
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
    heroCard: { borderRadius: 24, padding: 30, alignItems: 'center', marginBottom: 25 },
    heroTitle: { fontSize: 24, fontWeight: '900', color: 'white', marginBottom: 8, textAlign: 'center' },
    heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
    codeCard: {
        backgroundColor: COLORS.backgroundSoft, borderRadius: 20, padding: 24,
        marginBottom: 25, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
    },
    codeLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    codeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    codeText: { fontSize: 32, fontWeight: '900', color: COLORS.white, letterSpacing: 4, marginRight: 12 },
    copyButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10 },
    shareButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        height: 48, borderRadius: 12, overflow: 'hidden', width: '100%',
    },
    shareButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    section: { marginBottom: 25 },
    sectionTitle: {
        fontSize: 14, fontWeight: 'bold', color: COLORS.textMuted, marginBottom: 15,
        marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1,
    },
    stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    stepCircle: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary + '20',
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
    },
    stepNumber: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
    stepDesc: { fontSize: 13, color: COLORS.textMuted },
    rewardItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSoft,
        padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
    },
    rewardIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rewardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.white, marginBottom: 2 },
    rewardValue: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
    statsCard: {
        flexDirection: 'row', backgroundColor: COLORS.backgroundSoft, borderRadius: 20,
        padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10,
    },
    statBox: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
    statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    statDivider: { width: 1, backgroundColor: COLORS.border },
});

export default ReferEarnScreen;
