import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import ThemeWrapper from '../components/ThemeWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';
import { paymentApi } from '../api/paymentApi';

const PLANS = [
    {
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        features: [
            'Basic Job & Gig Browsing',
            '10 Image Compressions / day',
            '5 QR Codes / month',
            'Community Support',
        ],
        buttonText: 'Current Plan',
        isCurrent: true,
        color: '#94a3b8',
    },
    {
        name: 'Pro',
        price: { monthly: 149, yearly: 999 },
        features: [
            'Featured Gig Placement on Marketplace',
            'Unlimited Image Compression & QR Codes',
            'GST, EMI & Developer Tools',
            'Invoice & Proposal Generator',
            'Ad-free experience',
            'Priority Email Support',
        ],
        buttonText: 'Upgrade to Pro',
        isCurrent: false,
        color: COLORS.primary,
        badge: 'Popular',
    },
    {
        name: 'Business',
        price: { monthly: 349, yearly: 2499 },
        features: [
            '🎉 Unlimited Premium Job Listings (₹2,999 each — 100% FREE)',
            'Applicant Tracking & Hiring Dashboard',
            'Everything in Pro',
            'Batch Invoice & Proposal Generation',
            'Custom Resume & Portfolio Builder',
            'Dedicated Hiring Support',
        ],
        buttonText: 'Get Business',
        isCurrent: false,
        color: COLORS.secondary,
    },
];

const SubscriptionScreen = () => {
    const navigation = useNavigation();
    const { user, updateUser } = useAuthStore();
    const [isYearly, setIsYearly] = useState(false);
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);
    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    const startCheckout = async (planKey: 'pro' | 'business', planName: string) => {
        if (!user) return;

        const billingCycle = isYearly ? 'yearly' : 'monthly';
        setProcessingPlan(planKey);

        try {
            // The server owns the price: it looks up PRICING[plan][billingCycle],
            // creates the Razorpay order and records a pending Subscription.
            const order = await paymentApi.createOrder(planKey, billingCycle);

            if (!order?.orderId || !order?.keyId) {
                throw new Error('Payment could not be initialised. Please try again.');
            }

            const options = {
                description: `NovaEdge ${planName} — ${billingCycle}`,
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

            // Plan is granted only after the server verifies the signature.
            const verified = await paymentApi.verifyPayment({
                razorpayOrderId: data.razorpay_order_id,
                razorpayPaymentId: data.razorpay_payment_id,
                razorpaySignature: data.razorpay_signature,
            });

            if (!verified?.success) {
                throw new Error(verified?.message || 'Payment verification failed.');
            }

            updateUser({ plan: planKey, planExpiry: verified.subscription?.endDate });
            setProcessingPlan(null);
            Alert.alert(
                'You are on ' + planName,
                `Payment received. Your ${planName} plan is active${isYearly ? ' for 12 months' : ' for 30 days'}.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            setProcessingPlan(null);

            // RazorpayCheckout rejects with { code, description } when the user cancels.
            if (error?.code || error?.description) {
                Alert.alert('Payment Cancelled', error.description || 'The transaction was not completed.');
                return;
            }

            if (error?.response?.status === 401) {
                Alert.alert('Session Expired', 'Please log in again to upgrade your plan.');
                return;
            }

            Alert.alert(
                'Payment Error',
                error?.response?.data?.message || error?.message || 'Something went wrong. You have not been charged.'
            );
        }
    };

    const handlePlanSelect = (planName: string) => {
        const planKey = planName.toLowerCase() as 'free' | 'pro' | 'business';

        if (planKey === user?.plan) {
            Alert.alert('Current Plan', `You are already on the ${planName} plan.`);
            return;
        }

        if (planKey === 'free') {
            Alert.alert('Free Plan', 'You are already able to use the free tier. Cancel a paid plan from Support if needed.');
            return;
        }

        if (!user) {
            Alert.alert('Login Required', 'Please log in to upgrade your plan.');
            return;
        }

        Alert.alert(
            'Upgrade Plan',
            `Confirm upgrade to ${planName} ${isYearly ? 'Yearly' : 'Monthly'} plan?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Pay Now', onPress: () => startCheckout(planKey, planName) }
            ]
        );
    };

    const renderPlanCard = (plan: any) => {
        const price = isYearly ? plan.price.yearly : plan.price.monthly;
        const isPro = plan.name === 'Pro';
        const isCurrentPlan = user?.plan === plan.name.toLowerCase();
        const isProcessing = processingPlan === plan.name.toLowerCase();

        return (
            <View
                key={plan.name}
                style={[
                    styles.planCard,
                    plan.badge && styles.popularCard,
                    COLORS.getGlow(isPro ? COLORS.primary : COLORS.white, 12, 0.15)
                ]}
            >
                {isPro && (
                    <LinearGradient
                        colors={primaryGradient}
                        style={[StyleSheet.absoluteFill, { borderRadius: 24, opacity: 0.1 }]}
                    />
                )}
                {plan.badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{plan.badge}</Text>
                    </View>
                )}
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.currency}>₹</Text>
                    <Text style={styles.price}>{price}</Text>
                    <Text style={styles.period}>/{isYearly ? 'year' : 'month'}</Text>
                </View>

                <View style={styles.featuresList}>
                    {plan.features.map((feature: string, index: number) => (
                        <View key={index} style={styles.featureItem}>
                            <Ionicons name="checkmark-sharp" size={18} color={plan.color} />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[
                        styles.planButton,
                        { backgroundColor: isCurrentPlan ? COLORS.backgroundSoft : plan.color },
                        !isCurrentPlan && COLORS.getGlow(plan.color, 15, 0.4)
                    ]}
                    disabled={isCurrentPlan || processingPlan !== null}
                    activeOpacity={0.7}
                    onPress={() => handlePlanSelect(plan.name)}
                >
                    <Text style={[styles.planButtonText, { color: isCurrentPlan ? COLORS.textMuted : 'white' }]}>
                        {isCurrentPlan ? 'Current Plan' : isProcessing ? 'Opening Razorpay…' : plan.buttonText}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <ThemeWrapper>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Simple Pricing</Text>
                    <Text style={styles.subtitle}>Unlock premium tools and scale your productivity.</Text>
                </View>

                <View style={styles.billingToggle}>
                    <Text style={[styles.toggleLabel, !isYearly && styles.activeToggle]}>Monthly</Text>
                    <Switch
                        value={isYearly}
                        onValueChange={setIsYearly}
                        trackColor={{ false: COLORS.backgroundSoft, true: COLORS.primary }}
                        thumbColor="white"
                        ios_backgroundColor={COLORS.backgroundSoft}
                    />
                    <View style={styles.yearlyLabelContainer}>
                        <Text style={[styles.toggleLabel, isYearly && styles.activeToggle]}>Yearly</Text>
                        <View style={styles.saveBadge}>
                            <Text style={styles.saveText}>Save 40%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.plansContainer}>
                    {PLANS.map(renderPlanCard)}
                </View>

                <View style={styles.footer}>
                    <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} style={{ opacity: 0.8 }} />
                    <Text style={styles.footerText}>Secure 256-bit SSL Encrypted Payments via Razorpay</Text>
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
    header: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 10,
        marginBottom: 10,
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.white,
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    billingToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: 'transparent',
        padding: 12,
        borderRadius: 40,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    toggleLabel: {
        fontSize: 15,
        color: COLORS.textMuted,
        marginHorizontal: 12,
    },
    activeToggle: {
        color: COLORS.white,
        fontWeight: '800',
    },
    yearlyLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveBadge: {
        backgroundColor: 'transparent',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
    },
    saveText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    plansContainer: {
        gap: 25,
    },
    planCard: {
        ...COLORS.glass,
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
    },
    popularCard: {
        borderColor: COLORS.primary + '60',
        borderWidth: 2,
    },
    badge: {
        position: 'absolute',
        top: 20,
        right: -30,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 40,
        paddingVertical: 6,
        transform: [{ rotate: '45deg' }],
    },
    badgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    planName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 15,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 25,
    },
    currency: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.white,
        marginRight: 4,
    },
    price: {
        fontSize: 48,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -1,
    },
    period: {
        fontSize: 16,
        color: COLORS.textMuted,
        marginLeft: 6,
    },
    featuresList: {
        marginBottom: 30,
        backgroundColor: 'transparent',
        padding: 15,
        borderRadius: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    featureText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginLeft: 12,
    },
    planButton: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    planButtonText: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 50,
        alignItems: 'center',
        marginBottom: 30,
        padding: 20,
        backgroundColor: 'transparent',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    footerText: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default SubscriptionScreen;
