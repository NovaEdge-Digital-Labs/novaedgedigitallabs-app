import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import Slider from '@react-native-community/slider';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import ThemeWrapper from '../components/ThemeWrapper';

const { width } = Dimensions.get('window');

const EMICalculator = ({ navigation }: any) => {
    const [principalStr, setPrincipalStr] = useState('500000');
    const [rateStr, setRateStr] = useState('8.5');
    const [tenureMonths, setTenureMonths] = useState(60);

    const calculation = useMemo(() => {
        const p = parseFloat(principalStr);
        const rAnnual = parseFloat(rateStr);
        const n = tenureMonths;

        if (isNaN(p) || isNaN(rAnnual) || p <= 0 || rAnnual <= 0 || n <= 0) {
            return null;
        }

        const r = rAnnual / 12 / 100;
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalAmount = emi * n;
        const totalInterest = totalAmount - p;

        return {
            emi: emi.toFixed(0),
            totalInterest: totalInterest.toFixed(0),
            totalAmount: totalAmount.toFixed(0),
            principal: p.toFixed(0)
        };
    }, [principalStr, rateStr, tenureMonths]);

    const renderChart = () => {
        if (!calculation) return null;

        const p = parseFloat(calculation.principal);
        const i = parseFloat(calculation.totalInterest);
        const total = parseFloat(calculation.totalAmount);

        const chartWidth = width - 80;
        const chartHeight = 150;
        const maxBarPx = chartHeight - 40;

        const principalHeight = (p / total) * maxBarPx;
        const interestHeight = (i / total) * maxBarPx;

        return (
            <View style={[styles.chartContainer, COLORS.getGlow(COLORS.glow, 10, 0.05)]}>
                <Text style={styles.chartTitle}>Payment Breakdown</Text>
                <Svg width={chartWidth} height={chartHeight} style={{ marginTop: 25 }}>
                    <Rect
                        x={chartWidth * 0.2}
                        y={chartHeight - principalHeight - 20}
                        width={40}
                        height={principalHeight}
                        fill={COLORS.primary}
                        rx={6}
                    />
                    <SvgText
                        x={chartWidth * 0.2 + 20}
                        y={chartHeight - principalHeight - 28}
                        fill={COLORS.textLight}
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                    >
                        Principal
                    </SvgText>

                    <Rect
                        x={chartWidth * 0.6}
                        y={chartHeight - interestHeight - 20}
                        width={40}
                        height={interestHeight}
                        fill={COLORS.error}
                        rx={6}
                    />
                    <SvgText
                        x={chartWidth * 0.6 + 20}
                        y={chartHeight - interestHeight - 28}
                        fill={COLORS.textLight}
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                    >
                        Interest
                    </SvgText>

                    <Line
                        x1="0"
                        y1={chartHeight - 19}
                        x2={chartWidth}
                        y2={chartHeight - 19}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="2"
                    />
                </Svg>
            </View>
        );
    };

    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>EMI Calculator</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, COLORS.getGlow(COLORS.primary, 10, 0.05)]}>
                    <Text style={styles.label}>Loan Amount (₹)</Text>
                    <TextInput
                        style={[styles.input, { color: COLORS.white }]}
                        keyboardType="numeric"
                        value={principalStr}
                        onChangeText={setPrincipalStr}
                    />

                    <Text style={[styles.label, { marginTop: 25 }]}>Interest Rate (%) p.a.</Text>
                    <TextInput
                        style={[styles.input, { color: COLORS.white }]}
                        keyboardType="numeric"
                        value={rateStr}
                        onChangeText={setRateStr}
                    />

                    <Text style={[styles.label, { marginTop: 25 }]}>Tenure: {tenureMonths > 11 ? `${(tenureMonths / 12).toFixed(1)} Years` : `${tenureMonths} Months`}</Text>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={6}
                        maximumValue={360}
                        step={6}
                        value={tenureMonths}
                        onValueChange={setTenureMonths}
                        minimumTrackTintColor={COLORS.primary}
                        maximumTrackTintColor={COLORS.border}
                        thumbTintColor={COLORS.primary}
                    />
                </View>

                {calculation && (
                    <View style={[styles.resultCard, COLORS.getGlow(COLORS.glow, 15, 0.2)]}>
                        <Text style={styles.emiLabel}>Monthly EMI</Text>
                        <Text style={styles.emiValue}>₹{parseInt(calculation.emi).toLocaleString('en-IN')}</Text>

                        <View style={styles.row}>
                            <View style={styles.half}>
                                <Text style={styles.subLabel}>Total Interest</Text>
                                <Text style={[styles.subValue, { color: COLORS.error }]}>₹{parseInt(calculation.totalInterest).toLocaleString('en-IN')}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.half}>
                                <Text style={styles.subLabel}>Total Amount</Text>
                                <Text style={[styles.subValue, { color: COLORS.primary }]}>₹{parseInt(calculation.totalAmount).toLocaleString('en-IN')}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {renderChart()}
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
    resultCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 25,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emiLabel: {
        color: COLORS.textMuted,
        fontSize: 15,
        marginBottom: 6,
    },
    emiValue: {
        color: COLORS.white,
        fontSize: 42,
        fontWeight: '900',
        marginBottom: 25,
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 20,
        alignItems: 'center',
    },
    half: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    subLabel: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginBottom: 6,
    },
    subValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    chartContainer: {
        ...COLORS.glass,
        padding: 25,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textLight,
    },
});

export default EMICalculator;
