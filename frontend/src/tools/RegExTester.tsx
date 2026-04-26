import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import PremiumGate from '../components/PremiumGate';
import ThemeWrapper from '../components/ThemeWrapper';

const PRESETS = [
    { name: 'Email', regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: 'i' },
    { name: 'URL', regex: '^(https?:\\/\\/)?([\\w\\d\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$', flags: 'i' },
    { name: 'Number', regex: '\\d+', flags: 'g' },
    { name: 'Phone', regex: '^\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$', flags: '' },
];

const RegExTester = ({ navigation }: any) => {
    const [pattern, setPattern] = useState('');
    const [flags, setFlags] = useState('g');
    const [testString, setTestString] = useState('');

    const toggleFlag = (flag: string) => {
        if (flags.includes(flag)) {
            setFlags(flags.replace(flag, ''));
        } else {
            setFlags(flags + flag);
        }
    };

    const result = useMemo(() => {
        if (!pattern) return { matches: [], error: null, components: [<Text key="0" style={styles.testText}>{testString}</Text>] };

        try {
            const regex = new RegExp(pattern, flags);
            let matches: any[] = [];

            if (flags.includes('g')) {
                const iter = testString.matchAll(regex);
                for (const match of iter) {
                    matches.push(match);
                }
            } else {
                const match = testString.match(regex);
                if (match) matches.push(match);
            }

            let components = [];
            if (matches.length > 0) {
                let lastIndex = 0;
                matches.forEach((m, i) => {
                    if (m.index !== undefined) {
                        const before = testString.substring(lastIndex, m.index);
                        const matchText = m[0];

                        if (before) components.push(<Text key={`b_${i}`} style={styles.testText}>{before}</Text>);
                        components.push(<Text key={`m_${i}`} style={styles.highlightText}>{matchText}</Text>);

                        lastIndex = m.index + matchText.length;
                    }
                });
                const remaining = testString.substring(lastIndex);
                if (remaining) components.push(<Text key="rem" style={styles.testText}>{remaining}</Text>);

            } else {
                components = [<Text key="0" style={styles.testText}>{testString}</Text>];
            }

            return { matches, error: null, components };
        } catch (e: any) {
            return { matches: [], error: e.message, components: [<Text key="0" style={styles.testText}>{testString}</Text>] };
        }
    }, [pattern, flags, testString]);

    return (
        <ThemeWrapper>
            <PremiumGate navigation={navigation}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>RegEx Tester</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Text style={styles.label}>Pattern</Text>
                    <View style={[styles.regexInputContainer, COLORS.getGlow(COLORS.primary, 10, 0.05)]}>
                        <Text style={styles.regexSlashes}>/</Text>
                        <TextInput
                            style={[styles.regexInput, { color: COLORS.white }]}
                            placeholder="[a-zA-Z0-9]+"
                            placeholderTextColor={COLORS.textMuted}
                            value={pattern}
                            onChangeText={setPattern}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Text style={styles.regexSlashes}>/{flags}</Text>
                    </View>

                    {result.error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                            <Text style={styles.errorText}>Invalid Pattern: {result.error}</Text>
                        </View>
                    )}

                    <Text style={[styles.label, { marginTop: 20 }]}>Flags</Text>
                    <View style={styles.flagsContainer}>
                        {['g', 'i', 'm', 's'].map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.flagButton, flags.includes(f) && styles.flagButtonActive]}
                                onPress={() => toggleFlag(f)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.flagText, flags.includes(f) && styles.flagTextActive]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { marginTop: 20 }]}>Test String</Text>
                    <View style={[styles.inputBox, COLORS.getGlow(COLORS.glow, 8, 0.05)]}>
                        <TextInput
                            style={[styles.stringInput, { color: COLORS.white }]}
                            multiline
                            placeholder="Enter text to test..."
                            placeholderTextColor={COLORS.textMuted}
                            value={testString}
                            onChangeText={setTestString}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={[styles.resultContainer, COLORS.getGlow(COLORS.glow, 15, 0.1)]}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultTitle}>Matches ({result.matches.length})</Text>
                            {result.matches.length > 0 && <Ionicons name="checkmark-done" size={20} color={COLORS.success} />}
                        </View>
                        <ScrollView style={styles.resultBox} showsVerticalScrollIndicator={true}>
                            <Text>{result.components}</Text>
                        </ScrollView>
                    </View>

                    <Text style={styles.label}>Presets</Text>
                    <View style={styles.presetContainer}>
                        {PRESETS.map((preset, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.presetButton}
                                onPress={() => { setPattern(preset.regex); setFlags(preset.flags); }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.presetButtonText}>{preset.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textLight,
        marginBottom: 10,
    },
    regexInputContainer: {
        ...COLORS.glass,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    regexSlashes: {
        fontSize: 20,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    regexInput: {
        flex: 1,
        height: 54,
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginHorizontal: 10,
        color: COLORS.white,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 5,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '600',
    },
    flagsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 10,
    },
    flagButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flagButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    flagText: {
        fontWeight: 'bold',
        color: COLORS.textMuted,
        fontSize: 16,
    },
    flagTextActive: {
        color: '#fff',
    },
    inputBox: {
        ...COLORS.glass,
        borderRadius: 20,
        padding: 5,
    },
    stringInput: {
        height: 120,
        padding: 15,
        fontSize: 15,
        color: COLORS.white,
        textAlignVertical: 'top',
    },
    resultContainer: {
        marginTop: 25,
        marginBottom: 25,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    resultBox: {
        padding: 20,
        maxHeight: 200,
    },
    testText: {
        fontSize: 16,
        color: COLORS.textLight,
        lineHeight: 24,
    },
    highlightText: {
        fontSize: 16,
        backgroundColor: COLORS.primary + '40',
        color: COLORS.white,
        fontWeight: 'bold',
        lineHeight: 24,
        borderRadius: 4,
        paddingHorizontal: 2,
    },
    presetContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 5,
        marginBottom: 30,
    },
    presetButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    presetButtonText: {
        color: COLORS.textLight,
        fontWeight: '600',
        fontSize: 13,
    },
});

export default RegExTester;
