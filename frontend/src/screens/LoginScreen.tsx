import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
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

const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const next: { email?: string; password?: string } = {};
        if (!email.trim()) next.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address';
        if (!password) next.password = 'Password is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await login(email, password);
            if (res && res.requiresOtp) {
                navigation.navigate('VerifyOtp', { email: email.trim() });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
            Alert.alert('Login Failed', errorMessage);
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
                    <View style={styles.header}>
                        <View style={styles.logoWrapper}>
                            <Image source={require('../../assets/icon.png')} style={styles.logoIcon} />
                        </View>
                        <Text variant="eyebrow" tone="accent" style={styles.eyebrow}>
                            NovaEdge Digital Labs
                        </Text>
                        <Text variant="display" center>Welcome back</Text>
                        <Text variant="bodyLarge" tone="muted" center style={styles.subtitle}>
                            Sign in to pick up where you left off.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Email"
                            icon="mail-outline"
                            placeholder="you@example.com"
                            value={email}
                            onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
                            error={errors.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            returnKeyType="next"
                        />

                        <Input
                            label="Password"
                            icon="lock-closed-outline"
                            placeholder="Your password"
                            value={password}
                            onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
                            error={errors.password}
                            password
                            autoComplete="password"
                            returnKeyType="go"
                            onSubmitEditing={handleLogin}
                        />

                        <Pressable
                            style={styles.forgotPassword}
                            hitSlop={8}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text variant="label" tone="accent">Forgot password?</Text>
                        </Pressable>

                        <Button title="Sign in" onPress={handleLogin} loading={loading} size="lg" />

                        <View style={styles.signupContainer}>
                            <Text variant="body" tone="muted">Don't have an account? </Text>
                            <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
                                <Text variant="bodyStrong" tone="accent">Sign up</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text variant="caption" tone="faint" center>By continuing, you agree to our</Text>
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
        justifyContent: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logoWrapper: {
        width: 72,
        height: 72,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(COLORS.primary, 0.12),
        borderWidth: 1,
        borderColor: withAlpha(COLORS.primary, 0.3),
        marginBottom: SPACING.md,
        overflow: 'hidden',
    },
    logoIcon: {
        width: 48,
        height: 48,
        resizeMode: 'contain',
    },
    eyebrow: {
        marginBottom: SPACING.sm,
    },
    subtitle: {
        marginTop: SPACING.sm,
        maxWidth: 300,
    },
    form: {
        width: '100%',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.lg,
        marginTop: -SPACING.xs,
    },
    signupContainer: {
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

export default LoginScreen;
