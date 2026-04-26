import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { toolsApi } from '../api/toolsApi';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import Slider from '@react-native-community/slider';
import ThemeWrapper from '../components/ThemeWrapper';
import { useAuthStore } from '../store/authStore';

const QRGenerator = ({ navigation }: any) => {
    const { user } = useAuthStore();
    const isFree = user?.plan === 'free';

    const [text, setText] = useState('');
    const [size, setSize] = useState(300);
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [usageInfo, setUsageInfo] = useState<any>(null);

    const handleGenerate = async () => {
        if (!text.trim()) {
            Alert.alert('Error', 'Please enter some text or URL');
            return;
        }

        setIsLoading(true);
        try {
            const data = await toolsApi.generateQR(text);
            if (data.qrBase64) {
                setQrImage(data.qrBase64);
            }
            if (data.usage) {
                setUsageInfo(data.usage);
            }
        } catch (error: any) {
            Alert.alert('Generation failed', error.response?.data?.message || 'Could not generate QR code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        if (!qrImage) return;
        try {
            const base64Data = qrImage.split('base64,')[1];
            const fileUri = (FileSystem as any).cacheDirectory + 'qr_code.png';
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                encoding: (FileSystem as any).EncodingType.Base64,
            });
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            Alert.alert('Error', 'Failed to share QR code');
        }
    };

    const handleSave = async () => {
        if (!qrImage) return;
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to save the image');
                return;
            }
            const base64Data = qrImage.split('base64,')[1];
            const fileUri = (FileSystem as any).cacheDirectory + `qr_code_${Date.now()}.png`;
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                encoding: (FileSystem as any).EncodingType.Base64,
            });
            await MediaLibrary.saveToLibraryAsync(fileUri);
            Alert.alert('Success', 'QR Code saved to gallery');
        } catch (error) {
            Alert.alert('Error', 'Failed to save QR code');
        }
    };

    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>QR Generator</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.description}>Generate custom QR codes instantly for your URLs, text, or contacts.</Text>

                <View style={[styles.card, COLORS.getGlow(COLORS.primary, 10, 0.1)]}>
                    <Text style={styles.label}>Text or URL</Text>
                    <TextInput
                        style={[styles.input, { color: COLORS.white }]}
                        placeholder="e.g. https://novaedge.com"
                        placeholderTextColor={COLORS.textMuted}
                        value={text}
                        onChangeText={setText}
                        autoCapitalize="none"
                    />
                </View>

                <View style={[styles.card, { marginTop: 15 }, COLORS.getGlow(COLORS.glow, 8, 0.05)]}>
                    <Text style={styles.label}>Size: {Math.round(size)}px</Text>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={200}
                        maximumValue={500}
                        step={10}
                        value={size}
                        onValueChange={setSize}
                        minimumTrackTintColor={COLORS.primary}
                        maximumTrackTintColor={COLORS.border}
                        thumbTintColor={COLORS.primary}
                    />
                </View>

                {isFree && usageInfo && (
                    <Text style={styles.usageText}>Usage: {usageInfo.count}/{usageInfo.limit} today</Text>
                )}

                <TouchableOpacity
                    style={[styles.generateButton, isLoading && styles.disabledButton, COLORS.getGlow(COLORS.primary, 15, 0)]}
                    onPress={handleGenerate}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={primaryGradient}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateButtonText}>Generate QR</Text>}
                </TouchableOpacity>

                {qrImage && (
                    <View style={[styles.resultContainer, COLORS.getGlow(COLORS.glow, 15, 0.2)]}>
                        <View style={[styles.qrWrapper, { width: size > 250 ? 250 : size, height: size > 250 ? 250 : size }]}>
                            <Image source={{ uri: qrImage }} style={{ flex: 1, resizeMode: 'contain' }} />
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleShare} activeOpacity={0.7}>
                                <Ionicons name="share-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.actionButtonText}>Share</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={handleSave} activeOpacity={0.7}>
                                <Ionicons name="download-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.actionButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    content: {
        padding: 20,
    },
    description: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        ...COLORS.glass,
        padding: 20,
        borderRadius: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 10,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        color: COLORS.white,
    },
    generateButton: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.6,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    usageText: {
        fontSize: 12,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 15,
    },
    resultContainer: {
        marginTop: 30,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 25,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    qrWrapper: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 20,
        marginBottom: 25,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        minWidth: 120,
        justifyContent: 'center',
    },
    actionButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default QRGenerator;
