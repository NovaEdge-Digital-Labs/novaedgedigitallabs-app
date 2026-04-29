import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    Linking
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import ThemeWrapper from '../components/ThemeWrapper';
import PrimaryButton from '../components/PrimaryButton';
import { CONFIG } from '../constants/config';

const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const register = useAuthStore((state) => state.register);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
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
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <View style={styles.logoWrapper}>
                            <Text style={[styles.logoText, COLORS.getGlow(COLORS.primary, 15, 0)]}>NovaEdge</Text>
                            <Text style={styles.brandSubtitle}>Digital Labs</Text>
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join NovaEdge and start building today.</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor={COLORS.textMuted}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor={COLORS.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={COLORS.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor={COLORS.textMuted}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={COLORS.textMuted}
                                />
                            </TouchableOpacity>
                        </View>

                        <PrimaryButton
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            style={styles.registerButton}
                        />

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>By creating an account, you agree to our</Text>
                        <View style={styles.footerLinks}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => Linking.openURL(`${CONFIG.BASE_URL}/terms-and-conditions.html`)}
                            >
                                <Text style={styles.footerLink}>Terms of Service</Text>
                            </TouchableOpacity>
                            <Text style={styles.footerText}> & </Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => Linking.openURL(`${CONFIG.BASE_URL}/privacy-policy.html`)}
                            >
                                <Text style={styles.footerLink}>Privacy Policy</Text>
                            </TouchableOpacity>
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
        padding: 30,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 35,
    },
    backButton: {
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    logoWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoText: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -0.5,
    },
    brandSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
        marginTop: -4,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textMuted,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        height: 55,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    registerButton: {
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        overflow: 'hidden',
    },
    registerButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    loginText: {
        color: COLORS.textLight,
        fontSize: 14,
    },
    loginLink: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    footerLinks: {
        flexDirection: 'row',
        marginTop: 5,
    },
    footerLink: {
        fontSize: 12,
        color: COLORS.accent,
        textDecorationLine: 'underline',
    },
});

export default RegisterScreen;
