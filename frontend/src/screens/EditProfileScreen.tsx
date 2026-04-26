import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { useAuthStore } from '../store/authStore';

const EditProfileScreen = ({ navigation }: any) => {
    const { user } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const handleSave = () => {
        Alert.alert('Profile Updated', 'Your profile details have been saved successfully.');
        navigation.goBack();
    };

    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.avatarSection, COLORS.getGlow(COLORS.primary, 15, 0.2)]}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{name.charAt(0) || 'U'}</Text>
                    </View>
                    <TouchableOpacity style={styles.changePhotoButton} activeOpacity={0.7}>
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { color: COLORS.white }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={[styles.input, { color: COLORS.white, opacity: 0.6 }]}
                            value={email}
                            editable={false}
                            placeholder="email@example.com"
                            placeholderTextColor={COLORS.textMuted}
                        />
                        <Text style={styles.infoText}>Email cannot be changed.</Text>
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                        <LinearGradient
                            colors={primaryGradient}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
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
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    content: {
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 24,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
    },
    changePhotoButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    changePhotoText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
        marginLeft: 4,
    },
    input: {
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    saveButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditProfileScreen;
