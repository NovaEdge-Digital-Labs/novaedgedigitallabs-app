import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import axios from 'axios';
import { CONFIG } from '../constants/config';
import { useAuthStore } from '../store/authStore';

const BusinessInquiryScreen = ({ navigation }: any) => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: user?.name || '',
        email: user?.email || '',
        phone: '',
        category: '',
        message: ''
    });

    const handleSubmit = async () => {
        const { businessName, ownerName, email, phone, category } = formData;

        if (!businessName || !ownerName || !email || !phone || !category) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${CONFIG.API_URL}/featured/inquiry`, formData);

            Alert.alert(
                'Success',
                'Your inquiry has been submitted. Our team will contact you shortly to discuss featuring your business!',
                [{ text: 'Great!', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Inquiry error:', error);
            Alert.alert('Error', 'Failed to submit inquiry. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Establish Your Presence</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.heroSection}>
                        <Ionicons name="rocket-outline" size={60} color={COLORS.primary} />
                        <Text style={styles.heroTitle}>Grow with NovaEdge</Text>
                        <Text style={styles.heroSubtitle}>
                            Get your business featured on Indore's most loved digital tools platform.
                        </Text>
                    </View>

                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Business Name *</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="business-outline" size={18} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter business name"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.businessName}
                                    onChangeText={(val) => setFormData({ ...formData, businessName: val })}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Owner/Contact Name *</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full name"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.ownerName}
                                    onChangeText={(val) => setFormData({ ...formData, ownerName: val })}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Email Address *</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="email@example.com"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="email-address"
                                        value={formData.email}
                                        onChangeText={(val) => setFormData({ ...formData, email: val })}
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Phone *</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="10 digit number"
                                        placeholderTextColor={COLORS.textMuted}
                                        keyboardType="phone-pad"
                                        value={formData.phone}
                                        onChangeText={(val) => setFormData({ ...formData, phone: val })}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Business Category *</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="list-outline" size={18} color={COLORS.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Cafe, Real Estate, Gym"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={formData.category}
                                    onChangeText={(val) => setFormData({ ...formData, category: val })}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tell us more (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe your business or any specific slot requirements..."
                                placeholderTextColor={COLORS.textMuted}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={formData.message}
                                onChangeText={(val) => setFormData({ ...formData, message: val })}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, COLORS.getGlow(COLORS.primary, 15, 0)]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <>
                                    <Text style={styles.submitBtnText}>SEND INQUIRY</Text>
                                    <Ionicons name="send" size={18} color={COLORS.white} style={{ marginLeft: 10 }} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
                        <Text style={styles.infoText}>
                            Featured slots are billed monthly via Razorpay Subscriptions. Pricing ranges from ₹2,000 - ₹5,000 based on visibility position.
                        </Text>
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 15,
        marginTop: Platform.OS === 'android' ? 10 : 0
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginLeft: 15 },
    content: { padding: 20 },
    heroSection: { alignItems: 'center', marginBottom: 30 },
    heroTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginTop: 15, marginBottom: 10 },
    heroSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
    formCard: {
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 24, padding: 20,
        borderWidth: 1, borderColor: COLORS.border
    },
    inputGroup: { marginBottom: 20 },
    label: { color: COLORS.white, fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12, paddingHorizontal: 12, height: 50,
        borderWidth: 1, borderColor: COLORS.border
    },
    input: { flex: 1, color: COLORS.white, fontSize: 15, marginLeft: 10 },
    row: { flexDirection: 'row' },
    textArea: {
        height: 100, padding: 12, borderRadius: 12,
        backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
        marginLeft: 0
    },
    submitBtn: {
        backgroundColor: COLORS.primary, height: 56, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        marginTop: 10
    },
    submitBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
    infoBox: {
        flexDirection: 'row', backgroundColor: 'rgba(56, 189, 248, 0.1)',
        padding: 15, borderRadius: 12, marginTop: 25, alignItems: 'center'
    },
    infoText: { color: COLORS.info, fontSize: 13, flex: 1, marginLeft: 10, lineHeight: 18 }
});

export default BusinessInquiryScreen;
