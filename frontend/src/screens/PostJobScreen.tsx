import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import PrimaryButton from '../components/PrimaryButton';
import { formatCurrency } from '../utils/helpers';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuthStore } from '../store/authStore';
import { useAppConfigStore } from '../store/appConfigStore';

const defaultTiers = [
    {
        id: 'Basic',
        price: 999,
        days: 30,
        features: ['30 Days Visibility', 'Normal Feed Placement'],
        color: '#94A3B8'
    },
    {
        id: 'Featured',
        price: 1999,
        days: 45,
        features: ['45 Days Visibility', 'Top of Search', 'Featured Badge'],
        color: COLORS.primary
    },
    {
        id: 'Premium',
        price: 2999,
        days: 60,
        features: ['60 Days Visibility', 'Highlighted Badge', 'Instant Push Notification'],
        color: '#FFD700'
    },
];

const PostJobScreen = ({ navigation }: any) => {
    const [step, setStep] = useState(1);
    const [tierList, setTierList] = useState<any[]>(defaultTiers);
    const [selectedTier, setSelectedTier] = useState<any>(defaultTiers[2]); // Default Premium Listing
    const [loading, setLoading] = useState(false);
    const user = useAuthStore((state) => state.user);
    const { config } = useAppConfigStore();

    React.useEffect(() => {
        const loadLivePricing = async () => {
            try {
                const res = await marketplaceApi.getPublicPricing();
                if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    const jobTiers = res.data.filter((t: any) => t.category === 'job_posting');
                    if (jobTiers.length > 0) {
                        const mapped = jobTiers.map((t: any) => ({
                            id: t.tierId,
                            price: t.price,
                            days: t.durationDays || 30,
                            features: t.features || [],
                            color: t.tierId === 'Premium' ? '#FFD700' : t.tierId === 'Featured' ? COLORS.primary : '#94A3B8'
                        }));
                        setTierList(mapped);
                        setSelectedTier(mapped[mapped.length - 1]);
                    }
                }
            } catch (e) {
                console.log('Using default pricing fallback');
            }
        };
        loadLivePricing();
    }, []);

    // Form States
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [jobType, setJobType] = useState('Full-time');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [description, setDescription] = useState('');

    const isBusinessUser = user?.plan === 'business' || user?.plan === 'pro';

    const showAlert = (alertTitle: string, message: string, onConfirm?: () => void) => {
        if (Platform.OS === 'web') {
            window.alert(`${alertTitle}\n\n${message}`);
            if (onConfirm) onConfirm();
        } else {
            Alert.alert(alertTitle, message, [
                { text: 'OK', onPress: onConfirm }
            ]);
        }
    };

    const handlePayment = async () => {
        if (!user) {
            showAlert('Authentication Required', 'Please login to post a job.', () => navigation.navigate('Profile'));
            return;
        }

        if (!title.trim() || !location.trim() || !description.trim()) {
            showAlert('Missing Information', 'Please fill in Job Title, Location, and Job Description.');
            return;
        }

        setLoading(true);
        try {
            const activeTier = selectedTier || tierList[2] || defaultTiers[2];
            const parsedSkills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

            const jobData = {
                title: title.trim(),
                location: location.trim(),
                jobType,
                salaryRange: { min: Number(minSalary) || 0, max: Number(maxSalary) || 0 },
                skillsRequired: parsedSkills,
                experienceLevel: experience.trim() || '',
                websiteUrl: websiteUrl.trim() || '',
                description: description.trim(),
                listingType: activeTier.id || 'Premium'
            };

            // Business / Pro plans publish for free. The server re-checks the plan —
            // it no longer trusts a client-supplied "free" order id.
            if (isBusinessUser) {
                await marketplaceApi.publishJob({ jobData });

                setLoading(false);
                showAlert(
                    `${activeTier.id} listing published`,
                    `Your ${activeTier.id} listing is live for ${activeTier.days} days (free on your ${user.plan} plan).`,
                    () => {
                        navigation.navigate('JobFeed');
                    }
                );
                return;
            }

            if (Platform.OS === 'web') {
                setLoading(false);
                showAlert(
                    'Use the mobile app to pay',
                    'Razorpay checkout is only available in the NovaEdge mobile app. Open the app to publish a paid listing, or upgrade to Business for free listings.'
                );
                return;
            }

            // Mobile Native Razorpay Flow for normal free tier accounts
            const order = await marketplaceApi.createJobOrder(activeTier.id);

            if (order && order.isFree) {
                await marketplaceApi.publishJob({ jobData });

                setLoading(false);
                showAlert(
                    `${activeTier.id} listing published`,
                    `Your ${activeTier.id} listing is live for ${activeTier.days} days.`,
                    () => {
                        navigation.navigate('JobFeed');
                    }
                );
                return;
            }

            if (!order?.orderId || !order?.keyId) {
                throw new Error('Could not start checkout. Please try again.');
            }

            const options = {
                description: `Job Listing: ${title} (${activeTier.id})`,
                image: config?.defaultImage || 'https://novaedgedigitallabs.tech/logo.png',
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

            RazorpayCheckout.open(options).then(async (data: any) => {
                const razorpayResponse = {
                    razorpayOrderId: data.razorpay_order_id,
                    razorpayPaymentId: data.razorpay_payment_id,
                    razorpaySignature: data.razorpay_signature,
                };

                await marketplaceApi.publishJob({
                    ...razorpayResponse,
                    jobData
                });

                setLoading(false);
                showAlert(
                    `${activeTier.id} listing published`,
                    `Payment received. Your ${activeTier.id} listing is live for ${activeTier.days} days.`,
                    () => navigation.navigate('JobFeed')
                );
            }).catch((error: any) => {
                console.log('Payment failed:', error);
                setLoading(false);
                showAlert('Payment Cancelled', error.description || 'Transaction cancelled');
            });
        } catch (error: any) {
            console.error('Publish error:', error);
            setLoading(false);
            if (error?.response?.status === 401) {
                showAlert('Session Expired', 'Your session has expired. Please log in again to post a job.', () => navigation.navigate('Profile'));
            } else {
                const errMsg = error?.response?.data?.message || error?.message || 'An error occurred while publishing.';
                showAlert('Publish Error', errMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStep1JobInfo = () => (
        <View>
            <Text style={styles.sectionTitle}>Job Information</Text>

            <Text style={styles.fieldLabel}>Job Title <Text style={styles.requiredMark}>*</Text></Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Senior Backend Engineer"
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Location <Text style={styles.requiredMark}>*</Text></Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Remote, India"
                placeholderTextColor={COLORS.textMuted}
                value={location}
                onChangeText={setLocation}
            />

            <Text style={styles.fieldLabel}>Salary Range (₹ / month)</Text>
            <View style={styles.row}>
                <TextInput
                    style={[styles.input, { flex: 1, marginRight: 10 }]}
                    placeholder="Min (e.g. 60000)"
                    placeholderTextColor={COLORS.textMuted}
                    value={minSalary}
                    onChangeText={setMinSalary}
                    keyboardType="numeric"
                />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Max (e.g. 120000)"
                    placeholderTextColor={COLORS.textMuted}
                    value={maxSalary}
                    onChangeText={setMaxSalary}
                    keyboardType="numeric"
                />
            </View>

            <Text style={styles.fieldLabel}>Required Skills</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Node.js, MongoDB, AWS (comma separated)"
                placeholderTextColor={COLORS.textMuted}
                value={skills}
                onChangeText={setSkills}
            />

            <Text style={styles.fieldLabel}>Experience Level</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. 3-5 yrs"
                placeholderTextColor={COLORS.textMuted}
                value={experience}
                onChangeText={setExperience}
            />

            <Text style={styles.fieldLabel}>Company Website / Apply Link</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. https://yourcompany.com/careers"
                placeholderTextColor={COLORS.textMuted}
                value={websiteUrl}
                onChangeText={setWebsiteUrl}
                autoCapitalize="none"
                keyboardType="url"
            />

            <Text style={styles.fieldLabel}>Job Description <Text style={styles.requiredMark}>*</Text></Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
            />

            <PrimaryButton
                title="Next: Choose Tier & Publish"
                onPress={handleNextToTier}
                style={styles.nextButton}
                textStyle={styles.nextButtonText}
            />
        </View>
    );

    const renderStep2TierSelection = () => (
        <View>
            <View style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', borderWidth: 1, borderColor: '#34d399', padding: 12, borderRadius: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={20} color="#34d399" style={{ marginRight: 8 }} />
                <Text style={{ color: '#34d399', fontWeight: 'bold', fontSize: 13, flex: 1 }}>
                    {isBusinessUser ? 'BUSINESS PLAN ACTIVE: All Listing Tiers are 100% FREE!' : 'CHOOSE YOUR LISTING PLAN'}
                </Text>
            </View>
            
            <Text style={styles.sectionTitle}>Select Listing Type</Text>
            {tierList.map(tier => (
                <TouchableOpacity
                    key={tier.id}
                    style={[styles.tierCard, selectedTier?.id === tier.id && { borderColor: tier.color, borderWidth: 2 }]}
                    onPress={() => setSelectedTier(tier)}
                >
                    <View style={styles.tierHeader}>
                        <Text style={styles.tierName}>{tier.id} Listing</Text>
                        <Text style={[styles.tierPrice, { color: isBusinessUser ? '#34d399' : tier.color }]}>
                            {isBusinessUser ? 'FREE (Business)' : formatCurrency(tier.price)}
                        </Text>
                    </View>
                    <View style={styles.featuresList}>
                        {tier.features.map((f: string, i: number) => (
                            <View key={i} style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={16} color={tier.color} />
                                <Text style={styles.featureText}>{f}</Text>
                            </View>
                        ))}
                    </View>
                </TouchableOpacity>
            ))}

            <PrimaryButton
                title={loading ? 'Publishing Listing...' : isBusinessUser ? `Publish ${selectedTier?.id || 'Job'} (FREE)` : `Publish ${selectedTier?.id || 'Job'} (${formatCurrency(selectedTier?.price || 0)})`}
                onPress={handlePayment}
                loading={loading}
                style={styles.payButton}
                textStyle={styles.payButtonText}
            />
        </View>
    );

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(1)} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{step === 1 ? 'Step 1: Job Details' : 'Step 2: Choose Tier & Publish'}</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {step === 1 ? renderStep1JobInfo() : renderStep2TierSelection()}
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
    backBtn: {
        padding: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 15,
    },
    tierCard: {
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tierHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    tierName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    tierPrice: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    featuresList: {
        gap: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureText: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    nextButton: {
        marginTop: 15,
    },
    disabledButton: {
        opacity: 0.5,
    },
    nextButtonText: {
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 14,
        color: COLORS.white,
        fontSize: 14,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    payButton: {
        marginTop: 10,
        backgroundColor: COLORS.primary,
    },
    payButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 6,
    },
    requiredMark: {
        color: COLORS.error,
        fontWeight: '700',
    },
});

export default PostJobScreen;
