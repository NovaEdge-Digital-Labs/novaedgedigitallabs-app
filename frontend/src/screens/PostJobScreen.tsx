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

const defaultTiers = [
    {
        id: 'Basic',
        price: 999,
        days: 30,
        features: ['30 Days Visibility', 'Normal Feed Placement'],
        color: COLORS.primary
    },
    {
        id: 'Featured',
        price: 1999,
        days: 30,
        features: ['30 Days Visibility', 'Featured Highlight Badge', 'Priority Search Placement', 'Direct Candidate Email Alerts'],
        color: COLORS.primary
    },
    {
        id: 'Premium',
        price: 2999,
        days: 60,
        features: ['60 Days Visibility', 'Highlighted Badge', 'Instant Push Notification'],
        color: COLORS.primary
    },
];

const PostJobScreen = ({ navigation }: any) => {
    const [step, setStep] = useState(1);
    const [tierList, setTierList] = useState<any[]>(defaultTiers);
    const [selectedTier, setSelectedTier] = useState<any>(defaultTiers[2]); // Default Premium Listing
    const [loading, setLoading] = useState(false);
    const user = useAuthStore((state) => state.user);

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
            const parsedSkills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : ['Node.js', 'React'];

            const jobData = {
                title: title.trim(),
                location: location.trim(),
                jobType,
                salaryRange: { min: Number(minSalary) || 0, max: Number(maxSalary) || 0 },
                skillsRequired: parsedSkills,
                experienceLevel: experience.trim() || '1-3 yrs',
                websiteUrl: websiteUrl.trim() || 'https://novaedgedigitallabs.tech',
                description: description.trim(),
                listingType: activeTier.id || 'Premium'
            };

            // Entitlement is the server's call. This used to publish directly
            // with forged `FREE_BUSINESS_*` ids whenever the client believed the
            // user was on a business plan — or simply because it was running on
            // web — which the backend accepted as proof of payment.
            // Mobile Native Razorpay Flow for normal free tier accounts
            const order = await marketplaceApi.createJobOrder(activeTier.id);

            // Server says this account posts free: publish with no payment
            // fields at all, rather than inventing placeholder ids.
            if (order && order.isFree) {
                await marketplaceApi.publishJob({ jobData });

                setLoading(false);
                showAlert('🎉 Job Published!', 'Your listing is now live!', () => {
                    navigation.navigate('JobFeed');
                });
                return;
            }

            if (!order?.orderId || !order?.keyId) {
                throw new Error('Could not start payment. Please try again shortly.');
            }

            const options = {
                description: `Job Listing: ${title} (${activeTier.id})`,
                image: 'https://novaedgedigitallabs.tech/logo.png',
                currency: 'INR',
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
                showAlert('Success', 'Your job has been posted!', () => navigation.navigate('JobFeed'));
            }).catch((error: any) => {
                console.log('Payment failed:', error);
                setLoading(false);
                showAlert('Payment Cancelled', error.description || 'Transaction cancelled');
            });
        } catch (error: any) {
            console.error('Publish error:', error);
            setLoading(false);
            const errMsg = error?.response?.data?.message || error?.message || 'An error occurred while publishing.';
            showAlert('Publish Error', errMsg);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View>
            <View style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', borderWidth: 1, borderColor: '#34d399', padding: 12, borderRadius: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={20} color="#34d399" style={{ marginRight: 8 }} />
                <Text style={{ color: '#34d399', fontWeight: 'bold', fontSize: 13, flex: 1 }}>
                    {isBusinessUser ? 'BUSINESS PLAN ACTIVE: Premium Listings are 100% FREE!' : 'UNLOCK PREMIUM LISTING ACCESS'}
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
                title="Next: Job Details"
                onPress={() => setStep(2)}
                disabled={!selectedTier}
                style={[styles.nextButton, !selectedTier && styles.disabledButton]}
                textStyle={styles.nextButtonText}
            />
        </View>
    );

    const renderStep2 = () => (
        <View>
            <Text style={styles.sectionTitle}>Job Information</Text>

            <TextInput
                style={styles.input}
                placeholder="Job Title (e.g. Senior Backend Engineer)"
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Location (e.g. Remote, India)"
                placeholderTextColor={COLORS.textMuted}
                value={location}
                onChangeText={setLocation}
            />

            <View style={styles.row}>
                <TextInput
                    style={[styles.input, { flex: 1, marginRight: 10 }]}
                    placeholder="Min Salary (e.g. 60000)"
                    placeholderTextColor={COLORS.textMuted}
                    value={minSalary}
                    onChangeText={setMinSalary}
                    keyboardType="numeric"
                />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Max Salary (e.g. 120000)"
                    placeholderTextColor={COLORS.textMuted}
                    value={maxSalary}
                    onChangeText={setMaxSalary}
                    keyboardType="numeric"
                />
            </View>

            <TextInput
                style={styles.input}
                placeholder="Required Skills (e.g. Node.js, MongoDB, AWS)"
                placeholderTextColor={COLORS.textMuted}
                value={skills}
                onChangeText={setSkills}
            />
            <TextInput
                style={styles.input}
                placeholder="Experience Level (e.g. 3-5 yrs)"
                placeholderTextColor={COLORS.textMuted}
                value={experience}
                onChangeText={setExperience}
            />
            <TextInput
                style={styles.input}
                placeholder="Company Website / Apply Link (e.g. https://novaedgedigitallabs.tech)"
                placeholderTextColor={COLORS.textMuted}
                value={websiteUrl}
                onChangeText={setWebsiteUrl}
                autoCapitalize="none"
                keyboardType="url"
            />

            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Looking for an experienced backend engineer..."
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
            />

            <PrimaryButton
                title={loading ? 'Publishing Premium Listing...' : isBusinessUser ? `Publish ${selectedTier?.id || 'Premium'} Listing (FREE)` : `Publish ${selectedTier?.id || 'Premium'} Listing`}
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
                <Text style={styles.headerTitle}>{step === 1 ? 'Step 1: Choose Tier' : 'Step 2: Details'}</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {step === 1 ? renderStep1() : renderStep2()}
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
});

export default PostJobScreen;
