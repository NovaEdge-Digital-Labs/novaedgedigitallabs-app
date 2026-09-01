import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, withAlpha } from '../constants/colors';
import { useAuthStore } from '../store/authStore';
import ThemeWrapper from '../components/ThemeWrapper';
import { Text, Button, Input } from '../components/ui';
import { CONFIG } from '../constants/config';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>;

const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const register = useAuthStore((state) => state.register);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const clear = (key: keyof Errors) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

    /** Inline, per-field errors replace the previous one-Alert-at-a-time flow. */
    const validate = () => {
        const next: Errors = {};
        if (!name.trim()) next.name = 'Name is required';
        if (!email.trim()) next.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address';
        if (!password) next.password = 'Password is required';
        else if (password.length < 6) next.password = 'Use at least 6 characters';
        if (!confirmPassword) next.confirmPassword = 'Confirm your password';
        else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await register(name, email, password, referralCode);
            if (res && res.requiresOtp) {
                navigation.navigate('VerifyOtp', { email: email.trim() });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
                        <Ionicons name="chevron-back" size={20} color={COLORS.text} />
                    </Pressable>

                    <View style={styles.header}>
                        <Text variant="eyebrow" tone="accent" style={styles.eyebrow}>
                            NovaEdge Digital Labs
                        </Text>
                        <Text variant="display">Create account</Text>
                        <Text variant="bodyLarge" tone="muted" style={styles.subtitle}>
                            Join the studio and start building today.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Full name"
                            icon="person-outline"
                            placeholder="Ada Lovelace"
                            value={name}
                            onChangeText={(t) => { setName(t); clear('name'); }}
                            error={errors.name}
                            autoCapitalize="words"
                            autoComplete="name"
                        />

                        <Input
                            label="Email"
                            icon="mail-outline"
                            placeholder="you@example.com"
                            value={email}
                            onChangeText={(t) => { setEmail(t); clear('email'); }}
                            error={errors.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            icon="lock-closed-outline"
                            placeholder="At least 6 characters"
                            value={password}
                            onChangeText={(t) => { setPassword(t); clear('password'); }}
                            error={errors.password}
                            hint={!errors.password ? 'Minimum 6 characters' : undefined}
                            password
                            autoComplete="new-password"
                        />

                        <Input
                            label="Confirm password"
                            icon="shield-checkmark-outline"
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onChangeText={(t) => { setConfirmPassword(t); clear('confirmPassword'); }}
                            error={errors.confirmPassword}
                            password
                            autoComplete="new-password"
                        />

                        <Input
                            label="Referral code"
                            icon="gift-outline"
                            placeholder="Optional"
                            value={referralCode}
                            onChangeText={setReferralCode}
                            autoCapitalize="characters"
                        />

                        <Button
                            title="Create account"
                            onPress={handleRegister}
                            loading={loading}
                            size="lg"
                            style={styles.submit}
                        />

                        <View style={styles.loginContainer}>
                            <Text variant="body" tone="muted">Already have an account? </Text>
                            <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
                                <Text variant="bodyStrong" tone="accent">Sign in</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text variant="caption" tone="faint" center>
                            By creating an account, you agree to our
                        </Text>
                        <View style={styles.footerLinks}>
                            <Pressable
                                hitSlop={8}
                                onPress={() => Linking.openURL(`${CONFIG.BASE_URL}/terms-and-conditions.html`)}
                            >
                                <Text variant="caption" tone="accent">Terms of Service</Text>
                            </Pressable>
                            <Text variant="caption" tone="faint"> & </Text>
                            <Pressable
                                hitSlop={8}
                                onPress={() => Linking.openURL(`${CONFIG.BASE_URL}/privacy-policy.html`)}
                            >
                                <Text variant="caption" tone="accent">Privacy Policy</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(COLORS.white, 0.06),
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    header: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    eyebrow: {
        marginBottom: SPACING.sm,
    },
    subtitle: {
        marginTop: SPACING.sm,
        maxWidth: 320,
    },
    form: {
        width: '100%',
    },
    submit: {
        marginTop: SPACING.sm,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
});

export default RegisterScreen;
