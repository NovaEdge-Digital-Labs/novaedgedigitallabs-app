import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { shareContent } from '../utils/shareHelper';
import ThemeWrapper from '../components/ThemeWrapper';

const SERVICES = [
    {
        id: 'web-development',
        title: 'Web Development',
        icon: 'code-slash',
        description: 'Custom React & Next.js websites built for top performance and scalable growth.',
        features: ['E-commerce', 'SaaS Platforms', 'SEO Optimized'],
    },
    {
        id: 'app-development',
        title: 'Mobile App Development',
        icon: 'phone-portrait',
        description: 'Native & Cross-platform apps for Android and iOS using React Native.',
        features: ['Real-time Apps', 'Payment Integration', 'Cloud Sync'],
    },
    {
        id: 'ui-ux',
        title: 'UI/UX Design',
        icon: 'color-palette',
        description: 'Premium user interfaces and seamless user experience design tailored to your brand.',
        features: ['Prototyping', 'User Research', 'Brand Graphics'],
    },
    {
        id: 'seo',
        title: 'Digital Marketing',
        icon: 'trending-up',
        description: 'Data-driven marketing to rank your business on top of search results.',
        features: ['Keyword Research', 'Backlink Strategy', 'PPC Ads'],
    },
    {
        id: 'other',
        title: 'Custom Software',
        icon: 'hardware-chip',
        description: 'Bespoke software solutions tailored to your unique business needs.',
        features: ['API Integrations', 'Legacy Migration', 'AI/ML Solutions'],
    },
];

const ServicesScreen = () => {
    const navigation = useNavigation<any>();

    const renderServiceCard = (service: any) => (
        <View key={service.id} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name={service.icon as any} size={28} color={COLORS.primary} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.serviceTitle}>{service.title}</Text>
                    <Text style={styles.description}>{service.description}</Text>
                </View>
            </View>

            <View style={styles.featuresContainer}>
                {service.features.map((feature: string, index: number) => (
                    <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.quoteButton}
                    onPress={() => navigation.navigate('LeadForm', { service: service.id })}
                    activeOpacity={0.8}
                >
                    <Text style={styles.quoteButtonText}>Get Free Quote</Text>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => shareContent({ title: service.title, description: service.description, type: 'Service' })}
                    activeOpacity={0.7}
                >
                    <Ionicons name="share-social-outline" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ThemeWrapper>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <Text style={styles.heroHeading}>Expert Solutions for Your Digital Growth</Text>
                    <Text style={styles.heroSubheading}>Choose from our range of premium services to scale your business.</Text>
                </View>

                {SERVICES.map(renderServiceCard)}

                <View style={styles.contactCard}>
                    <Ionicons name="chatbubbles-outline" size={32} color={COLORS.accent} style={{ marginBottom: 12 }} />
                    <Text style={styles.contactTitle}>Have a unique project?</Text>
                    <Text style={styles.contactSub}>We love working on innovative ideas. Let's discuss yours.</Text>
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={() => navigation.navigate('LeadForm', { service: 'other' })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.contactButtonText}>Contact Custom Sales</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl * 2,
    },
    heroSection: {
        marginBottom: SPACING.xl,
        padding: SPACING.xl,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.withAlpha(COLORS.primary, 0.08),
        borderWidth: 1,
        borderColor: COLORS.withAlpha(COLORS.primary, 0.2),
    },
    heroHeading: {
        ...TYPOGRAPHY.h2,
        color: COLORS.white,
        marginBottom: SPACING.sm,
    },
    heroSubheading: {
        ...TYPOGRAPHY.body,
        color: 'rgba(255,255,255,0.85)',
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
        ...SHADOWS.medium,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.withAlpha(COLORS.primary, 0.1),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    headerText: {
        flex: 1,
    },
    serviceTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    description: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
    },
    featuresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: COLORS.background,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.lg,
        gap: SPACING.sm,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    featureText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textPrimary,
        marginLeft: SPACING.xs,
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    quoteButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.primary,
        overflow: 'hidden',
    },
    shareButton: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    quoteButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.white,
        marginRight: SPACING.xs,
    },
    contactCard: {
        backgroundColor: COLORS.withAlpha(COLORS.accent, 0.05),
        padding: SPACING.xl,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.withAlpha(COLORS.accent, 0.2),
        marginTop: SPACING.md,
    },
    contactTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    contactSub: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    contactButton: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: SPACING.xl,
        paddingVertical: 12,
        borderRadius: RADIUS.md,
    },
    contactButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.white,
    },
});

export default ServicesScreen;
