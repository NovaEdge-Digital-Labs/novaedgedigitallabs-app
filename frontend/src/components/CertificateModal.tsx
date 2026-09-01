import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Share, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface CertificateModalProps {
    visible: boolean;
    onClose: () => void;
    courseTitle: string;
    studentName: string;
    issueDate?: string;
    certificateId?: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
    visible,
    onClose,
    courseTitle,
    studentName,
    issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    certificateId = 'CERT-' + Math.random().toString(36).substring(2, 9).toUpperCase()
}) => {

    const handleShare = async () => {
        try {
            const message = `🎉 I just completed "${courseTitle}" on NovaEdge Digital Labs!\n\nCertificate Verification ID: ${certificateId}\n\nCheck out NovaEdge Academy to upskill your tech skills!`;
            if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).navigator?.share) {
                await (window as any).navigator.share({ title: 'Course Certificate', text: message });
            } else {
                await Share.share({ message });
            }
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Certificate of Completion</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Certificate Outer Frame */}
                    <LinearGradient
                        colors={['#9127FF', '#C042FF', '#00FF9D']}
                        style={styles.gradientBorder}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.certBody}>
                            <Ionicons name="ribbon" size={48} color={COLORS.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />

                            <Text style={styles.certHeading}>CERTIFICATE OF COMPLETION</Text>
                            <Text style={styles.subHeading}>PROUDLY PRESENTED TO</Text>

                            <Text style={styles.studentName}>{studentName || 'Student'}</Text>
                            <View style={styles.divider} />

                            <Text style={styles.completionText}>for successfully completing the course</Text>
                            <Text style={styles.courseTitle}>{courseTitle}</Text>

                            <View style={styles.certFooter}>
                                <View style={styles.footerCol}>
                                    <Text style={styles.footerLabel}>DATE ISSUED</Text>
                                    <Text style={styles.footerValue}>{issueDate}</Text>
                                </View>

                                <View style={styles.sealBadge}>
                                    <Ionicons name="checkmark-seal" size={32} color="#FFD700" />
                                    <Text style={styles.sealText}>VERIFIED</Text>
                                </View>

                                <View style={styles.footerCol}>
                                    <Text style={styles.footerLabel}>VERIFICATION ID</Text>
                                    <Text style={styles.footerValue}>{certificateId}</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
                            <Ionicons name="share-social" size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.shareButtonText}>Share Certificate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    container: {
        width: '100%',
        maxWidth: 450,
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    closeBtn: {
        padding: 4,
    },
    gradientBorder: {
        padding: 3,
        borderRadius: 20,
        marginBottom: 20,
    },
    certBody: {
        backgroundColor: '#0A001A',
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
    },
    certHeading: {
        fontSize: 14,
        fontWeight: '900',
        color: COLORS.primary,
        letterSpacing: 2,
        marginBottom: 4,
    },
    subHeading: {
        fontSize: 10,
        color: COLORS.textMuted,
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    studentName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: 8,
    },
    divider: {
        width: 100,
        height: 2,
        backgroundColor: COLORS.primary,
        marginBottom: 16,
    },
    completionText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: 24,
    },
    certFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    footerCol: {
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 9,
        color: COLORS.textMuted,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    footerValue: {
        fontSize: 11,
        color: COLORS.white,
        fontWeight: '600',
        marginTop: 2,
    },
    sealBadge: {
        alignItems: 'center',
    },
    sealText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#FFD700',
        letterSpacing: 1,
        marginTop: 2,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    shareButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
    },
    shareButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CertificateModal;
