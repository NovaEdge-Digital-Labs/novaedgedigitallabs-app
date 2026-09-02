import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/colors';
import { Text as UIText } from './Text';
import Button from './Button';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                {Platform.OS !== 'web' && <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />}
                {Platform.OS === 'web' && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />}
                
                <View style={styles.modalContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons 
                            name={isDestructive ? 'warning-outline' : 'information-circle-outline'} 
                            size={32} 
                            color={isDestructive ? COLORS.error : COLORS.primary} 
                        />
                    </View>
                    
                    <UIText variant="h3" style={styles.title}>{title}</UIText>
                    <UIText variant="body" tone="secondary" style={styles.message}>{message}</UIText>
                    
                    <View style={styles.buttonRow}>
                        <Button
                            title={cancelText}
                            variant="ghost"
                            onPress={onCancel}
                            style={styles.button}
                            textStyle={{ color: COLORS.textMuted }}
                        />
                        <Button
                            title={confirmText}
                            variant={isDestructive ? 'primary' : 'primary'}
                            onPress={onConfirm}
                            style={[styles.button, isDestructive && { backgroundColor: COLORS.error, borderColor: COLORS.error }]}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    message: {
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        width: '100%',
    },
    button: {
        flex: 1,
    }
});
