import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import PrimaryButton from '../components/PrimaryButton';

const tiers = [
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
    const [selectedTier, setSelectedTier] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form States
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [jobType, setJobType] = useState('Full-time');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('');
    const [description, setDescription] = useState('');

    const handlePayment = async () => {
        if (!selectedTier || !title || !location || !description) {
            Alert.alert('Error', 'Please fill in all essential fields');
            return;
        }

        setLoading(true);
        try {
            // 1. Create order
            const order = await marketplaceApi.createJobOrder(selectedTier.id);

            // 2. Razorpay handle (Mock for now, assume success)
            // Real implementation would use Razorpay Checkout module

            const razorpayResponse = {
                razorpayOrderId: order.orderId,
                razorpayPaymentId: 'pay_mock_' + Date.now(),
                razorpaySignature: 'sig_mock_' + Date.now(),
            };

            const jobData = {
                title,
                location,
                jobType,
                salaryRange: { min: Number(minSalary), max: Number(maxSalary) },
                skillsRequired: skills.split(',').map(s => s.trim()),
                experienceLevel: experience,
                description,
                listingType: selectedTier.id
            };

            await marketplaceApi.publishJob({
                ...razorpayResponse,
                jobData
            });

            Alert.alert('Success', 'Your job has been posted!', [
                { text: 'Great!', onPress: () => navigation.navigate('JobFeed') }
            ]);
        } catch (error: any) {
            Alert.alert('Payment Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View>
            <Text style={styles.sectionTitle}>Select Listing Type</Text>
            {tiers.map(tier => (
                <TouchableOpacity
                    key={tier.id}
                    style={[styles.tierCard, selectedTier?.id === tier.id && { borderColor: tier.color, borderWidth: 2 }]}
                    onPress={() => setSelectedTier(tier)}
                >
                    <View style={styles.tierHeader}>
                        <Text style={styles.tierName}>{tier.id} Listing</Text>
                        <Text style={[styles.tierPrice, { color: tier.color }]}>₹{tier.price}</Text>
                    </View>
                    <View style={styles.featuresList}>
                        {tier.features.map((f, i) => (
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

            <TextInput style={styles.input} placeholder="Job Title (e.g. Backend Engineer)" placeholderTextColor={COLORS.textMuted} value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Location (e.g. Remote, City)" placeholderTextColor={COLORS.textMuted} value={location} onChangeText={setLocation} />

            <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="Min Salary" placeholderTextColor={COLORS.textMuted} value={minSalary} onChangeText={setMinSalary} keyboardType="numeric" />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Max Salary" placeholderTextColor={COLORS.textMuted} value={maxSalary} onChangeText={setMaxSalary} keyboardType="numeric" />
            </View>

            <TextInput style={styles.input} placeholder="Required Skills (comma separated)" placeholderTextColor={COLORS.textMuted} value={skills} onChangeText={setSkills} />
            <TextInput style={styles.input} placeholder="Experience Level (e.g. 2-5 yrs)" placeholderTextColor={COLORS.textMuted} value={experience} onChangeText={setExperience} />

            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Job Description..."
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
            />

            <PrimaryButton
                title={`Pay ₹${selectedTier.price} & Publish`}
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
                <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(1)}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{step === 1 ? 'Step 1: Choose Tier' : 'Step 2: Details'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {step === 1 ? renderStep1() : renderStep2()}
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
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 20,
    },
    tierCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    tierPrice: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    featuresList: {
        gap: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureText: {
        color: COLORS.textMuted,
        marginLeft: 10,
        fontSize: 14,
    },
    nextButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        opacity: 0.5,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 15,
        color: COLORS.text,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    row: {
        flexDirection: 'row',
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    payButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 50,
    },
    payButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default PostJobScreen;
