import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import axios from 'axios';
import { CONFIG } from '../constants/config';

interface Listing {
    _id: string;
    businessName: string;
    logo: string;
    description: string;
    contactNumber: string;
    websiteUrl: string;
    slotNumber: number;
}

const FeaturedPartners = ({ navigation }: any) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/featured`);
            setListings(response.data.data);
        } catch (error) {
            console.error('Error fetching featured listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };

    const handleWebsite = (url: string) => {
        const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
        Linking.openURL(formattedUrl);
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator color={COLORS.primary} />
            </View>
        );
    }

    if (!loading && listings.length === 0) {
        return null; // Don't show the section if no active listings
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Featured Partners</Text>
                <View style={styles.badge}>
                    <Ionicons name="star" size={10} color={COLORS.white} />
                    <Text style={styles.badgeText}>INDORE PRIDE</Text>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {listings.map((item) => (
                    <View key={item._id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Image source={{ uri: item.logo }} style={styles.logo} />
                            <View style={styles.headerText}>
                                <Text style={styles.businessName} numberOfLines={1}>{item.businessName}</Text>
                                <View style={styles.partnerBadge}>
                                    <Text style={styles.partnerBadgeText}>Featured Partner</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.description} numberOfLines={2}>
                            {item.description}
                        </Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                                onPress={() => handleWebsite(item.websiteUrl)}
                            >
                                <Ionicons name="globe-outline" size={16} color={COLORS.white} />
                                <Text style={styles.actionBtnText}>Website</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: COLORS.backgroundSoft }]}
                                onPress={() => handleCall(item.contactNumber)}
                            >
                                <Ionicons name="call-outline" size={16} color={COLORS.white} />
                                <Text style={styles.actionBtnText}>Call</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={styles.advertiseCard}
                    onPress={() => navigation.navigate('BusinessInquiry')}
                >
                    <View style={styles.advertiseIcon}>
                        <Ionicons name="megaphone-outline" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.advertiseTitle}>Advertise Here</Text>
                    <Text style={styles.advertiseSubtitle}>Reach 50,000+ local users in Indore</Text>
                    <View style={styles.inquireBtn}>
                        <Text style={styles.inquireBtnText}>Inquire Now</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 20 },
    headerRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, marginBottom: 15, justifyContent: 'space-between'
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
    badge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
        borderWidth: 1, borderColor: '#FFD700'
    },
    badgeText: { color: '#FFD700', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
    scrollContent: { paddingHorizontal: 15, paddingBottom: 10 },
    card: {
        width: 280, backgroundColor: COLORS.backgroundSoft,
        borderRadius: 20, padding: 15, marginRight: 15,
        borderWidth: 1, borderColor: COLORS.border,
        ...COLORS.getGlow(COLORS.primary, 10, 0.05)
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    logo: { width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.background },
    headerText: { marginLeft: 12, flex: 1 },
    businessName: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    partnerBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4
    },
    partnerBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold' },
    description: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 15 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, flex: 0.48,
        justifyContent: 'center'
    },
    actionBtnText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
    advertiseCard: {
        width: 220, backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 20, padding: 20, justifyContent: 'center', alignItems: 'center',
        borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.primary + '40'
    },
    advertiseIcon: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: COLORS.primary + '10', justifyContent: 'center', alignItems: 'center',
        marginBottom: 15
    },
    advertiseTitle: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    advertiseSubtitle: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', marginBottom: 15 },
    inquireBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
        paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10
    },
    inquireBtnText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold', marginRight: 6 },
    loaderContainer: { height: 150, justifyContent: 'center', alignItems: 'center' }
});

export default FeaturedPartners;
