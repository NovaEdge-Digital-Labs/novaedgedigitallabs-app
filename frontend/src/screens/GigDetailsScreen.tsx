import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import { formatCurrency } from '../utils/helpers';

const { width } = Dimensions.get('window');

const GigDetailsScreen = ({ route, navigation }: any) => {
    const { id } = route.params;
    const [gig, setGig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGigDetails();
    }, [id]);

    const fetchGigDetails = async () => {
        try {
            const allGigs = await marketplaceApi.getGigs();
            const foundGig = allGigs.data.find((g: any) => g._id === id);
            setGig(foundGig);
        } catch (error) {
            console.error('Fetch gig details error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!gig) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>Gig not found</Text>
            </View>
        );
    }

    return (
        <ThemeWrapper>
            <View style={styles.topContainer}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Gig Details</Text>
                    <View style={{ width: 28 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Ionicons name="image-outline" size={80} color={COLORS.textMuted} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{gig.title}</Text>

                    <View style={styles.authorContainer}>
                        <View style={styles.authorInfo}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{gig.freelancerId?.name?.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text style={styles.authorName}>{gig.freelancerId?.name}</Text>
                                <Text style={styles.authorLevel}>Level 2 Seller</Text>
                            </View>
                        </View>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.ratingText}>4.9 (48 reviews)</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this gig</Text>
                        <Text style={styles.description}>{gig.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What's included</Text>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                            <Text style={styles.featureText}>High Quality Delivery</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                            <Text style={styles.featureText}>Unlimited Revisions</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.featureText}>3 Days Delivery</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerLabel}>Starting at</Text>
                    <Text style={styles.footerPrice}>{formatCurrency(gig.price)}</Text>
                </View>
                <TouchableOpacity style={styles.orderButton}>
                    <Text style={styles.orderButtonText}>Continue ({formatCurrency(gig.price)})</Text>
                </TouchableOpacity>
            </View>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    topContainer: {
        paddingTop: 50,
        paddingBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    container: {
        paddingBottom: 120,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textMuted,
    },
    imageContainer: {
        width: width,
        height: 250,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        lineHeight: 32,
        marginBottom: 16,
    },
    authorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        ...COLORS.getGlow(COLORS.primary, 5),
    },
    avatarText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    authorName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    authorLevel: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        color: COLORS.text,
        marginLeft: 4,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: COLORS.textMuted,
        lineHeight: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        fontSize: 15,
        color: COLORS.text,
        marginLeft: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.overlay,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 35,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    footerLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 2,
    },
    footerPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    orderButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: COLORS.geometry.radiusMedium,
        ...COLORS.getGlow(COLORS.primary),
    },
    orderButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GigDetailsScreen;
