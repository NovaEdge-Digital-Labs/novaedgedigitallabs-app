import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';

const SupportScreen = ({ navigation, route }: any) => {
    const title = route.params?.title || 'Support';

    const handleSupportAction = (type: 'email' | 'call' | 'guides' | 'api') => {
        switch (type) {
            case 'email':
                Linking.openURL('mailto:contact@novaedgedigitallabs.tech');
                break;
            case 'call':
                Linking.openURL('tel:+916391486456');
                break;
            case 'guides':
                Linking.openURL('https://lnkd.in/dB3zXD9x'); // Portfolio as guide for now
                break;
            case 'api':
                Linking.openURL('https://lnkd.in/dGSU4tCq'); // GitHub as API ref for now
                break;
        }
    };

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, COLORS.getGlow(COLORS.primary, 10, 0.1)]}>
                    <Ionicons name="help-buoy-outline" size={48} color={COLORS.primary} style={{ marginBottom: 15 }} />
                    <Text style={styles.cardTitle}>How can we help today?</Text>
                    <Text style={styles.cardDesc}>Check our documentation or talk to an expert for immediate assistance.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documentation</Text>
                    <TouchableOpacity style={styles.item} onPress={() => handleSupportAction('guides')} activeOpacity={0.7}>
                        <View style={styles.iconBox}>
                            <Ionicons name="book-outline" size={20} color={COLORS.white} />
                        </View>
                        <Text style={styles.itemText}>User Guides</Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.item} onPress={() => handleSupportAction('api')} activeOpacity={0.7}>
                        <View style={styles.iconBox}>
                            <Ionicons name="newspaper-outline" size={20} color={COLORS.white} />
                        </View>
                        <Text style={styles.itemText}>API Reference</Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <TouchableOpacity style={styles.item} onPress={() => handleSupportAction('email')} activeOpacity={0.7}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                            <Ionicons name="mail-outline" size={20} color="#3b82f6" />
                        </View>
                        <Text style={styles.itemText}>Email Support</Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.item} onPress={() => handleSupportAction('call')} activeOpacity={0.7}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                            <Ionicons name="call-outline" size={20} color="#10b981" />
                        </View>
                        <Text style={styles.itemText}>Call Us</Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 NovaEdge Digital Labs</Text>
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
        paddingVertical: 15,
        marginTop: Platform.OS === 'android' ? 10 : 0,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 10,
    },
    cardDesc: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textMuted,
        marginBottom: 15,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSoft,
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textMuted,
        opacity: 0.5,
    },
});

export default SupportScreen;
