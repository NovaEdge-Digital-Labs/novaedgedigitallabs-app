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
    Alert,
    ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ThemeWrapper from '../components/ThemeWrapper';
import PrimaryButton from '../components/PrimaryButton';
import axios from 'axios';
import { CONFIG } from '../constants/config';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleResetRequest = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${CONFIG.API_URL}/auth/forgot-password`, { email });
            if (response.data.success) {
                setIsSubmitted(true);
                if (__DEV__ && response.data.resetToken) {
                    console.log('Reset Token (Dev only):', response.data.resetToken);
                }
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
            Alert.alert('Request Failed', errorMessage);
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
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            {isSubmitted
                                ? "Check your email for the password reset link."
                                : "Enter your email address and we'll send you a link to reset your password."}
                        </Text>
                    </View>

                    {!isSubmitted ? (
                        <View style={styles.form}>
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

                            <PrimaryButton
                                title="Send Reset Link"
                                onPress={handleResetRequest}
                                loading={loading}
                                style={styles.resetButton}
                            />
                        </View>
                    ) : (
                        <View style={styles.successContainer}>
                            <View style={styles.successIconWrapper}>
                                <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
                            </View>
                            <PrimaryButton
                                title="Enter Reset Token"
                                onPress={() => navigation.navigate('ResetPassword')}
                                style={[styles.resetButton, { marginTop: 15, backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                            />
                            <PrimaryButton
                                title="Back to Sign In"
                                onPress={() => navigation.navigate('Login')}
                                style={[styles.resetButton, { marginTop: 15 }]}
                            />
                        </View>
                    )}
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
        marginBottom: 40,
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        lineHeight: 24,
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
        marginBottom: 25,
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
    resetButton: {
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIconWrapper: {
        marginBottom: 30,
    }
});

export default ForgotPasswordScreen;
