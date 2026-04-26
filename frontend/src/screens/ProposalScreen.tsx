import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';

const ProposalScreen = ({ route, navigation }: any) => {
    const { projectId } = route.params;
    const [bidAmount, setBidAmount] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [estimatedDays, setEstimatedDays] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!bidAmount || !coverLetter || !estimatedDays) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            await marketplaceApi.submitProposal({
                projectId,
                bidAmount: Number(bidAmount),
                coverLetter,
                deliveryDays: Number(estimatedDays)
            });
            Alert.alert('Success', 'Your proposal has been submitted!', [
                { text: 'OK', onPress: () => navigation.popToTop() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit proposal');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ThemeWrapper>
            <View style={styles.topContainer}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Send Proposal</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.introHeader}>
                    <Text style={styles.title}>Submit a Proposal</Text>
                    <Text style={styles.subtitle}>Tell the client why you're the best fit for this project.</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <View style={styles.section}>
                    <Text style={styles.label}>Bid Amount (₹)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 5000"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                        value={bidAmount}
                        onChangeText={setBidAmount}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Estimated Delivery (Days)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 7"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                        value={estimatedDays}
                        onChangeText={setEstimatedDays}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Cover Letter</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your approach, experience, and why you're interested..."
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        numberOfLines={8}
                        value={coverLetter}
                        onChangeText={setCoverLetter}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Proposal</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
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
        marginBottom: 20,
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
    introHeader: {
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textMuted,
        lineHeight: 22,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.card,
        borderRadius: COLORS.geometry.radiusMedium,
        padding: 12,
        color: COLORS.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: COLORS.geometry.radiusMedium,
        alignItems: 'center',
        marginTop: 20,
        ...COLORS.getGlow(COLORS.primary),
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProposalScreen;
