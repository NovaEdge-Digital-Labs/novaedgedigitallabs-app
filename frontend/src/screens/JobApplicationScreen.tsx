import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import PrimaryButton from '../components/PrimaryButton';

const JobApplicationScreen = ({ route, navigation }: any) => {
    const { jobId, jobTitle } = route.params;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [coverNote, setCoverNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !email || !portfolioUrl) {
            Alert.alert('Error', 'Please fill in required fields (Name, Email, Resume/Portfolio Link)');
            return;
        }

        setLoading(true);
        try {
            await marketplaceApi.applyToJob({
                jobId,
                name,
                email,
                phone,
                resumeUrl: portfolioUrl,
                coverNote
            });

            Alert.alert('Success', 'Application submitted! The company will review it soon.', [
                { text: 'Done', onPress: () => navigation.navigate('JobFeed') }
            ]);
        } catch (error: any) {
            Alert.alert('Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Apply Now</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.jobBrief}>
                    <Text style={styles.applyingFor}>Applying for:</Text>
                    <Text style={styles.jobTitle}>{jobTitle}</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your full name" placeholderTextColor={COLORS.textMuted} />

                    <Text style={styles.label}>Email Address *</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor={COLORS.textMuted} keyboardType="email-address" />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter phone number" placeholderTextColor={COLORS.textMuted} keyboardType="phone-pad" />

                    <Text style={styles.label}>Resume / Portfolio Link *</Text>
                    <TextInput style={styles.input} value={portfolioUrl} onChangeText={setPortfolioUrl} placeholder="Link to Google Drive, Dropbox or Website" placeholderTextColor={COLORS.textMuted} />

                    <Text style={styles.label}>Cover Note (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={coverNote}
                        onChangeText={setCoverNote}
                        placeholder="Why are you a good fit?"
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        numberOfLines={5}
                    />

                    <PrimaryButton
                        title="Submit Application"
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
    jobBrief: {
        backgroundColor: COLORS.card,
        padding: 20,
        borderRadius: 16,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    applyingFor: {
        color: COLORS.textMuted,
        fontSize: 14,
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
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 15,
        color: COLORS.text,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default JobApplicationScreen;
