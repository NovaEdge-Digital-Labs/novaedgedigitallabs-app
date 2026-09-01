import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface HowEscrowWorksModalProps {
    visible: boolean;
    onClose: () => void;
}

const HowEscrowWorksModal: React.FC<HowEscrowWorksModalProps> = ({ visible, onClose }) => {
    const steps = [
        {
            number: '1',
            icon: 'wallet-outline',
            title: 'Payment Held in Escrow',
            desc: 'Jab client order/proposal accept karta hai, payment NovaEdge Escrow me safely lock ho jata hai. Freelancer ya client ise direct withdraw nahi kar sakte.'
        },
        {
            number: '2',
            icon: 'code-working-outline',
            title: 'Work Completed & Delivered',
            desc: 'Freelancer project par kaam karke final deliverables submit karta hai. Client kaam ko review karke feedback ya approval deta hai.'
        },
        {
            number: '3',
            icon: 'checkmark-done-circle-outline',
            title: '100% Funds Released',
            desc: 'Client ke approval ke baad Escrow se payment turant freelancer ke wallet/bank account me release kar diya jata hai. Zero Risk!'
        }
    ];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContent, COLORS.glass]}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Ionicons name="shield-checkmark" size={24} color={COLORS.success || '#00FF9D'} />
                            <Text style={styles.title}>How Escrow Protects You</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
                        {steps.map((s, idx) => (
                            <View key={idx} style={styles.stepCard}>
                                <View style={styles.stepHeader}>
                                    <View style={styles.stepBadge}>
                                        <Text style={styles.stepBadgeText}>Step {s.number}</Text>
                                    </View>
                                    <Ionicons name={s.icon as any} size={22} color={COLORS.primary} />
                                </View>
                                <Text style={styles.stepTitle}>{s.title}</Text>
                                <Text style={styles.stepDesc}>{s.desc}</Text>
                            </View>
                        ))}

                        <View style={styles.guaranteeBox}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.success || '#00FF9D'} style={{ marginRight: 10 }} />
                            <Text style={styles.guaranteeText}>
                                100% Money-Back Escrow Guarantee by NovaEdge Digital Labs
                            </Text>
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
                        <Text style={styles.gotItText}>Samajh Gaya!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        maxHeight: '85%',
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    closeBtn: {
        padding: 4,
    },
    body: {
        marginBottom: 16,
    },
    stepCard: {
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepBadge: {
        backgroundColor: COLORS.primary + '25',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    stepBadgeText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 19,
    },
    guaranteeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 255, 157, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 157, 0.2)',
        borderRadius: 12,
        padding: 14,
        marginTop: 6,
    },
    guaranteeText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.success || '#00FF9D',
        flex: 1,
    },
    gotItButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    gotItText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HowEscrowWorksModal;
