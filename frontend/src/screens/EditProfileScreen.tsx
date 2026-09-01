import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { useAuthStore } from '../store/authStore';

const EditProfileScreen = ({ navigation }: any) => {
    const { user, updateProfile } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [bio, setBio] = useState((user as any)?.bio || '');
    const [skills, setSkills] = useState(Array.isArray((user as any)?.skills) ? (user as any).skills.join(', ') : (user as any)?.skills || '');
    const [hourlyRate, setHourlyRate] = useState(String((user as any)?.hourlyRate || ''));
    const [portfolioUrl, setPortfolioUrl] = useState((user as any)?.portfolioUrl || '');
    const [saving, setSaving] = useState(false);

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant photo gallery access to change your profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const imageUri = asset.base64
                    ? `data:image/jpeg;base64,${asset.base64}`
                    : asset.uri;
                setAvatar(imageUri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Could not select image. Please try again.');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter your full name.');
            return;
        }

        setSaving(true);
        try {
            const parsedSkills = skills ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
            await updateProfile({
                name,
                avatar,
                bio,
                skills: parsedSkills,
                hourlyRate: Number(hourlyRate) || 0,
                portfolioUrl
            } as any);
            Alert.alert('Success', 'Your profile details have been updated successfully.');
            navigation.goBack();
        } catch (error: any) {
            console.error('Profile update error:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to update profile.';
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
        }
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
                    <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.avatarTouchable}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{name.charAt(0).toUpperCase() || 'U'}</Text>
                            </View>
                        )}
                        <View style={styles.cameraBadge}>
                            <Ionicons name="camera" size={16} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickImage} activeOpacity={0.7}>
                        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
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

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Professional Bio</Text>
                        <TextInput
                            style={[styles.input, { color: COLORS.white, height: 90, textAlignVertical: 'top' }]}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={3}
                            placeholder="Tell clients & employers about your background and expertise..."
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Skills (comma separated)</Text>
                        <TextInput
                            style={[styles.input, { color: COLORS.white }]}
                            value={skills}
                            onChangeText={setSkills}
                            placeholder="e.g. React Native, Node.js, UI/UX Design"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Hourly Rate (₹ / hr)</Text>
                        <TextInput
                            style={[styles.input, { color: COLORS.white }]}
                            value={hourlyRate}
                            onChangeText={setHourlyRate}
                            keyboardType="numeric"
                            placeholder="e.g. 1500"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Portfolio Website / GitHub</Text>
                        <TextInput
                            style={[styles.input, { color: COLORS.white }]}
                            value={portfolioUrl}
                            onChangeText={setPortfolioUrl}
                            autoCapitalize="none"
                            keyboardType="url"
                            placeholder="e.g. https://github.com/yourusername"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, saving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={primaryGradient}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        {saving ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
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
    avatarTouchable: {
        position: 'relative',
        marginBottom: 15,
    },
    avatarImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    avatarText: {
        fontSize: 44,
        fontWeight: 'bold',
        color: 'white',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.backgroundSoft,
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
