import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';

const CreateGigScreen = ({ navigation }: any) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title || !category || !description || !price || !deliveryTime) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title,
                category,
                description,
                price: Number(price),
                deliveryDays: Number(deliveryTime),
            };

            await marketplaceApi.createGig(payload);
            Alert.alert('Success', 'Gig posted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Gig creation error details:', error);
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
                    <Text style={styles.headerTitle}>Post a Gig</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.introHeader}>
                    <Text style={styles.title}>Post a New Gig</Text>
                    <Text style={styles.subtitle}>Showcase your skills and start earning.</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.section}>
                    <Text style={styles.label}>Gig Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="I will design a modern logo for your brand..."
                        placeholderTextColor={COLORS.textMuted}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Category</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Graphic Design, Web Development"
                        placeholderTextColor={COLORS.textMuted}
                        value={category}
                        onChangeText={setCategory}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Detail exactly what you offer..."
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        numberOfLines={6}
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.section, { flex: 1, marginRight: 12 }]}>
                        <Text style={styles.label}>Price (₹)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Starting at"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>
                    <View style={[styles.section, { flex: 1 }]}>
                        <Text style={styles.label}>Delivery (Days)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Days"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="numeric"
                            value={deliveryTime}
                            onChangeText={setDeliveryTime}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Publish Gig</Text>
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
        height: 120,
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

export default CreateGigScreen;
