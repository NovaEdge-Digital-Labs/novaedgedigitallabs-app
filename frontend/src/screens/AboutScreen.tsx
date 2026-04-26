import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { LinearGradient } from 'expo-linear-gradient';

const AboutScreen = ({ navigation }: any) => {
    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    const coreServices = [
        { icon: 'code-slash-outline', title: 'Custom Web & Mobile Development' },
        { icon: 'color-palette-outline', title: 'UI/UX Design & Prototyping' },
        { icon: 'game-controller-outline', title: 'ESports & Live-streaming Tools' },
        { icon: 'sparkles-outline', title: 'AI-powered Automation & Analytics' },
    ];

    const companyInfo = [
        { icon: 'calendar-outline', label: 'Founded', value: 'Est. 2025' },
        { icon: 'person-outline', label: 'Founder', value: 'Amit Kumar Raikwar' },
        { icon: 'mail-outline', label: 'Email', value: 'contact@novaedgedigitallabs.tech', link: 'mailto:contact@novaedgedigitallabs.tech' },
        { icon: 'call-outline', label: 'Phone', value: '+91-6391486456', link: 'tel:+916391486456' },
        { icon: 'document-text-outline', label: 'Udyam Reg.', value: 'UDYAM-MP-23-0241024' },
    ];

    const socialLinks = [
        { icon: 'globe-outline', label: 'Portfolio', url: 'https://lnkd.in/dB3zXD9x' },
        { icon: 'logo-github', label: 'GitHub', url: 'https://lnkd.in/dGSU4tCq' },
        { icon: 'logo-linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/novaedge' },
        { icon: 'logo-instagram', label: 'Instagram', url: 'https://instagram.com/novaedge' },
    ];

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About NovaEdge</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <LinearGradient
                    colors={primaryGradient}
                    style={styles.heroCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.iconContainer}>
                        <Image source={require('../../assets/icon.png')} style={styles.appIcon} />
                    </View>
                    <Text style={styles.logoText}>NovaEdge</Text>
                    <Text style={styles.logoSub}>Digital Labs</Text>
                    <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>v1.0.0 • Est. 2025</Text>
                    </View>
                </LinearGradient>

                {/* Vision */}
                <View style={[styles.card, COLORS.getGlow(COLORS.primary, 10, 0.1)]}>
                    <View style={styles.cardIcon}>
                        <Ionicons name="eye-outline" size={28} color={COLORS.primary} />
                    </View>
                    <Text style={styles.cardTitle}>Our Vision</Text>
                    <Text style={styles.cardDesc}>
                        To build human-centered digital products that empower businesses and creators to scale with elegant technology.
                    </Text>
                </View>

                {/* Philosophy */}
                <View style={[styles.card, COLORS.getGlow(COLORS.accent, 10, 0.08)]}>
                    <View style={styles.cardIcon}>
                        <Ionicons name="heart-outline" size={28} color={COLORS.accent} />
                    </View>
                    <Text style={styles.cardTitle}>Our Philosophy</Text>
                    <Text style={styles.cardDesc}>
                        We believe technology should be accessible, reliable, and human-centred. Our approach combines user-first design with pragmatic engineering — so products are delightful to use and simple to scale.
                    </Text>
                </View>

                {/* Founder Story */}
                <View style={[styles.card, COLORS.getGlow(COLORS.warning, 10, 0.08)]}>
                    <View style={styles.cardIcon}>
                        <Ionicons name="rocket-outline" size={28} color={COLORS.warning} />
                    </View>
                    <Text style={styles.cardTitle}>The Founder's Story</Text>
                    <Text style={styles.cardDesc}>
                        I come from a small town in UP. No IIT. No tier-1 college. No startup culture around me. No senior dev to guide me. Just a laptop, internet, and an obsession with building things.
                    </Text>
                    <Text style={[styles.cardDesc, { marginTop: 12 }]}>
                        While most of my classmates were waiting for college to "prepare" them, I decided to prepare myself. Not tutorials. Not courses. Real, deployed, production-grade products.
                    </Text>

                    <View style={styles.achievementsList}>
                        {[
                            'E-commerce platform with Redis caching, payment gateway & real-time analytics',
                            'AI-powered blog platform with full SEO architecture',
                            'Legal tech platform for a real client solving a problem in India\'s judicial system',
                            'Cross-platform mobile apps',
                            'Real-time chat application',
                            'Full LMS from scratch',
                            'Custom programming language — lexer, parser, interpreter in TypeScript (easylang-interpreter on NPM)',
                        ].map((item, i) => (
                            <View key={i} style={styles.achievementItem}>
                                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                                <Text style={styles.achievementText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.quoteBox}>
                        <Text style={styles.quoteText}>
                            "Your college name is not your ceiling. Clients don't ask for your CGPA — they ask 'does it work?' The internet doesn't care where you're from. It only cares what you ship."
                        </Text>
                    </View>

                    <View style={styles.founderTag}>
                        <Image source={require('../../assets/images/amitkumarraikwar.png')} style={styles.founderImage} />
                        <Text style={styles.founderName}>Amit Kumar Raikwar</Text>
                        <Text style={styles.founderRole}>Founder & CTO</Text>
                    </View>
                </View>

                {/* Core Services */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Core Services</Text>
                    {coreServices.map((service, index) => (
                        <View key={index} style={styles.serviceItem}>
                            <View style={[styles.serviceIcon, { backgroundColor: COLORS.primary + '15' }]}>
                                <Ionicons name={service.icon as any} size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.serviceText}>{service.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Company Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Company Snapshot</Text>
                    {companyInfo.map((info, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.infoItem}
                            onPress={info.link ? () => Linking.openURL(info.link!) : undefined}
                            activeOpacity={info.link ? 0.7 : 1}
                            disabled={!info.link}
                        >
                            <View style={[styles.infoIcon, { backgroundColor: COLORS.info + '15' }]}>
                                <Ionicons name={info.icon as any} size={18} color={COLORS.info} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>{info.label}</Text>
                                <Text style={[styles.infoValue, info.link && { color: COLORS.primary }]}>{info.value}</Text>
                            </View>
                            {info.link && <Ionicons name="open-outline" size={14} color={COLORS.textMuted} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Social Links */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Connect With Us</Text>
                    {socialLinks.map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.linkItem}
                            onPress={() => Linking.openURL(link.url)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.linkIconBox}>
                                <Ionicons name={link.icon as any} size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.linkText}>{link.label}</Text>
                            <Ionicons name="open-outline" size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Ionicons name="heart" size={14} color={COLORS.primary} />
                    <Text style={styles.footerText}>Built with passion from a small town in India 🇮🇳</Text>
                    <Text style={styles.copyright}>© 2026 NovaEdge Digital Labs. All rights reserved.</Text>
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
    heroCard: { borderRadius: 24, padding: 35, alignItems: 'center', marginBottom: 25 },
    iconContainer: {
        width: 90, height: 90, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 18,
    },
    appIcon: { width: 70, height: 70, resizeMode: 'contain' },
    logoText: { fontSize: 36, fontWeight: '900', color: COLORS.white, letterSpacing: -0.5 },
    logoSub: {
        fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600',
        letterSpacing: 2, textTransform: 'uppercase', marginTop: -2, marginBottom: 20,
    },
    versionBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    },
    versionText: { color: 'white', fontSize: 12, fontWeight: '600' },
    card: {
        backgroundColor: COLORS.backgroundSoft, borderRadius: 20, padding: 24,
        marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
    },
    cardIcon: { marginBottom: 15 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 10 },
    cardDesc: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
    achievementsList: { marginTop: 16 },
    achievementItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 5 },
    achievementText: { fontSize: 13, color: COLORS.textLight, marginLeft: 8, flex: 1, lineHeight: 19 },
    quoteBox: {
        marginTop: 18, backgroundColor: 'rgba(255,255,255,0.04)',
        borderLeftWidth: 3, borderLeftColor: COLORS.primary,
        padding: 16, borderRadius: 8,
    },
    quoteText: { fontSize: 13, color: COLORS.textLight, fontStyle: 'italic', lineHeight: 20 },
    founderTag: {
        alignItems: 'center', marginTop: 20,
        paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
    founderImage: {
        width: 120, height: 120, borderRadius: 60,
        borderWidth: 3, borderColor: COLORS.primary, marginBottom: 12,
    },
    founderName: { fontSize: 15, fontWeight: '700', color: COLORS.white },
    founderRole: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    section: { marginBottom: 25 },
    sectionTitle: {
        fontSize: 14, fontWeight: 'bold', color: COLORS.textMuted, marginBottom: 15,
        marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1,
    },
    serviceItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSoft,
        padding: 16, borderRadius: 16, marginBottom: 10,
        borderWidth: 1, borderColor: COLORS.border,
    },
    serviceIcon: {
        width: 40, height: 40, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
    },
    serviceText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.white },
    infoItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSoft,
        padding: 14, borderRadius: 14, marginBottom: 8,
        borderWidth: 1, borderColor: COLORS.border,
    },
    infoIcon: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    infoLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
    infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.white, marginTop: 2 },
    linkItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSoft,
        padding: 16, borderRadius: 16, marginBottom: 10,
        borderWidth: 1, borderColor: COLORS.border,
    },
    linkIconBox: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center', alignItems: 'center', marginRight: 15,
    },
    linkText: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.white },
    footer: { alignItems: 'center', marginTop: 15, marginBottom: 10 },
    footerText: { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
    copyright: { fontSize: 11, color: COLORS.textMuted, opacity: 0.5, marginTop: 6 },
});

export default AboutScreen;
