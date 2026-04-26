import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';

const CompanyProfileScreen = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [isExisting, setIsExisting] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await marketplaceApi.getCompanyProfile();
                if (response.success && response.data) {
                    setName(response.data.name);
                    setWebsite(response.data.website);
                    setLocation(response.data.location);
                    setDescription(response.data.description);
                    setIsExisting(true);
                }
            } catch (error) {
                // Ignore 404 for new profiles
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!name || !location || !description) {
            Alert.alert('Error', 'Please fill in Name, Location, and Description');
            return;
        }

        setLoading(true);
        try {
            await marketplaceApi.updateCompanyProfile({
                name,
                website,
                location,
                description
            });
            Alert.alert('Success', 'Company profile saved!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isExisting ? 'Edit Company' : 'Setup Company'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoUpload}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="camera" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.uploadText}>Company Logo</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Company Name *</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="NovaEdge Labs" placeholderTextColor={COLORS.textMuted} />

                    <Text style={styles.label}>Website</Text>
                    <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="https://example.com" placeholderTextColor={COLORS.textMuted} />

                    <Text style={styles.label}>Location / Headquarters *</Text>
                    <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="City, Country" placeholderTextColor={COLORS.textMuted} />

                    <Text style={styles.label}>About Company *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Detail your mission and what it's like to work here..."
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        numberOfLines={6}
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
                    </TouchableOpacity>
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
    logoUpload: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    uploadText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
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
        height: 150,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default CompanyProfileScreen;
