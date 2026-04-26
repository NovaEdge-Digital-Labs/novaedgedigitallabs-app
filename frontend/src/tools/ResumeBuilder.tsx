import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';

const ResumeBuilder = ({ navigation }: any) => {
    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Resume Builder</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={[styles.card, COLORS.getGlow(COLORS.secondary, 15, 0.1)]}>
                    <Ionicons name="brush-outline" size={64} color={COLORS.secondary} />
                    <Text style={styles.title}>Coming Soon</Text>
                    <Text style={styles.description}>
                        Build professional resumes in minutes with our upcoming AI-powered builder.
                    </Text>
                </View>
            </View>
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
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        ...COLORS.glass,
        padding: 40,
        borderRadius: 30,
        alignItems: 'center',
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 20,
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default ResumeBuilder;
