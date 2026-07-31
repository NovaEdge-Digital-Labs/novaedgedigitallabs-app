import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import PrimaryButton from '../components/PrimaryButton';
import { useAuthStore } from '../store/authStore';

const JobApplicationScreen = ({ route, navigation }: any) => {
    const { jobId, jobTitle } = route.params;
    const user = useAuthStore((state) => state.user);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [coverNote, setCoverNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            if (!name && user.name) setName(user.name);
            if (!email && user.email) setEmail(user.email);
        }
    }, [user]);

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

    const handleSubmit = async () => {
        if (!name.trim() || !email.trim() || !portfolioUrl.trim()) {
            showAlert('Missing Required Fields', 'Please fill in Name, Email, and Resume/Portfolio Link');
            return;
        }

        setLoading(true);
        try {
            await marketplaceApi.applyToJob({
                jobId,
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                resumeUrl: portfolioUrl.trim(),
                coverNote: coverNote.trim()
            });

            showAlert('🎉 Application Submitted!', 'Your application has been received by the employer! They will contact you soon.', () => {
                navigation.navigate('JobFeed');
            });
        } catch (error: any) {
            showAlert('Application Error', error?.response?.data?.message || error?.message || 'Failed to submit application.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Apply Now</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.jobBrief}>
                    <Text style={styles.applyingFor}>Applying for:</Text>
                    <Text style={styles.jobTitle}>{jobTitle || 'Job Position'}</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                        placeholderTextColor={COLORS.textMuted}
                    />

                    <Text style={styles.label}>Email Address *</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter phone number"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Resume / Portfolio Link *</Text>
                    <TextInput
                        style={styles.input}
                        value={portfolioUrl}
                        onChangeText={setPortfolioUrl}
                        placeholder="Link to Google Drive, LinkedIn, or Portfolio Website"
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="none"
                        keyboardType="url"
                    />

                    <Text style={styles.label}>Cover Note (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={coverNote}
                        onChangeText={setCoverNote}
                        placeholder="Why are you a good fit for this role?"
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        numberOfLines={5}
                    />

                    <PrimaryButton
                        title={loading ? 'Submitting...' : 'Submit Application'}
                        onPress={handleSubmit}
                        loading={loading}
                        style={styles.submitButton}
                        textStyle={styles.submitButtonText}
                    />
                </View>
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
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 15,
    },
    closeBtn: {
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
    jobBrief: {
        backgroundColor: COLORS.card,
        padding: 18,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    applyingFor: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginBottom: 4,
    },
    jobTitle: {
        color: COLORS.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    form: {},
    label: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 12,
        padding: 14,
        color: COLORS.white,
        fontSize: 14,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    textArea: {
        height: 110,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default JobApplicationScreen;
