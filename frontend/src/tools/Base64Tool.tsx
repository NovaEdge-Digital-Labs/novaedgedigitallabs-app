import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import * as Clipboard from 'expo-clipboard';
import ThemeWrapper from '../components/ThemeWrapper';
import { useAuthStore } from '../store/authStore';
import { encode, decode } from 'base-64';

const Base64Tool = ({ navigation }: any) => {
    const { user } = useAuthStore();

    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');

    const handleProcess = () => {
        if (!input.trim()) return;
        try {
            if (mode === 'encode') {
                setOutput(encode(input));
            } else {
                setOutput(decode(input));
            }
        } catch (error) {
            Alert.alert('Error', mode === 'encode' ? 'Failed to encode text' : 'Failed to decode text. Please ensure it is a valid Base64 string.');
        }
    };

    const handleCopyInput = async () => {
        if (!input) return;
        await Clipboard.setStringAsync(input);
        Alert.alert('Copied', 'Input copied to clipboard');
    };

    const handleCopyOutput = async () => {
        if (!output) return;
        await Clipboard.setStringAsync(output);
        Alert.alert('Copied', 'Output copied to clipboard');
    };

    const handleSwap = () => {
        if (output) {
            setInput(output);
            setOutput('');
            setMode(mode === 'encode' ? 'decode' : 'encode');
        } else {
            setMode(mode === 'encode' ? 'decode' : 'encode');
        }
    };

    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Base64 Encoder/Decoder</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, mode === 'encode' && styles.activeTab]}
                        onPress={() => setMode('encode')}
                        activeOpacity={0.7}
                    >
                        {mode === 'encode' && (
                            <LinearGradient
                                colors={primaryGradient}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        )}
                        <Text style={[styles.tabText, mode === 'encode' && styles.activeTabText]}>Encode</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, mode === 'decode' && styles.activeTab]}
                        onPress={() => setMode('decode')}
                        activeOpacity={0.7}
                    >
                        {mode === 'decode' && (
                            <LinearGradient
                                colors={primaryGradient}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        )}
                        <Text style={[styles.tabText, mode === 'decode' && styles.activeTabText]}>Decode</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, COLORS.getGlow(COLORS.primary, 10, 0.1)]}>
                    <View style={styles.fieldHeader}>
                        <Text style={styles.label}>Input {mode === 'encode' ? '(Text)' : '(Base64)'}</Text>
                        <TouchableOpacity onPress={handleCopyInput} activeOpacity={0.7}>
                            <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.inputArea, { color: COLORS.white }]}
                        multiline
                        placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter base64 to decode...'}
                        placeholderTextColor={COLORS.textMuted}
                        value={input}
                        onChangeText={setInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.primaryButton, COLORS.getGlow(COLORS.primary, 15, 0)]}
                        onPress={handleProcess}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={primaryGradient}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Text style={styles.primaryButtonText}>{mode === 'encode' ? 'Encode Data' : 'Decode Data'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.swapButton, COLORS.getGlow(COLORS.accent, 10, 0.2)]} onPress={handleSwap} activeOpacity={0.7}>
                        <Ionicons name="swap-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, COLORS.getGlow(COLORS.glow, 10, 0.05)]}>
                    <View style={styles.fieldHeader}>
                        <Text style={styles.label}>Output {mode === 'encode' ? '(Base64)' : '(Text)'}</Text>
                        <TouchableOpacity onPress={handleCopyOutput} activeOpacity={0.7}>
                            <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.outputBox}>
                        <ScrollView>
                            <Text selectable style={styles.outputText}>
                                {output || `Result will appear here...`}
                            </Text>
                        </ScrollView>
                    </View>
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 6,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
        overflow: 'hidden',
    },
    activeTab: {
        // LinearGradient used as shadow/background
    },
    tabText: {
        fontWeight: '700',
        color: COLORS.textMuted,
        fontSize: 16,
    },
    activeTabText: {
        color: COLORS.white,
    },
    card: {
        ...COLORS.glass,
        padding: 20,
        borderRadius: 20,
        marginBottom: 10,
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textLight,
    },
    inputArea: {
        height: 150,
        fontSize: 16,
        color: COLORS.white,
        textAlignVertical: 'top',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    outputBox: {
        height: 150,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    outputText: {
        color: COLORS.textLight,
        fontSize: 16,
        lineHeight: 24,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    primaryButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        overflow: 'hidden',
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    swapButton: {
        backgroundColor: COLORS.secondary,
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
});

export default Base64Tool;
