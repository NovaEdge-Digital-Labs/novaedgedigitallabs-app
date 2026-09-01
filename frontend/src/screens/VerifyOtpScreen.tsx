import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Pressable,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, withAlpha } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import ThemeWrapper from '../components/ThemeWrapper';
import { Text, Button, TopBar } from '../components/ui';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

const OTP_LENGTH = 6;

const VerifyOtpScreen = ({ route, navigation }: any) => {
    const email = route?.params?.email || '';
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [focused, setFocused] = useState(true);
    const inputRef = useRef<TextInput>(null);
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const submit = async (code: string) => {
        if (code.length < OTP_LENGTH) {
            Alert.alert('Invalid OTP', `Enter the complete ${OTP_LENGTH}-digit code sent to your email.`);
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.verifyOtp(email, code);
            if (res.success) {
                if (res.token && res.user) {
                    await setAuth(res.user, res.token);
                }
                Alert.alert('Email verified', res.message || 'Your email address has been verified.');
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Invalid or expired OTP code.';
            Alert.alert('Verification Failed', msg);
            setOtp('');
        } finally {
            setLoading(false);
        }
    };

    /** Auto-submits on the sixth digit so the button is a fallback, not a step. */
    const handleChange = (raw: string) => {
        const digits = raw.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
        setOtp(digits);
        if (digits.length === OTP_LENGTH) {
            inputRef.current?.blur();
            submit(digits);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setResendLoading(true);
        try {
            const res = await authApi.resendOtp(email);
            if (res.success) {
                setTimer(60);
                setOtp('');
                Alert.alert('OTP resent', res.message || 'A new code has been sent to your email address.');
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
            >
                <TopBar title="Verify email" showBack onBack={() => navigation.goBack()} />

                <View style={styles.content}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="mail-unread-outline" size={30} color={COLORS.accent} />
                    </View>

                    <Text variant="h1" center>Enter your code</Text>
                    <Text variant="body" tone="muted" center style={styles.subtitle}>
                        We sent a {OTP_LENGTH}-digit verification code to
                    </Text>
                    <Text variant="bodyStrong" tone="accent" center style={styles.email} numberOfLines={1}>
                        {email || 'your registered email'}
                    </Text>

                    {/* Segmented boxes over one hidden field, so paste and SMS
                        autofill still deliver the whole code at once. */}
                    <Pressable style={styles.boxRow} onPress={() => inputRef.current?.focus()}>
                        {Array.from({ length: OTP_LENGTH }).map((_, i) => {
                            const char = otp[i];
                            const isCursor = focused && i === otp.length;
                            return (
                                <View
                                    key={i}
                                    style={[
                                        styles.box,
                                        char ? styles.boxFilled : null,
                                        isCursor ? styles.boxActive : null,
                                    ]}
                                >
                                    <Text variant="h2">{char ?? ''}</Text>
                                </View>
                            );
                        })}
                    </Pressable>

                    <TextInput
                        ref={inputRef}
                        style={styles.hiddenInput}
                        value={otp}
                        onChangeText={handleChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        autoComplete="one-time-code"
                        maxLength={OTP_LENGTH}
                        autoFocus
                        caretHidden
                    />

                    <Button
                        title="Verify & continue"
                        onPress={() => submit(otp)}
                        loading={loading}
                        disabled={otp.length < OTP_LENGTH}
                        size="lg"
                        style={styles.verifyBtn}
                    />

                    <View style={styles.resendRow}>
                        <Text variant="body" tone="muted">Didn't get the code?</Text>
                        {resendLoading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} style={styles.resendSpinner} />
                        ) : (
                            <Pressable onPress={handleResend} disabled={timer > 0} hitSlop={8}>
                                <Text
                                    variant="bodyStrong"
                                    tone={timer > 0 ? 'faint' : 'accent'}
                                    style={styles.resendLabel}
                                >
                                    {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
    },
    iconCircle: {
        width: 68,
        height: 68,
        borderRadius: RADIUS.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(COLORS.primary, 0.12),
        borderWidth: 1,
        borderColor: withAlpha(COLORS.primary, 0.3),
        marginBottom: SPACING.lg,
    },
    subtitle: {
        marginTop: SPACING.sm,
    },
    email: {
        marginTop: 2,
        maxWidth: '100%',
    },
    boxRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    box: {
        width: 46,
        height: 56,
        marginHorizontal: 4,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(COLORS.white, 0.05),
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    boxFilled: {
        borderColor: withAlpha(COLORS.primary, 0.5),
        backgroundColor: withAlpha(COLORS.primary, 0.1),
    },
    boxActive: {
        borderColor: COLORS.primary,
        backgroundColor: withAlpha(COLORS.primary, 0.14),
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        height: 1,
        width: 1,
        ...TYPOGRAPHY.body,
    },
    verifyBtn: {
        marginTop: SPACING.sm,
    },
    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    resendLabel: {
        marginLeft: 6,
    },
    resendSpinner: {
        marginLeft: 8,
    },
});

export default VerifyOtpScreen;
