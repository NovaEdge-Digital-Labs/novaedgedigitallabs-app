import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import FeaturedPartners from '../components/FeaturedPartners';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<any> = ({ navigation }) => {
    const tools = [
        { id: 'compress', name: 'Image Compressor', icon: 'image', color: COLORS.primary, routeName: 'ImageCompressor' },
        { id: 'qr', name: 'QR Generator', icon: 'qr-code', color: COLORS.accent, routeName: 'QRGenerator' },
        { id: 'gst', name: 'GST Calculator', icon: 'calculator', color: COLORS.info, routeName: 'GSTCalculator' },
        { id: 'emi', name: 'EMI Calculator', icon: 'stats-chart', color: COLORS.warning, routeName: 'EMICalculator' },
    ];

    const stats = [
        { label: 'Projects', value: '500+', icon: 'rocket-outline' },
        { label: 'Clients', value: '100+', icon: 'people-outline' },
        { label: 'Rating', value: '4.9/5', icon: 'star-outline' },
    ];

    const testimonials = [
        { id: '1', name: 'Arjun Mehta', company: 'TechFlow', text: 'NovaEdge transformed our vision into a stunning mobile app. Highly recommended!', rating: 5 },
        { id: '2', name: 'Sarah Khan', company: 'EcoStyle', text: 'The QR generator tool is a lifesaver for our retail business. Fast and reliable.', rating: 5 },
        { id: '3', name: 'Rajesh Gupta', company: 'FinServe', text: 'Professional team and excellent support. Their SEO strategies tripled our traffic.', rating: 5 },
    ];

    const news = [
        { id: '1', title: 'Next-Gen AI Integration', date: 'Oct 24', category: 'Tech' },
        { id: '2', title: 'Mastering App Scaling', date: 'Oct 20', category: 'Dev' },
    ];

    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <View style={styles.logoRow}>
                    <Image source={require('../../assets/icon.png')} style={styles.headerIcon} />
                    <View>
                        <View style={styles.logoContainer}>
                            <Text style={[styles.logoNova, COLORS.getGlow(COLORS.primary, 15, 0)]}>NovaEdge</Text>
                        </View>
                        <Text style={styles.subtitle}>Digital Labs</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
                    <Ionicons name="person-circle-outline" size={32} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <LinearGradient
                    colors={primaryGradient}
                    style={styles.hero}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.tagline}>India's #1 Dev Studio</Text>
                    <Text style={styles.heroHeading}>We Build Digital Products That Grow</Text>
                    <TouchableOpacity
                        style={[styles.heroButton, COLORS.getGlow(COLORS.primary, 15, 0)]}
                        onPress={() => navigation.navigate('Services')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.heroButtonText}>Get Free Quote</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={[styles.statCard, COLORS.glass]}>
                            <Ionicons name={stat.icon as any} size={20} color={COLORS.primary} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Tools Grid */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Quick Tools</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Tools')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.toolsGrid}>
                        {tools.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.toolCard, COLORS.getGlow(COLORS.glow, 8, 0.2)]}
                                onPress={() => navigation.navigate('Tools', { screen: item.routeName })}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: item.color + '10' }]}>
                                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                                </View>
                                <Text style={styles.toolName}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Featured Partners Section */}
                <FeaturedPartners navigation={navigation} />

                {/* Services Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Our Services</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
                            <Text style={styles.seeAll}>All Services</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll} contentContainerStyle={{ paddingRight: 20 }}>
                        {[
                            { name: 'Web Development', icon: 'code-slash', desc: 'Scalable and high-performance websites built for growth.' },
                            { name: 'App Development', icon: 'phone-portrait', desc: 'Intuitive mobile experiences optimized for iOS and Android.' },
                            { name: 'SEO & Marketing', icon: 'trending-up', desc: 'Data-driven strategies to boost your digital presence.' }
                        ].map((service, index) => (
                            <View key={index} style={[styles.serviceCard, COLORS.getGlow(COLORS.glow, 10, 0.1)]}>
                                <View style={styles.serviceIcon}>
                                    <Ionicons name={service.icon as any} size={32} color={COLORS.primary} />
                                </View>
                                <Text style={styles.serviceTitle}>{service.name}</Text>
                                <Text style={styles.serviceDesc}>{service.desc}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Testimonials Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Client Success</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll} contentContainerStyle={{ paddingRight: 20 }}>
                        {testimonials.map((item) => (
                            <View key={item.id} style={[styles.testimonialCard, COLORS.glass]}>
                                <View style={styles.quoteIcon}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} />
                                </View>
                                <Text style={styles.testimonialText}>"{item.text}"</Text>
                                <View style={styles.testimonialFooter}>
                                    <View>
                                        <Text style={styles.clientName}>{item.name}</Text>
                                        <Text style={styles.clientCompany}>{item.company}</Text>
                                    </View>
                                    <View style={styles.stars}>
                                        {[...Array(item.rating)].map((_, i) => (
                                            <Ionicons key={i} name="star" size={12} color="#FFD700" />
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Latest News Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Latest Updates</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Academy')}>
                            <Text style={styles.seeAll}>Visit Academy</Text>
                        </TouchableOpacity>
                    </View>
                    {news.map((item) => (
                        <TouchableOpacity key={item.id} style={[styles.newsCard, COLORS.glass]} activeOpacity={0.8}>
                            <View style={styles.newsDateBox}>
                                <Text style={styles.newsDate}>{item.date}</Text>
                            </View>
                            <View style={styles.newsContent}>
                                <Text style={styles.newsTag}>{item.category}</Text>
                                <Text style={styles.newsTitle}>{item.title}</Text>
                            </View>
                            <Ionicons name="arrow-forward-circle-outline" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Newsletter Section */}
                <View style={styles.newsletterSection}>
                    <LinearGradient
                        colors={[COLORS.backgroundSoft, COLORS.background]}
                        style={styles.newsletterCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="mail-unread-outline" size={40} color={COLORS.primary} style={{ marginBottom: 15 }} />
                        <Text style={styles.newsletterHeading}>Stay in the Loop</Text>
                        <Text style={styles.newsletterSub}>Get the latest tech insights and studio updates.</Text>
                        <TouchableOpacity
                            style={[styles.newsletterButton, COLORS.getGlow(COLORS.primary, 10, 0.3)]}
                            onPress={() => navigation.navigate('BusinessInquiry')}
                        >
                            <Text style={styles.newsletterButtonText}>Join Community</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>© 2026 NovaEdge Digital Labs • Indore</Text>
                    </View>
                </View>
            </ScrollView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'transparent',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        width: 38,
        height: 38,
        resizeMode: 'contain',
        marginRight: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoNova: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
        marginTop: -4,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    hero: {
        padding: 30,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 25,
        borderRadius: 24,
        alignItems: 'center',
    },
    tagline: {
        color: COLORS.textLight,
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroHeading: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    heroButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    heroButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 35,
    },
    statCard: {
        width: '31%',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    statLabel: {
        color: COLORS.textMuted,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        paddingHorizontal: 20,
        marginVertical: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    seeAll: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    toolsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    toolCard: {
        width: '48%',
        ...COLORS.glass,
        padding: 15,
        borderRadius: COLORS.geometry.radiusMedium,
        marginBottom: 15,
        alignItems: 'center',
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    toolName: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'center',
    },
    servicesScroll: {
        marginLeft: -20,
        paddingLeft: 20,
    },
    serviceCard: {
        width: width * 0.7,
        ...COLORS.glass,
        padding: 20,
        borderRadius: COLORS.geometry.radiusMedium,
        marginRight: 15,
    },
    serviceIcon: {
        marginBottom: 15,
    },
    serviceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    serviceDesc: {
        color: COLORS.textMuted,
        fontSize: 14,
        lineHeight: 20,
    },
    testimonialCard: {
        width: width * 0.75,
        padding: 20,
        borderRadius: 20,
        marginRight: 15,
    },
    quoteIcon: {
        marginBottom: 10,
    },
    testimonialText: {
        color: COLORS.text,
        fontSize: 15,
        fontStyle: 'italic',
        lineHeight: 22,
        marginBottom: 15,
    },
    testimonialFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    clientName: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    clientCompany: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    stars: {
        flexDirection: 'row',
        gap: 2,
    },
    newsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 18,
        marginBottom: 12,
    },
    newsDateBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    newsDate: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    newsContent: {
        flex: 1,
    },
    newsTag: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    newsTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    newsletterSection: {
        padding: 20,
        marginTop: 20,
        marginBottom: 40,
    },
    newsletterCard: {
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    newsletterHeading: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    newsletterSub: {
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    newsletterButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 20,
    },
    newsletterButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 15,
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerText: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
});

export default HomeScreen;
