import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import { toolsApi } from '../api/toolsApi';
// Imported from `/legacy` deliberately. On SDK 55 the package's main entry only
// keeps deprecated stubs for these helpers — `cacheDirectory` is undefined and
// `downloadAsync`/`writeAsStringAsync` throw at runtime.
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import ThemeWrapper from '../components/ThemeWrapper';

const ImageCompressor = ({ navigation }: any) => {
    const { user } = useAuthStore();
    const isFree = user?.plan === 'free';

    const [image, setImage] = useState<any>(null);
    const [quality, setQuality] = useState(80);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [usageInfo, setUsageInfo] = useState<any>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
            setResult(null);
        }
    };

    const handleCompress = async () => {
        if (!image) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            if (Platform.OS === 'web') {
                if (image.file) {
                    formData.append('image', image.file);
                } else {
                    const response = await fetch(image.uri);
                    const blob = await response.blob();
                    formData.append('image', blob, 'photo.jpg');
                }
            } else {
                formData.append('image', {
                    uri: image.uri,
                    name: 'photo.jpg',
                    type: 'image/jpeg',
                } as any);
            }
            formData.append('quality', quality.toString());

            const data = await toolsApi.compressImage(formData);

            setResult(data);
            if (data.usage) setUsageInfo(data.usage);

        } catch (error: any) {
            Alert.alert('Compression Failed', error.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // The API returns the compressed bytes inline as base64 instead of a hosted
    // URL, so write them to a cache file before handing them to the OS.
    const writeResultToCache = async (filename: string) => {
        if (!result?.base64) throw new Error('No compressed image available');
        const fileUri = FileSystem.cacheDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, result.base64, { encoding: 'base64' });
        return fileUri;
    };

    const handleSave = async () => {
        if (!result?.base64) return;
        try {
            if (Platform.OS === 'web') {
                const link = document.createElement('a');
                link.href = result.dataUri || `data:image/jpeg;base64,${result.base64}`;
                link.download = `compressed_${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                Alert.alert('Success', 'Image downloaded successfully');
                return;
            }

            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to save the image');
                return;
            }
            const fileUri = await writeResultToCache(`compressed_${Date.now()}.jpg`);
            await MediaLibrary.saveToLibraryAsync(fileUri);
            Alert.alert('Success', 'Image saved to gallery');
        } catch (e: any) {
            console.warn('[compress] save failed:', e);
            Alert.alert('Error', e?.message || 'Failed to save image');
        }
    };

    const handleShare = async () => {
        if (!result?.base64) return;
        try {
            if (Platform.OS === 'web') {
                Alert.alert('Info', 'Share functionality is not supported on web browsers.');
                return;
            }
            const fileUri = await writeResultToCache('compressed_image.jpg');
            await Sharing.shareAsync(fileUri, { mimeType: 'image/jpeg' });
        } catch (e: any) {
            console.warn('[compress] share failed:', e);
            Alert.alert('Error', e?.message || 'Failed to share image');
        }
    };

    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Image Compressor</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.description}>Reduce image file size significantly without losing visible quality.</Text>

                {!image ? (
                    <TouchableOpacity
                        style={[styles.uploadArea, COLORS.getGlow(COLORS.primary, 15, 0.15)]}
                        onPress={pickImage}
                    >
                        <Ionicons name="cloud-upload-outline" size={56} color={COLORS.primary} />
                        <Text style={styles.uploadText}>Tap to select an image</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.previewContainer, COLORS.getGlow(COLORS.glow, 12, 0.2)]}>
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                        <TouchableOpacity style={styles.repickButton} onPress={pickImage}>
                            <Text style={styles.repickText}>Change Image</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.card, COLORS.getGlow(COLORS.glow, 10, 0.05)]}>
                    <Text style={styles.label}>Quality Level: {quality}%</Text>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={10}
                        maximumValue={100}
                        step={5}
                        value={quality}
                        onValueChange={setQuality}
                        minimumTrackTintColor={COLORS.primary}
                        maximumTrackTintColor={COLORS.border}
                        thumbTintColor={COLORS.primary}
                    />
                    <Text style={styles.hintText}>Lower quality means smaller file size.</Text>
                </View>

                {isFree && usageInfo && (
                    <Text style={styles.usageText}>Usage: {usageInfo.count}/{usageInfo.limit} today</Text>
                )}

                <TouchableOpacity
                    style={[styles.primaryButton, (!image || isLoading) && styles.disabledButton, COLORS.getGlow(COLORS.primary, 15, 0)]}
                    onPress={handleCompress}
                    disabled={!image || isLoading}
                >
                    <LinearGradient
                        colors={primaryGradient}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    />
                    {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryButtonText}>Compress Image</Text>}
                </TouchableOpacity>

                {result && (
                    <View style={[styles.resultCard, COLORS.getGlow(COLORS.glow, 15, 0.2)]}>
                        <Text style={styles.resultTitle}>Compression Successful 🎉</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>Original</Text>
                                <Text style={styles.statValue}>{(result.originalSize / 1024).toFixed(1)} KB</Text>
                            </View>
                            <View style={styles.arrowBox}>
                                <Ionicons name="arrow-forward" size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statLabel}>Compressed</Text>
                                <Text style={[styles.statValue, { color: COLORS.success }]}>{(result.compressedSize / 1024).toFixed(1)} KB</Text>
                            </View>
                        </View>

                        <Text style={styles.savedText}>
                            You saved {((1 - result.compressedSize / result.originalSize) * 100).toFixed(1)}%!
                        </Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                <Ionicons name="share-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.actionButtonText}>Share</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
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
        marginBottom: 25,
        textAlign: 'center',
    },
    uploadArea: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        height: 220,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    uploadText: {
        color: COLORS.textLight,
        marginTop: 15,
        fontWeight: 'bold',
        fontSize: 16,
    },
    previewContainer: {
        width: '100%',
        height: 280,
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: '#000',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    repickButton: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    repickText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    card: {
        ...COLORS.glass,
        padding: 24,
        borderRadius: 24,
        marginBottom: 25,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textLight,
        marginBottom: 10,
    },
    hintText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 6,
    },
    primaryButton: {
        height: 58,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    usageText: {
        fontSize: 12,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: 15,
    },
    resultCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 25,
        borderRadius: 30,
        marginTop: 30,
        marginBottom: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 25,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 15,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    arrowBox: {
        width: 40,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginBottom: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    savedText: {
        color: COLORS.success,
        fontWeight: '900',
        marginVertical: 25,
        fontSize: 22,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        minWidth: 110,
        justifyContent: 'center',
    },
    actionButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default ImageCompressor;
