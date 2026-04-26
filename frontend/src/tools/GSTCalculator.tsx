import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import * as Clipboard from 'expo-clipboard';
import ThemeWrapper from '../components/ThemeWrapper';

const GSTCalculator = ({ navigation }: any) => {
    const rates = [5, 12, 18, 28];
    const [amount, setAmount] = useState('');
    const [selectedRate, setSelectedRate] = useState(18);
    const [isExclusive, setIsExclusive] = useState(true);

    const calculation = useMemo(() => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return null;

        let baseAmount = 0;
        let gstAmount = 0;
        let totalAmount = 0;

        if (isExclusive) {
            baseAmount = val;
            gstAmount = val * (selectedRate / 100);
            totalAmount = baseAmount + gstAmount;
        } else {
            totalAmount = val;
            baseAmount = val / (1 + selectedRate / 100);
            gstAmount = totalAmount - baseAmount;
        }

        return {
            baseAmount: baseAmount.toFixed(2),
            cgst: (gstAmount / 2).toFixed(2),
            sgst: (gstAmount / 2).toFixed(2),
            totalGst: gstAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
        };
    }, [amount, selectedRate, isExclusive]);

    const handleCopy = async () => {
        if (!calculation) return;
        const resultString = `Base Amount: ₹${calculation.baseAmount}\nCGST (${selectedRate / 2}%): ₹${calculation.cgst}\nSGST (${selectedRate / 2}%): ₹${calculation.sgst}\nTotal GST: ₹${calculation.totalGst}\nTotal Amount: ₹${calculation.totalAmount}`;
        await Clipboard.setStringAsync(resultString);
        Alert.alert('Copied', 'Results copied to clipboard');
    };

    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>GST Calculator</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.description}>Calculate GST instantly with exclusive or inclusive rates. Completely free to use!</Text>

                <View style={[styles.card, COLORS.getGlow(COLORS.primary, 10, 0.1)]}>
                    <Text style={styles.label}>Amount (₹)</Text>
                    <TextInput
                        style={[styles.input, { color: COLORS.white }]}
                        placeholder="Enter amount"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />

                    <Text style={[styles.label, { marginTop: 25 }]}>GST Rate (%)</Text>
                    <View style={styles.rateContainer}>
                        {rates.map(rate => (
                            <TouchableOpacity
                                key={rate}
                                style={[styles.rateButton, { overflow: 'hidden' }]}
                                onPress={() => setSelectedRate(rate)}
                                activeOpacity={0.7}
                            >
                                {selectedRate === rate && (
                                    <LinearGradient
                                        colors={primaryGradient}
                                        style={StyleSheet.absoluteFill}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    />
                                )}
                                <Text style={[styles.rateText, selectedRate === rate && styles.rateTextActive]}>{rate}%</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { marginTop: 25 }]}>Calculation Type</Text>
                    <View style={styles.typeContainer}>
                        <TouchableOpacity
                            style={[styles.typeButton, { overflow: 'hidden' }]}
                            onPress={() => setIsExclusive(true)}
                            activeOpacity={0.7}
                        >
                            {isExclusive && (
                                <LinearGradient
                                    colors={primaryGradient}
                                    style={StyleSheet.absoluteFill}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                            )}
                            <Text style={[styles.typeText, isExclusive && styles.typeTextActive]}>Exclusive (+GST)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, { overflow: 'hidden' }]}
                            onPress={() => setIsExclusive(false)}
                            activeOpacity={0.7}
                        >
                            {!isExclusive && (
                                <LinearGradient
                                    colors={primaryGradient}
                                    style={StyleSheet.absoluteFill}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                            )}
                            <Text style={[styles.typeText, !isExclusive && styles.typeTextActive]}>Inclusive (-GST)</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {calculation && (
                    <View style={[styles.resultCard, COLORS.getGlow(COLORS.glow, 15, 0.2)]}>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Base Amount</Text>
                            <Text style={styles.resultValue}>₹{calculation.baseAmount}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>CGST ({selectedRate / 2}%)</Text>
                            <Text style={styles.resultValue}>₹{calculation.cgst}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>SGST ({selectedRate / 2}%)</Text>
                            <Text style={styles.resultValue}>₹{calculation.sgst}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.resultRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₹{calculation.totalAmount}</Text>
                        </View>

                        <TouchableOpacity style={[styles.copyButton, COLORS.getGlow(COLORS.primary, 10, 0.3)]} onPress={handleCopy} activeOpacity={0.7}>
                            <LinearGradient
                                colors={primaryGradient}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                            <Ionicons name="copy-outline" size={20} color="#fff" />
                            <Text style={styles.copyButtonText}>Copy Details</Text>
                        </TouchableOpacity>
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
        marginBottom: 25,
        textAlign: 'center',
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
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 16,
        fontSize: 22,
        color: COLORS.white,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    rateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rateButton: {
        flex: 1,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    rateText: {
        fontWeight: '700',
        color: COLORS.textMuted,
        fontSize: 15,
    },
    rateTextActive: {
        color: '#fff',
    },
    typeContainer: {
        flexDirection: 'row',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    typeButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    typeText: {
        fontWeight: '700',
        color: COLORS.textMuted,
        fontSize: 14,
    },
    typeTextActive: {
        color: '#fff',
    },
    resultCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    resultLabel: {
        color: COLORS.textMuted,
        fontSize: 15,
    },
    resultValue: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 16,
    },
    totalLabel: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalValue: {
        color: COLORS.primary,
        fontSize: 26,
        fontWeight: 'bold',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 14,
        marginTop: 25,
        overflow: 'hidden',
    },
    copyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
        marginLeft: 10,
    },
});

export default GSTCalculator;
