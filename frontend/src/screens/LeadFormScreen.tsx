import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { submitLead } from '../api/leadApi';

const LeadFormScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { service = 'web-development' } = route.params || {};

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        service: service,
        budget: '20k-50k',
    });

    const [loading, setLoading] = useState(false);

    const budgets = [
        { label: 'Under ₹20k', value: 'under-20k' },
        { label: '₹20k - ₹50k', value: '20k-50k' },
        { label: '₹50k - ₹2L', value: '50k-2L' },
        { label: 'Above ₹2L', value: 'above-2L' },
    ];

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.message) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await submitLead(formData);
            Alert.alert(
                'Success',
                'Your request has been submitted successfully. Our team will contact you soon!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert('Error', error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Get a Free Quote</Text>
                </View>

                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>Project Contact</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor={COLORS.textMuted}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="john@example.com"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="email-address"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+91 9876543210"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            />
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Project Details</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Budget Range</Text>
                            <View style={styles.budgetContainer}>
                                {budgets.map((b) => (
                                    <TouchableOpacity
                                        key={b.value}
                                        style={[
                                            styles.budgetOption,
                                            formData.budget === b.value && { backgroundColor: COLORS.primary + '30', borderColor: COLORS.primary }
                                        ]}
                                        onPress={() => setFormData({ ...formData, budget: b.value })}
                                    >
                                        <Text style={[
                                            styles.budgetText,
                                            formData.budget === b.value && { color: COLORS.primary, fontWeight: '700' }
                                        ]}>{b.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Describe your project</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Tell us about your requirements, goals, and any specific features you need..."
                                placeholderTextColor={COLORS.textMuted}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={formData.message}
                                onChangeText={(text) => setFormData({ ...formData, message: text })}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton, COLORS.getGlow(COLORS.primary, 15, 0.5)]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={COLORS.getGradient(COLORS.primaryGradient)}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <View style={styles.submitContent}>
                                    <Text style={styles.submitText}>Submit Request</Text>
                                    <Ionicons name="send" size={18} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: Platform.OS === 'android' ? 10 : 0,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    container: {
        padding: 20,
    },
    formCard: {
        ...COLORS.glass,
        padding: 20,
        borderRadius: 24,
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 15,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        color: COLORS.white,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    textArea: {
        height: 120,
        paddingTop: 12,
    },
    budgetContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -5,
    },
    budgetOption: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        margin: 5,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    budgetText: {
        color: COLORS.textLight,
        fontSize: 13,
    },
    submitButton: {
        marginTop: 25,
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    submitText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
});

export default LeadFormScreen;
