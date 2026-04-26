import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';

const CreateProjectScreen = ({ navigation }: any) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [skills, setSkills] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title || !description || !minBudget || !maxBudget || !skills) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSubmitting(true);
        // Step 1: Start
        console.log('handleSubmit started');

        try {
            // Default deadline: 30 days from now
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 30);

            const payload = {
                title,
                description,
                budgetRange: {
                    min: Number(minBudget),
                    max: Number(maxBudget)
                },
                skillsRequired: skills.split(',').map(s => s.trim()),
                deadline: deadline.toISOString()
            };

            console.log('Submitting Project with payload:', payload);

            const response = await marketplaceApi.createProject(payload);
            console.log('Project creation response:', response);

            Alert.alert('Success', 'Project Requirement Posted!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Project creation error details:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Unknown network error';
            Alert.alert('Submission Failed', errorMsg);
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
                    <Text style={styles.headerTitle}>Post a Project</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.introHeader}>
                    <Text style={styles.title}>Post a Project</Text>
                    <Text style={styles.subtitle}>Find the perfect freelancer for your needs.</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.section}>
                    <Text style={styles.label}>Project Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Build a Mobile App for E-commerce"
                        placeholderTextColor={COLORS.textMuted}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Detailed Requirements</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe the scope of work, timeline, and expectations..."
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        numberOfLines={8}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Budget Range (₹)</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 12 }]}
                            placeholder="Min"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="numeric"
                            value={minBudget}
                            onChangeText={setMinBudget}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Max"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="numeric"
                            value={maxBudget}
                            onChangeText={setMaxBudget}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Skills Required (Comma separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="React Native, Node.js, UI/UX"
                        placeholderTextColor={COLORS.textMuted}
                        value={skills}
                        onChangeText={setSkills}
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
                        <Text style={styles.submitButtonText}>Post Project</Text>
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
        padding: 14,
        color: COLORS.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: COLORS.geometry.radiusMedium,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
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

export default CreateProjectScreen;
