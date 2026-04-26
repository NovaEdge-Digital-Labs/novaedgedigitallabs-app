import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import * as Clipboard from 'expo-clipboard';
import ThemeWrapper from '../components/ThemeWrapper';
import { useAuthStore } from '../store/authStore';

const JSONFormatter = ({ navigation }: any) => {
    const { user } = useAuthStore();
    const isFree = user?.plan === 'free';

    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    const handleFormat = () => {
        try {
            if (!input.trim()) return;
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 4));
            setStatus({ type: 'success', message: 'Valid JSON - Formatted Successfully' });
        } catch (error: any) {
            setStatus({ type: 'error', message: `Invalid JSON: ${error.message}` });
        }
    };

    const handleMinify = () => {
        try {
            if (!input.trim()) return;
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setStatus({ type: 'success', message: 'Valid JSON - Minified Successfully' });
        } catch (error: any) {
            setStatus({ type: 'error', message: `Invalid JSON: ${error.message}` });
        }
    };

    const handleValidate = () => {
        try {
            if (!input.trim()) {
                setStatus({ type: 'idle', message: '' });
                return;
            }
            JSON.parse(input);
            setStatus({ type: 'success', message: 'Valid JSON' });
        } catch (error: any) {
            setStatus({ type: 'error', message: `Invalid JSON: ${error.message}` });
        }
    };

    const handleCopy = async () => {
        if (!output) return;
        await Clipboard.setStringAsync(output);
        Alert.alert('Copied', 'Output copied to clipboard');
    };

    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>JSON Formatter</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Input JSON</Text>
                <View style={[styles.inputBox, COLORS.getGlow(COLORS.primary, 10, 0.05)]}>
                    <TextInput
                        style={[styles.inputArea, { color: COLORS.white }]}
                        multiline
                        placeholder='{"key": "value"}'
                        placeholderTextColor={COLORS.textMuted}
                        value={input}
                        onChangeText={(val) => {
                            setInput(val);
                            if (status.type !== 'idle') setStatus({ type: 'idle', message: '' });
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleFormat} activeOpacity={0.7}>
                        <LinearGradient
                            colors={primaryGradient}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Ionicons name="funnel-outline" size={16} color="#fff" />
                        <Text style={styles.buttonText}>Format</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleMinify} activeOpacity={0.7}>
                        <LinearGradient
                            colors={primaryGradient}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Ionicons name="contract-outline" size={16} color="#fff" />
                        <Text style={styles.buttonText}>Minify</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#334155' }]} onPress={handleValidate} activeOpacity={0.7}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                        <Text style={styles.buttonText}>Validate</Text>
                    </TouchableOpacity>
                </View>

                {status.message ? (
                    <View style={[styles.statusBox, status.type === 'error' ? styles.statusError : styles.statusSuccess]}>
                        <Ionicons name={status.type === 'error' ? 'close-circle' : 'checkmark-circle'} size={20} color={status.type === 'error' ? COLORS.error : COLORS.success} />
                        <Text style={[styles.statusText, { color: status.type === 'error' ? COLORS.error : COLORS.success }]}>{status.message}</Text>
                    </View>
                ) : null}

                {output ? (
                    <View style={[styles.outputContainer, COLORS.getGlow(COLORS.glow, 15, 0.1)]}>
                        <View style={styles.outputHeader}>
                            <Text style={styles.outputTitle}>Output</Text>
                            <TouchableOpacity onPress={handleCopy} style={styles.copyIconButton} activeOpacity={0.7}>
                                <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal style={styles.outputScroll}>
                            <Text style={styles.outputText}>{output}</Text>
                        </ScrollView>
                    </View>
                ) : null}
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
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textLight,
        marginBottom: 10,
    },
    inputBox: {
        ...COLORS.glass,
        borderRadius: 20,
        padding: 5,
    },
    inputArea: {
        height: 220,
        padding: 15,
        fontSize: 14,
        color: COLORS.white,
        textAlignVertical: 'top',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        marginHorizontal: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
        marginLeft: 6,
    },
    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginBottom: 20,
    },
    statusSuccess: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    statusError: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    statusText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '600',
        flexShrink: 1,
    },
    outputContainer: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    outputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    outputTitle: {
        color: COLORS.textLight,
        fontWeight: 'bold',
        fontSize: 14,
    },
    copyIconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    outputScroll: {
        padding: 15,
        height: 300,
    },
    outputText: {
        color: '#a5b4fc',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 13,
    },
});

export default JSONFormatter;
