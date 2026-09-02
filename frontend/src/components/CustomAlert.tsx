import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    Animated,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlertStore, AlertButton, AlertType } from '../store/alertStore';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

const CustomAlert: React.FC = () => {
    const { visible, title, message, type, buttons, hideAlert } = useAlertStore();

    if (!visible) return null;

    const getTypeConfig = (alertType: AlertType) => {
        switch (alertType) {
            case 'error':
                return {
                    icon: 'close-circle' as const,
                    gradient: ['#EF4444', '#DC2626'] as const,
                    glowColor: 'rgba(239, 68, 68, 0.4)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    badgeBg: 'rgba(239, 68, 68, 0.15)',
                    buttonGradient: ['#EF4444', '#991B1B'] as const
                };
            case 'success':
                return {
                    icon: 'checkmark-circle' as const,
                    gradient: ['#10B981', '#059669'] as const,
                    glowColor: 'rgba(16, 185, 129, 0.4)',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    badgeBg: 'rgba(16, 185, 129, 0.15)',
                    buttonGradient: ['#10B981', '#047857'] as const
                };
            case 'warning':
                return {
                    icon: 'warning' as const,
                    gradient: ['#F59E0B', '#D97706'] as const,
                    glowColor: 'rgba(245, 158, 11, 0.4)',
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    badgeBg: 'rgba(245, 158, 11, 0.15)',
                    buttonGradient: ['#F59E0B', '#B45309'] as const
                };
            case 'info':
            default:
                return {
                    icon: 'information-circle' as const,
                    gradient: ['#8B5CF6', '#6D28D9'] as const,
                    glowColor: 'rgba(139, 92, 246, 0.4)',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    badgeBg: 'rgba(139, 92, 246, 0.15)',
                    buttonGradient: ['#8B5CF6', '#6C5CE7'] as const
                };
        }
    };

    const config = getTypeConfig(type);

    const handleButtonPress = (btn: AlertButton) => {
        hideAlert();
        if (btn.onPress) {
            btn.onPress();
        }
    };

    const isMultiButton = buttons.length > 1;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={hideAlert}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={hideAlert}
            >
                <TouchableWithoutFeedback>
                    <View style={[styles.alertContainer, { borderColor: config.borderColor }]}>
                        {/* Top Icon Badge */}
                        <View style={[styles.iconWrapper, { backgroundColor: config.badgeBg }]}>
                            <LinearGradient
                                colors={config.gradient}
                                style={styles.iconCircle}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name={config.icon} size={32} color="#FFFFFF" />
                            </LinearGradient>
                        </View>

                        {/* Title & Message */}
                        <Text style={styles.title}>{title}</Text>
                        {!!message && <Text style={styles.message}>{message}</Text>}

                        {/* Action Buttons */}
                        <View style={[styles.buttonRow, isMultiButton ? styles.multiButtonRow : styles.singleButtonRow]}>
                            {buttons.map((btn: AlertButton, index: number) => {
                                const isCancel = btn.style === 'cancel';
                                const isDestructive = btn.style === 'destructive';

                                if (isCancel) {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.btn, styles.cancelBtn]}
                                            onPress={() => handleButtonPress(btn)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.cancelBtnText}>{btn.text}</Text>
                                        </TouchableOpacity>
                                    );
                                }

                                const btnGradient = isDestructive
                                    ? (['#EF4444', '#DC2626'] as const)
                                    : config.buttonGradient;

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.btn, isMultiButton && { flex: 1 }, { backgroundColor: isDestructive ? '#EF4444' : COLORS.primary, overflow: 'hidden' }]}
                                        onPress={() => handleButtonPress(btn)}
                                        activeOpacity={0.85}
                                    >
                                        <View style={[styles.gradientBtn, { backgroundColor: 'transparent' }]}>
                                            <Text style={styles.btnText}>{btn.text}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(5, 4, 15, 0.82)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    alertContainer: {
        width: Math.min(width - 48, 380),
        backgroundColor: '#16132A',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 10,
    },
    iconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    message: {
        fontSize: 14,
        color: '#A1A1AA',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
    },
    buttonRow: {
        width: '100%',
    },
    singleButtonRow: {
        flexDirection: 'column',
    },
    multiButtonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    btn: {
        borderRadius: 14,
        overflow: 'hidden',
        height: 48,
        justifyContent: 'center',
    },
    gradientBtn: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 14,
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#E4E4E7',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default CustomAlert;
