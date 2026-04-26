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

                {/* Quick Tools Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Tools</Text>
                    <View style={styles.toolsGrid}>
                        {tools.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.toolCard, COLORS.getGlow(COLORS.glow, 8, 0.2)]}
                                onPress={() => navigation.navigate('Tools', { screen: item.routeName })}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: 'transparent' }]}>
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
                    <Text style={styles.sectionTitle}>Our Services</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
                        {['Web Development', 'App Development', 'SEO & Marketing'].map((service, index) => (
                            <View key={index} style={[styles.serviceCard, COLORS.getGlow(COLORS.glow, 10, 0.1)]}>
                                <View style={styles.serviceIcon}>
                                    <Ionicons name="code-slash" size={32} color={COLORS.primary} />
                                </View>
                                <Text style={styles.serviceTitle}>{service}</Text>
                                <Text style={styles.serviceDesc}>Scalable and high-performance solutions for your business.</Text>
                            </View>
                        ))}
                    </ScrollView>
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
        paddingVertical: 15,
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
        margin: 20,
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
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 15,
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
});

export default HomeScreen;
