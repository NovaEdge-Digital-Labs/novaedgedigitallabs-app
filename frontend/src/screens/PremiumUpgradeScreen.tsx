import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import PrimaryButton from '../components/PrimaryButton';
import { formatCurrency } from '../utils/helpers';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuthStore } from '../store/authStore';

const PremiumUpgradeScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [passPrice, setPassPrice] = useState<number>(499);
    const [passTitle, setPassTitle] = useState<string>('Premium Candidate Pass');
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchStatusAndPricing = async () => {
            try {
                const res = await marketplaceApi.getPremiumStatus();
                setStatus(res);

                const pricingRes = await marketplaceApi.getPublicPricing();
                if (pricingRes?.data && Array.isArray(pricingRes.data)) {
                    const seekerTier = pricingRes.data.find((t: any) => t.category === 'seeker_membership' || t.tierId === 'ProSeeker');
                    if (seekerTier) {
                        setPassPrice(seekerTier.price || 499);
                        setPassTitle(seekerTier.name || 'Premium Candidate Pass');
                    }
                }
            } catch (e) {
                console.log('Error fetching status/pricing:', e);
            }
        };
        fetchStatusAndPricing();
    }, []);

    const handleUpgrade = async () => {
        if (!user) {
            Alert.alert('Authentication Required', 'Please login to upgrade your account.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => navigation.navigate('Profile') }
            ]);
            return;
        }

        setLoading(true);
        try {
            const order = await marketplaceApi.createPremiumSeekerOrder();

            const options = {
                description: `${passTitle} Upgrade`,
                image: 'https://novaedgedigitallabs.tech/logo.png',
                currency: 'INR',
                key: order?.keyId || 'rzp_test_dummy',
                amount: passPrice * 100,
                name: 'NovaEdge Digital Labs',
                order_id: order.orderId,
                prefill: {
                    email: user.email,
                    contact: '',
                    name: user.name
                },
                theme: { color: COLORS.primary }
            };

            RazorpayCheckout.open(options).then(async (data: any) => {
                const razorpayResponse = {
                    razorpayOrderId: data.razorpay_order_id,
                    razorpayPaymentId: data.razorpay_payment_id,
                    razorpaySignature: data.razorpay_signature,
                };

                await marketplaceApi.verifyPremiumSeeker(razorpayResponse);
                Alert.alert('Welcome to Premium Candidate Pass! 🎉', 'Your profile now has priority placement and a verified badge.', [
                    { text: 'Awesome', onPress: () => navigation.goBack() }
                ]);
            }).catch((error: any) => {
                console.log('Payment failed:', error);
                Alert.alert('Payment Failed', error.description || 'Transaction cancelled');
            });
        } catch (error: any) {
            console.error('Upgrade error:', error);
            Alert.alert('Payment Error', error.message || 'Failed to initiate upgrade');
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        { icon: 'trending-up', title: 'Priority Rank Placement', desc: 'Your applications appear at the very top of recruiters candidate feeds.' },
        { icon: 'ribbon-outline', title: 'Verified Candidate Badge', desc: 'Get an exclusive glowing verified checkmark on your profile.' },
        { icon: 'notifications-outline', title: 'Early Access Alerts', desc: 'Get notified about high-paying job openings before non-pass users.' },
        { icon: 'eye-outline', title: 'Direct Employer Contact', desc: 'Allow recruiters to view your full profile and contact you directly.' }
    ];

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{passTitle}</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroCard}>
                    <Ionicons name="star" size={46} color="#FFD700" />
                    <Text style={styles.heroTitle}>{passTitle}</Text>
                    <Text style={styles.heroPrice}>{formatCurrency(passPrice)} <Text style={styles.perMonth}>/ month</Text></Text>
                </View>

                <View style={styles.benefitsSection}>
                    {benefits.map((b, i) => (
                        <View key={i} style={styles.benefitItem}>
                            <View style={styles.iconContainer}>
                                <Ionicons name={b.icon as any} size={22} color={COLORS.accent || '#C042FF'} />
                            </View>
                            <View style={styles.benefitText}>
                                <Text style={styles.btnTitle}>{b.title}</Text>
                                <Text style={styles.btnDesc}>{b.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <PrimaryButton
                    title={`Get Pass for ${formatCurrency(passPrice)}`}
                    onPress={handleUpgrade}
                    loading={loading}
                    style={styles.upgradeBtn}
                />

                <Text style={styles.cancelText}>Cancel anytime. Secure checkout via Razorpay.</Text>
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
        paddingTop: 50,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    content: {
        padding: 20,
    },
    heroCard: {
        borderRadius: 24,
        padding: 26,
        alignItems: 'center',
        marginBottom: 28,
        backgroundColor: 'rgba(145, 39, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(192, 66, 255, 0.35)',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 12,
        marginBottom: 4,
    },
    heroPrice: {
        fontSize: 34,
        fontWeight: '900',
        color: COLORS.white,
    },
    perMonth: {
        fontSize: 15,
        fontWeight: 'normal',
        color: COLORS.textMuted,
    },
    benefitsSection: {
        gap: 20,
        marginBottom: 36,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: 'rgba(145, 39, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
        borderColor: 'rgba(192, 66, 255, 0.3)',
    },
    benefitText: {
        flex: 1,
    },
    btnTitle: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    btnDesc: {
        color: COLORS.textMuted,
        fontSize: 13,
        lineHeight: 19,
    },
    upgradeBtn: {
        height: 54,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cancelText: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 15,
        marginBottom: 30,
    }
});

export default PremiumUpgradeScreen;
