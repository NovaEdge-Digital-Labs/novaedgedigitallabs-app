import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import PremiumGate from '../components/PremiumGate';
import ThemeWrapper from '../components/ThemeWrapper';
import { decode } from 'base-64';

const JWTDecoder = ({ navigation }: any) => {
    const [token, setToken] = useState('');

    const decoded = useMemo(() => {
        if (!token.trim()) return null;
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return { error: 'Invalid JWT structure. A valid JWT must have 3 parts separated by dots.' };

            const decodeBase64Url = (str: string) => {
                let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) {
                    base64 += '=';
                }
                return decode(base64);
            };

            const headerStr = decodeBase64Url(parts[0]);
            const payloadStr = decodeBase64Url(parts[1]);

            const header = JSON.parse(headerStr);
            const payload = JSON.parse(payloadStr);

            return { header, payload, signature: parts[2] };
        } catch (error: any) {
            return { error: `Failed to decode: ${error.message}` };
        }
    }, [token]);

    const isExpired = decoded?.payload?.exp ? (decoded.payload.exp * 1000 < Date.now()) : false;
    const expDate = decoded?.payload?.exp ? new Date(decoded.payload.exp * 1000).toLocaleString() : 'N/A';

    return (
        <ThemeWrapper>
            <PremiumGate navigation={navigation}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>JWT Decoder</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.description}>Instantly decode and inspect JSON Web Tokens locally. No data leaves your device.</Text>

                    <Text style={styles.label}>JWT Token String</Text>
                    <View style={[styles.inputBox, COLORS.getGlow(COLORS.primary, 10, 0.05)]}>
                        <TextInput
                            style={styles.inputArea}
                            multiline
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            placeholderTextColor={COLORS.textMuted}
                            value={token}
                            onChangeText={setToken}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {decoded?.error ? (
                        <View style={[styles.errorBox, COLORS.getGlow(COLORS.error, 10, 0.1)]}>
                            <Ionicons name="warning" size={20} color={COLORS.error} />
                            <Text style={styles.errorText}>{decoded.error}</Text>
                        </View>
                    ) : decoded ? (
                        <View style={styles.resultContainer}>
                            {decoded.payload?.exp && (
                                <View style={[styles.statusBox, isExpired ? styles.expiredBox : styles.validBox, COLORS.getGlow(isExpired ? COLORS.error : COLORS.success, 15, 0.2)]}>
                                    <Ionicons name={isExpired ? "close-circle" : "checkmark-circle"} size={26} color="#fff" />
                                    <View style={{ marginLeft: 15 }}>
                                        <Text style={styles.statusTitle}>
                                            {isExpired ? 'Token Expired' : 'Token Valid'}
                                        </Text>
                                        <Text style={styles.statusDesc}>Expires: {expDate}</Text>
                                    </View>
                                </View>
                            )}

                            <Text style={styles.sectionTitle}>HEADER <Text style={styles.sectionSubtitle}>(Algorithm & Type)</Text></Text>
                            <View style={[styles.jsonBox, { borderColor: 'rgba(239, 68, 68, 0.3)' }, COLORS.getGlow('#ef4444', 8, 0.05)]}>
                                <Text style={styles.jsonText}>{JSON.stringify(decoded.header, null, 4)}</Text>
                            </View>

                            <Text style={styles.sectionTitle}>PAYLOAD <Text style={styles.sectionSubtitle}>(Data Claims)</Text></Text>
                            <View style={[styles.jsonBox, { borderColor: 'rgba(168, 85, 247, 0.3)' }, COLORS.getGlow('#a855f7', 8, 0.05)]}>
                                <Text style={styles.jsonText}>{JSON.stringify(decoded.payload, null, 4)}</Text>
                            </View>

                            <Text style={styles.sectionTitle}>SIGNATURE</Text>
                            <View style={[styles.jsonBox, { borderColor: 'rgba(59, 130, 246, 0.3)' }, COLORS.getGlow('#3b82f6', 8, 0.05)]}>
                                <Text style={styles.signatureText}>{decoded.signature}</Text>
                            </View>
                        </View>
                    ) : null}
                </ScrollView>
            </PremiumGate>
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
        marginBottom: 25,
        textAlign: 'center',
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
        marginBottom: 10,
    },
    inputArea: {
        height: 140,
        padding: 15,
        fontSize: 14,
        color: COLORS.white,
        textAlignVertical: 'top',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    errorText: {
        color: COLORS.error,
        marginLeft: 10,
        flexShrink: 1,
        fontWeight: '600',
        fontSize: 14,
    },
    resultContainer: {
        marginTop: 20,
    },
    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 25,
    },
    expiredBox: {
        backgroundColor: COLORS.error + 'D0',
    },
    validBox: {
        backgroundColor: COLORS.success + 'D0',
    },
    statusTitle: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 18,
    },
    statusDesc: {
        color: '#fff',
        fontSize: 13,
        opacity: 0.9,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 10,
        marginTop: 15,
    },
    sectionSubtitle: {
        fontWeight: 'normal',
        color: COLORS.textMuted,
        fontSize: 12,
    },
    jsonBox: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 20,
    },
    jsonText: {
        color: '#a5b4fc',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 13,
    },
    signatureText: {
        color: '#93c5fd',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
        lineHeight: 18,
    },
});

export default JWTDecoder;
