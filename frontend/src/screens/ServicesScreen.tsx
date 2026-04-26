import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const SERVICES = [
    {
        id: 'web-development',
        title: 'Web Development',
        icon: 'code-slash-outline',
        description: 'Custom React & Next.js websites built for performance and scalability.',
        features: ['E-commerce', 'SaaS Platforms', 'SEO Optimized'],
    },
    {
        id: 'app-development',
        title: 'Mobile App Development',
        icon: 'phone-portrait-outline',
        description: 'Native & Cross-platform apps (Android/iOS) using React Native.',
        features: ['Real-time Apps', 'Payment Integration', 'Cloud Sync'],
    },
    {
        id: 'ui-ux',
        title: 'UI/UX Design',
        icon: 'color-palette-outline',
        description: 'Premium user interfaces and seamless user experience design.',
        features: ['Prototyping', 'User Research', 'Brand Graphics'],
    },
    {
        id: 'seo',
        title: 'SEO & Digital Marketing',
        icon: 'trending-up-outline',
        description: 'Data-driven marketing to rank your business on top of search results.',
        features: ['Keyword Research', 'Backlink Strategy', 'PPC Ads'],
    },
    {
        id: 'other',
        title: 'Custom Software',
        icon: 'settings-outline',
        description: 'Bespoke software solutions tailored to your unique business needs.',
        features: ['API Integrations', 'Legacy Migration', 'AI/ML Solutions'],
    },
];

import ThemeWrapper from '../components/ThemeWrapper';

const ServicesScreen = () => {
    const navigation = useNavigation<any>();
    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    const renderServiceCard = (service: any) => (
        <View key={service.id} style={[styles.card, COLORS.getGlow(COLORS.primary, 10, 0.1)]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]}>
                    <Ionicons name={service.icon as any} size={32} color={COLORS.primary} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.serviceTitle}>{service.title}</Text>
                    <Text style={styles.description}>{service.description}</Text>
                </View>
            </View>

            <View style={styles.featuresContainer}>
                {service.features.map((feature: string, index: number) => (
                    <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.quoteButton, COLORS.getGlow(COLORS.primary, 15, 0)]}
                onPress={() => navigation.navigate('LeadForm', { service: service.id })}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={primaryGradient}
                    style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                <Text style={styles.quoteButtonText}>Get Free Quote</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
        </View>
    );

    return (
        <ThemeWrapper>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <LinearGradient
                    colors={primaryGradient}
                    style={styles.heroSection}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.heroHeading}>Expert Solutions for Your Digital Growth</Text>
                    <Text style={styles.heroSubheading}>Choose from our range of premium services to scale your business.</Text>
                </LinearGradient>

                {SERVICES.map(renderServiceCard)}

                <View style={[styles.contactCard, COLORS.getGlow(COLORS.accent, 15, 0.2)]}>
                    <Text style={styles.contactTitle}>Have a unique project?</Text>
                    <Text style={styles.contactSub}>We love working on innovative ideas. Let's discuss yours.</Text>
                    <TouchableOpacity
                        style={[styles.contactButton, COLORS.getGlow(COLORS.primary, 10, 0.3)]}
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
        padding: 20,
        paddingBottom: 40,
    },
    heroSection: {
        marginBottom: 30,
        padding: 30,
        borderRadius: 24,
    },
    heroHeading: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.white,
        marginBottom: 10,
        lineHeight: 36,
    },
    heroSubheading: {
        fontSize: 16,
        color: COLORS.textLight,
        lineHeight: 24,
        opacity: 0.9,
    },
    card: {
        ...COLORS.glass,
        borderRadius: COLORS.geometry.radiusMedium,
        padding: 20,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerText: {
        flex: 1,
    },
    serviceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 5,
    },
    description: {
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 20,
    },
    featuresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 22,
        backgroundColor: 'transparent',
        padding: 12,
        borderRadius: COLORS.geometry.radiusMedium,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        paddingVertical: 6,
    },
    featureText: {
        fontSize: 13,
        color: COLORS.textLight,
        marginLeft: 8,
    },
    quoteButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        overflow: 'hidden',
    },
    quoteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 17,
        marginRight: 10,
    },
    contactCard: {
        backgroundColor: 'transparent',
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginTop: 10,
    },
    contactTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 10,
    },
    contactSub: {
        fontSize: 15,
        color: COLORS.textLight,
        textAlign: 'center',
        marginBottom: 25,
    },
    contactButton: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    contactButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ServicesScreen;
