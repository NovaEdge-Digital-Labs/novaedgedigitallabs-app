import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, Image } from 'react-native';
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
    const [imageUrl, setImageUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const PRESET_IMAGES = [
        { label: '🎨 Design', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop' },
        { label: '💻 Web Dev', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop' },
        { label: '📱 Mobile App', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop' },
        { label: '🚀 Branding', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop' },
    ];

    const handleUploadImage = () => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            setImageUrl(event.target.result as string);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        } else {
            try {
                const ImagePicker = require('expo-image-picker');
                ImagePicker.requestMediaLibraryPermissionsAsync().then((permission: any) => {
                    if (permission.granted) {
                        ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            quality: 0.7,
                            base64: true,
                        }).then((result: any) => {
                            if (!result.canceled && result.assets?.[0]) {
                                const asset = result.assets[0];
                                if (asset.base64) {
                                    setImageUrl(`data:image/jpeg;base64,${asset.base64}`);
                                } else if (asset.uri) {
                                    setImageUrl(asset.uri);
                                }
                            }
                        });
                    } else {
                        Alert.alert('Permission Required', 'Please grant gallery permissions');
                    }
                });
            } catch (e) {
                console.log('Image picker error:', e);
            }
        }
    };

    const handleSubmit = async () => {
        if (!title || !category || !description || !price || !deliveryTime) {
            Alert.alert('Error', 'Please fill in all essential fields');
            return;
        }

        setSubmitting(true);
        try {
            const finalImage = imageUrl || PRESET_IMAGES[0].url;
            const payload = {
                title,
                category,
                description,
                price: Number(price),
                deliveryDays: Number(deliveryTime),
                images: [finalImage]
            };

            await marketplaceApi.createGig(payload);

            if (Platform.OS === 'web') {
                if (typeof window !== 'undefined') {
                    window.alert('🎉 Gig posted successfully!');
                }
                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    navigation.navigate('MarketplaceMain');
                }
            } else {
                Alert.alert('Success', 'Gig posted successfully!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                navigation.navigate('MarketplaceMain');
                            }
                        }
                    }
                ]);
            }
        } catch (error: any) {
            console.error('Gig creation error details:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Unknown network error';
            if (Platform.OS === 'web') {
                window.alert(`Submission Failed: ${errorMsg}`);
            } else {
                Alert.alert('Submission Failed', errorMsg);
            }
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

                <View style={styles.section}>
                    <Text style={styles.label}>Gig Cover Image</Text>
                    
                    <TouchableOpacity
                        style={styles.uploadBtn}
                        onPress={handleUploadImage}
                    >
                        <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.uploadBtnText}>📁 Upload Image from Device</Text>
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.input, { marginTop: 10 }]}
                        placeholder="Or enter Image URL (https://...)"
                        placeholderTextColor={COLORS.textMuted}
                        value={imageUrl}
                        onChangeText={setImageUrl}
                    />

                    {imageUrl ? (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
                        </View>
                    ) : null}

                    <Text style={styles.presetTitle}>Or Choose Preset Banner:</Text>
                    <View style={styles.presetRow}>
                        {PRESET_IMAGES.map((preset) => (
                            <TouchableOpacity
                                key={preset.label}
                                style={[
                                    styles.presetChip,
                                    imageUrl === preset.url && styles.presetChipActive
                                ]}
                                onPress={() => setImageUrl(preset.url)}
                            >
                                <Text style={[
                                    styles.presetChipText,
                                    imageUrl === preset.url && styles.presetChipTextActive
                                ]}>
                                    {preset.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
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
    presetTitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 12,
        marginBottom: 8,
    },
    presetRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    presetChip: {
        backgroundColor: COLORS.card,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    presetChipActive: {
        backgroundColor: COLORS.primary + '25',
        borderColor: COLORS.primary,
    },
    presetChipText: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '500',
    },
    presetChipTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary + '15',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
    },
    uploadBtnText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8,
    },
    previewContainer: {
        marginTop: 12,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 140,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
});

export default CreateGigScreen;
