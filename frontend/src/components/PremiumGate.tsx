import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../store/authStore';

import { LinearGradient } from 'expo-linear-gradient';

const PremiumGate = ({ children, navigation }: { children: React.ReactNode; navigation: any }) => {
    const { user } = useAuthStore();
    const primaryGradient = COLORS.getGradient(COLORS.primaryGradient);

    if (!user || user.plan === 'free') {
        return (
            <View style={styles.container}>
                <View style={styles.glassCard}>
                    <View style={[styles.iconContainer, COLORS.getGlow(COLORS.primary, 20, 0.5)]}>
                        <Ionicons name="lock-closed" size={40} color="#fff" />
                    </View>
                    <Text style={styles.title}>Pro Feature</Text>
                    <Text style={styles.desc}>This advanced tool is exclusively available for Pro and Business plan members. Upgrade your plan to unlock full access.</Text>

                    <TouchableOpacity
                        style={[styles.button, COLORS.getGlow(COLORS.primary, 15, 0)]}
                        onPress={() => navigation.navigate('Profile', { screen: 'Subscription' })}
                    >
                        <LinearGradient
                            colors={primaryGradient}
                            style={[StyleSheet.absoluteFill, { borderRadius: 30 }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Text style={styles.buttonText}>View Plans</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    glassCard: {
        backgroundColor: 'transparent',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.white,
        marginBottom: 16,
    },
    desc: {
        fontSize: 15,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 35,
    },
    button: {
        height: 56,
        width: '100%',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    backButton: {
        paddingVertical: 12,
    },
    backButtonText: {
        color: COLORS.textMuted,
        fontSize: 15,
        fontWeight: '600',
    },
});

export default PremiumGate;
