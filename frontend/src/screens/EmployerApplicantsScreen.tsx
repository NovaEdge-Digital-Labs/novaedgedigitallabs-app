import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Linking, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';

const EmployerApplicantsScreen = ({ navigation }: any) => {
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchApplicants = async () => {
        try {
            const res = await marketplaceApi.getEmployerApplicants();
            setApplicants(res.data || []);
        } catch (error) {
            console.error('Fetch applicants error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            setApplicants((prev) =>
                prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
            );
            await marketplaceApi.updateApplicantStatus(id, newStatus);
        } catch (error) {
            fetchApplicants();
        }
    };

    const handleOpenLink = async (url: string) => {
        if (!url) return;
        let formatted = url.trim();
        if (!/^https?:\/\//i.test(formatted)) {
            formatted = 'https://' + formatted;
        }
        try {
            await Linking.openURL(formatted);
        } catch (e) {
            Alert.alert('Resume Link', formatted);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'shortlisted': return { bg: 'rgba(52, 211, 153, 0.15)', border: '#34d399', text: '#34d399' };
            case 'rejected': return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#ef4444' };
            case 'reviewed': return { bg: 'rgba(96, 165, 250, 0.15)', border: '#60a5fa', text: '#60a5fa' };
            default: return { bg: 'rgba(251, 191, 36, 0.15)', border: '#fbbf24', text: '#fbbf24' };
        }
    };

    const renderItem = ({ item }: any) => {
        const badge = getStatusStyle(item.status);
        const jobTitle = item.jobId?.title || 'Job Listing';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={styles.candidateName}>{item.name}</Text>
                            {item.isPremiumCandidate && (
                                <View style={styles.proCandidateBadge}>
                                    <Ionicons name="star" size={12} color="#FFD700" style={{ marginRight: 3 }} />
                                    <Text style={styles.proCandidateBadgeText}>VERIFIED PRO</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.appliedJobText}>Applied for: <Text style={styles.appliedJobTitle}>{jobTitle}</Text></Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                        <Text style={[styles.statusText, { color: badge.text }]}>{(item.status || 'pending').toUpperCase()}</Text>
                    </View>
                </View>

                {/* Candidate Contact Info */}
                <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={15} color="#94A3B8" />
                    <Text style={styles.infoText}>{item.email}</Text>
                </View>
                {item.phone ? (
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={15} color="#94A3B8" />
                        <Text style={styles.infoText}>{item.phone}</Text>
                    </View>
                ) : null}

                {/* Cover Note */}
                {item.coverNote ? (
                    <View style={styles.noteContainer}>
                        <Text style={styles.noteLabel}>Cover Note:</Text>
                        <Text style={styles.noteText}>{item.coverNote}</Text>
                    </View>
                ) : null}

                {/* Resume Link */}
                {item.resumeUrl ? (
                    <TouchableOpacity
                        style={styles.resumeBtn}
                        onPress={() => handleOpenLink(item.resumeUrl)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="document-attach-outline" size={16} color="#38bdf8" />
                        <Text style={styles.resumeBtnText}>View Resume / Portfolio</Text>
                        <Ionicons name="open-outline" size={14} color="#38bdf8" />
                    </TouchableOpacity>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionChip, { backgroundColor: 'rgba(52, 211, 153, 0.15)', borderColor: '#34d399' }]}
                        onPress={() => handleStatusUpdate(item._id, 'shortlisted')}
                    >
                        <Ionicons name="checkmark-circle-outline" size={14} color="#34d399" />
                        <Text style={[styles.actionChipText, { color: '#34d399' }]}>Shortlist</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionChip, { backgroundColor: 'rgba(96, 165, 250, 0.15)', borderColor: '#60a5fa' }]}
                        onPress={() => handleStatusUpdate(item._id, 'reviewed')}
                    >
                        <Ionicons name="eye-outline" size={14} color="#60a5fa" />
                        <Text style={[styles.actionChipText, { color: '#60a5fa' }]}>Reviewed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionChip, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' }]}
                        onPress={() => handleStatusUpdate(item._id, 'rejected')}
                    >
                        <Ionicons name="close-circle-outline" size={14} color="#ef4444" />
                        <Text style={[styles.actionChipText, { color: '#ef4444' }]}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.emailChip}
                        onPress={() => Linking.openURL(`mailto:${item.email}?subject=Application for ${jobTitle}`)}
                    >
                        <Ionicons name="mail-unread-outline" size={14} color="#FFFFFF" />
                        <Text style={styles.emailChipText}>Contact</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Received Applicants</Text>
                <View style={{ width: 32 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={applicants}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchApplicants} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="people-outline" size={60} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>No Applicants Yet</Text>
                            <Text style={styles.emptySub}>Applications for your posted jobs will appear here in real time.</Text>
                        </View>
                    }
                />
            )}
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 15,
    },
    backBtn: {
        padding: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    list: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    candidateName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    proCandidateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        borderColor: 'rgba(255, 215, 0, 0.4)',
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginBottom: 2,
    },
    proCandidateBadgeText: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    appliedJobText: {
        fontSize: 12,
        color: '#94A3B8',
    },
    appliedJobTitle: {
        color: '#a855f7',
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    infoText: {
        fontSize: 13,
        color: '#F1F5F9',
    },
    noteContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        padding: 10,
        borderRadius: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    noteLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#94A3B8',
        marginBottom: 2,
    },
    noteText: {
        fontSize: 13,
        color: '#F1F5F9',
        lineHeight: 18,
    },
    resumeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(56, 189, 248, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        padding: 10,
        borderRadius: 10,
        marginVertical: 10,
    },
    resumeBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#38bdf8',
        flex: 1,
        marginLeft: 8,
    },
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    actionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        gap: 4,
    },
    actionChipText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emailChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#a855f7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
        marginLeft: 'auto',
    },
    emailChipText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    empty: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 15,
    },
    emptySub: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 6,
    },
});

export default EmployerApplicantsScreen;
