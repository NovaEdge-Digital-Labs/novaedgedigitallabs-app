import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import PrimaryButton from '../components/PrimaryButton';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

const VerifyOtpScreen = ({ route, navigation }: any) => {
    const email = route?.params?.email || '';
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        let interval: any = null;
        if (timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        if (!otp || otp.trim().length < 6) {
            Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP code sent to your email.');
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.verifyOtp(email, otp.trim());
            if (res.success) {
                if (res.token && res.user) {
                    await setAuth(res.user, res.token);
                }
                Alert.alert('Email Verified! 🎉', res.message || 'Your email address has been verified successfully.');
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Invalid or expired OTP code.';
            Alert.alert('Verification Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setResendLoading(true);
        try {
            const res = await authApi.resendOtp(email);
            if (res.success) {
                setTimer(60);
                Alert.alert('OTP Resent', res.message || 'A new 6-digit OTP has been sent to your email address.');
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to resend OTP code.';
            Alert.alert('Resend Failed', msg);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <ThemeWrapper>
            <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Verify Email</Text>
                <View style={{ width: 36 }} />
            </View>

            <View style={styles.content}>
                {/* Icon Banner */}
                <View style={styles.iconCircle}>
                    <Ionicons name="mail-unread" size={42} color={COLORS.accent || '#C042FF'} />
                </View>

                <Text style={styles.title}>Enter 6-Digit OTP</Text>
                <Text style={styles.subtitle}>
                    We have sent a 6-digit verification code to:
                    {'\n'}
                    <Text style={styles.emailText}>{email || 'your registered email'}</Text>
                </Text>

                {/* OTP Input Field */}
                <View style={styles.inputCard}>
                    <Ionicons name="key-outline" size={22} color="#94A3B8" style={{ marginRight: 10 }} />
                    <TextInput
                        style={styles.otpInput}
                        placeholder="1 2 3 4 5 6"
                        placeholderTextColor="#64748B"
                        value={otp}
                        onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                    />
                </View>

                {/* Verify Button */}
                <PrimaryButton
                    title="Verify Email & Continue"
                    onPress={handleVerify}
                    loading={loading}
                    style={styles.verifyBtn}
                />

                {/* Resend OTP Section */}
                <View style={styles.resendRow}>
                    <Text style={styles.resendText}>Didn't receive the OTP code?</Text>
                    <TouchableOpacity
                        onPress={handleResend}
                        disabled={timer > 0 || resendLoading}
                        style={{ opacity: timer > 0 ? 0.5 : 1 }}
                    >
                        {resendLoading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 6 }} />
                        ) : (
                            <Text style={styles.resendBtnText}>
                                {timer > 0 ? ` Resend in ${timer}s` : ' Resend OTP'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 30,
        alignItems: 'center',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(145, 39, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(192, 66, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    emailText: {
        color: COLORS.accent || '#C042FF',
        fontWeight: 'bold',
    },
    inputCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(145, 39, 255, 0.3)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 24,
    },
    otpInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 8,
    },
    verifyBtn: {
        width: '100%',
        height: 54,
        borderRadius: 16,
        marginBottom: 24,
    },
    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendText: {
        color: COLORS.textMuted,
        fontSize: 13,
    },
    resendBtnText: {
        color: COLORS.accent || '#C042FF',
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default VerifyOtpScreen;
