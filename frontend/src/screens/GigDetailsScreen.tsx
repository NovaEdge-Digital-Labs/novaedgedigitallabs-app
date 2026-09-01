import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import { formatCurrency } from '../utils/helpers';
import { shareContent } from '../utils/shareHelper';
import HowEscrowWorksModal from '../components/HowEscrowWorksModal';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

const GigDetailsScreen = ({ route, navigation }: any) => {
    const { id } = route.params;
    const [gig, setGig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(false);
    const [showEscrowModal, setShowEscrowModal] = useState(false);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        fetchGigDetails();
    }, [id]);

    const fetchGigDetails = async () => {
        try {
            const response = await marketplaceApi.getGigById(id);
            setGig(response.data);
        } catch (error) {
            console.error('Fetch gig details error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = async () => {
        if (!user) {
            Alert.alert('Login Required', 'Please log in to order this gig.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => navigation.navigate('Profile') }
            ]);
            return;
        }

        setOrdering(true);
        try {
            // Server creates the Razorpay order + a pending escrow contract.
            const order = await marketplaceApi.orderGig(id);

            if (!order?.orderId || !order?.keyId) {
                throw new Error('Could not start checkout. Please try again.');
            }

            const options = {
                description: `Gig: ${gig.title}`,
                image: 'https://novaedgedigitallabs.tech/logo.png',
                currency: order.currency || 'INR',
                key: order.keyId,
                amount: order.amount,
                name: 'NovaEdge Digital Labs',
                order_id: order.orderId,
                prefill: {
                    email: user.email,
                    contact: '',
                    name: user.name
                },
                theme: { color: COLORS.primary }
            };

            const data: any = await RazorpayCheckout.open(options);

            await marketplaceApi.verifyEscrow({
                razorpayOrderId: data.razorpay_order_id,
                razorpayPaymentId: data.razorpay_payment_id,
                razorpaySignature: data.razorpay_signature,
                contractId: order.contractId
            });

            setOrdering(false);
            Alert.alert(
                'Order placed',
                `Your payment is held in escrow. ${gig.freelancerId?.name || 'The freelancer'} has ${gig.deliveryDays} day${gig.deliveryDays === 1 ? '' : 's'} to deliver — the money is released only after you approve the work.`,
                [{ text: 'OK' }]
            );
            fetchGigDetails();
        } catch (error: any) {
            setOrdering(false);

            // RazorpayCheckout rejects with { code, description } when the user cancels.
            if (error?.code || error?.description) {
                Alert.alert('Payment Cancelled', error.description || 'The transaction was not completed.');
                return;
            }

            Alert.alert(
                'Order Failed',
                error?.response?.data?.message || error?.message || 'Something went wrong. You have not been charged.'
            );
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

    const profile = gig.freelancerProfile;
    const reviewCount = profile?.totalReviews || 0;
    const isOwnGig = user?.id === (gig.freelancerId?._id || gig.freelancerId);

    return (
        <ThemeWrapper>
            <View style={styles.topContainer}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Gig Details</Text>
                    <TouchableOpacity
                        onPress={() => shareContent({ title: gig.title, description: gig.description, category: gig.category || 'Freelance Gig', type: 'Gig' })}
                        style={styles.backButton}
                    >
                        <Ionicons name="share-social-outline" size={22} color={COLORS.white} />
                    </TouchableOpacity>
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
                                <View style={styles.nameRow}>
                                    <Text style={styles.authorName}>{gig.freelancerId?.name}</Text>
                                    {profile?.isVerified && (
                                        <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} style={{ marginLeft: 5 }} />
                                    )}
                                </View>
                                <Text style={styles.authorLevel}>
                                    {profile?.title || `${gig.totalOrders || 0} order${gig.totalOrders === 1 ? '' : 's'} completed`}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.ratingContainer}>
                            {reviewCount > 0 ? (
                                <>
                                    <Ionicons name="star" size={16} color="#FFD700" />
                                    <Text style={styles.ratingText}>
                                        {profile.rating} ({reviewCount} review{reviewCount === 1 ? '' : 's'})
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.noReviewsText}>No reviews yet</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this gig</Text>
                        <Text style={styles.description}>{gig.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What's included</Text>
                        {(gig.features || []).length > 0 ? (
                            gig.features.map((feature: string, index: number) => (
                                <View key={index} style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.description}>
                                The freelancer has not listed separate deliverables — see the description above.
                            </Text>
                        )}
                        <View style={styles.featureItem}>
                            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.featureText}>
                                {gig.deliveryDays} day{gig.deliveryDays === 1 ? '' : 's'} delivery
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.escrowNote}
                        onPress={() => setShowEscrowModal(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="lock-closed" size={18} color={COLORS.primary} />
                        <Text style={styles.escrowText}>
                            Your payment is held in escrow. {gig.freelancerId?.name || 'The freelancer'} is paid only after you approve the delivered work. <Text style={{ textDecorationLine: 'underline', fontWeight: 'bold' }}>Learn more</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerLabel}>Fixed price</Text>
                    <Text style={styles.footerPrice}>{formatCurrency(gig.price)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.orderButton, (ordering || isOwnGig) && styles.orderButtonDisabled]}
                    onPress={handleOrder}
                    disabled={ordering || isOwnGig}
                    activeOpacity={0.8}
                >
                    {ordering ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.orderButtonText}>
                            {isOwnGig ? 'Your gig' : `Order — ${formatCurrency(gig.price)}`}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
            <HowEscrowWorksModal
                visible={showEscrowModal}
                onClose={() => setShowEscrowModal(false)}
            />
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
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    noReviewsText: {
        fontSize: 13,
        color: COLORS.textMuted,
    },
    escrowNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: COLORS.geometry.radiusMedium,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
    },
    escrowText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
        color: COLORS.textMuted,
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
        minHeight: 48,
        justifyContent: 'center',
        alignItems: 'center',
        ...COLORS.getGlow(COLORS.primary),
    },
    orderButtonDisabled: {
        opacity: 0.5,
    },
    orderButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GigDetailsScreen;
