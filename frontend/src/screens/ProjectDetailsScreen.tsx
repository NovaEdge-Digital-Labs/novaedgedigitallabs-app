import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import { formatCurrency } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';

const ProjectDetailsScreen = ({ route, navigation }: any) => {
    const { id } = route.params;
    const { user } = useAuthStore();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [proposals, setProposals] = useState<any[]>([]);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            const allProjects = await marketplaceApi.getProjects();
            const foundProject = allProjects.data?.find((p: any) => p._id === id);
            setProject(foundProject);

            try {
                const proposalRes = await marketplaceApi.getProposals(id);
                if (proposalRes?.data) {
                    setProposals(proposalRes.data);
                }
            } catch (pErr) {
                console.log('Proposals fetch error:', pErr);
            }
        } catch (error) {
            console.error('Fetch project details error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        setStatusUpdating(true);
        try {
            const res = await marketplaceApi.updateProjectStatus(id, newStatus);
            if (res?.success) {
                setProject((prev: any) => ({ ...prev, status: newStatus }));
                const msg = `Project status updated to ${newStatus.toUpperCase()}`;
                if (Platform.OS === 'web') {
                    window.alert(msg);
                } else {
                    Alert.alert('Status Updated', msg);
                }
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to update status';
            if (Platform.OS === 'web') {
                window.alert(errorMsg);
            } else {
                Alert.alert('Error', errorMsg);
            }
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleContactFreelancer = (freelancer: any) => {
        const email = freelancer?.email || 'support@novaedgedigitallabs.in';
        const name = freelancer?.name || 'Freelancer';
        const subject = encodeURIComponent(`Inquiry for Project: ${project?.title}`);
        const body = encodeURIComponent(`Hi ${name},\n\nI reviewed your proposal on NovaEdge Digital Labs for "${project?.title}". Let's discuss further.`);
        
        Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`).catch(() => {
            Alert.alert('Contact Info', `Freelancer Email: ${email}`);
        });
    };

    const handleHireFreelancer = async (proposalId: string, freelancerName: string) => {
        try {
            const res = await marketplaceApi.hireFreelancer(proposalId);
            if (res?.success) {
                const msg = `Congratulations! Proposal from ${freelancerName} accepted!`;
                if (Platform.OS === 'web') {
                    window.alert(msg);
                } else {
                    Alert.alert('Hired!', msg);
                }
                fetchProjectDetails();
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Hiring process failed';
            if (Platform.OS === 'web') {
                window.alert(errorMsg);
            } else {
                Alert.alert('Error', errorMsg);
            }
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!project) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>Project not found</Text>
            </View>
        );
    }

    const userId = user?.id || (user as any)?._id;
    const isOwner = user && (project.clientId?._id === userId || project.clientId === userId);

    return (
        <ThemeWrapper>
            <View style={styles.topContainer}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Project Details</Text>
                    <View style={{ width: 28 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>{project.title}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{project.status}</Text>
                        </View>
                    </View>

                    {/* Owner Status Management Bar */}
                    {isOwner && (
                        <View style={styles.ownerControlBox}>
                            <Text style={styles.ownerControlTitle}>Project Owner Controls:</Text>
                            <View style={styles.statusButtonGroup}>
                                {['open', 'in-progress', 'completed', 'cancelled'].map((st) => (
                                    <TouchableOpacity
                                        key={st}
                                        style={[
                                            styles.statusBtn,
                                            project.status === st && styles.statusBtnActive
                                        ]}
                                        onPress={() => handleUpdateStatus(st)}
                                        disabled={statusUpdating}
                                    >
                                        <Text style={[
                                            styles.statusBtnText,
                                            project.status === st && styles.statusBtnTextActive
                                        ]}>
                                            {st.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <Text style={styles.postedAt}>Posted recently</Text>

                    <View style={styles.budgetContainer}>
                        <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
                        <View style={styles.budgetInfo}>
                            <Text style={styles.budgetLabel}>Budget Range</Text>
                            <Text style={styles.budgetValue}>{formatCurrency(project.budgetRange?.min)} - {formatCurrency(project.budgetRange?.max)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Project Description</Text>
                        <Text style={styles.description}>{project.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills Required</Text>
                        <View style={styles.skillsContainer}>
                            {project.skillsRequired?.map((skill: string) => (
                                <View key={skill} style={styles.skillBadge}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Activity on this job</Text>
                        <View style={styles.activityItem}>
                            <Text style={styles.activityLabel}>Proposals:</Text>
                            <Text style={styles.activityValue}>{proposals.length || project.totalProposals || 0}</Text>
                        </View>
                    </View>

                    {/* Proposals List Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Submitted Proposals ({proposals.length})</Text>
                        {proposals.length === 0 ? (
                            <View style={styles.emptyProposalCard}>
                                <Ionicons name="document-text-outline" size={32} color={COLORS.textMuted} />
                                <Text style={styles.emptyProposalText}>No proposals submitted yet.</Text>
                            </View>
                        ) : (
                            proposals.map((item: any) => (
                                <View key={item._id} style={styles.proposalCard}>
                                    <View style={styles.proposalHeader}>
                                        <View style={styles.proposerInfo}>
                                            <View style={styles.avatar}>
                                                <Text style={styles.avatarText}>
                                                    {(item.freelancerId?.name || 'F')[0].toUpperCase()}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={styles.proposerName}>{item.freelancerId?.name || 'Freelancer'}</Text>
                                                <Text style={styles.proposalDays}>{item.deliveryDays} Days Delivery</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.proposalBid}>{formatCurrency(item.bidAmount)}</Text>
                                    </View>

                                    <Text style={styles.proposalCover}>{item.coverLetter}</Text>

                                    {/* Action Buttons for Freelancer Contact & Hire */}
                                    <View style={styles.proposalActions}>
                                        <TouchableOpacity
                                            style={styles.contactBtn}
                                            onPress={() => handleContactFreelancer(item.freelancerId)}
                                        >
                                            <Ionicons name="mail-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                                            <Text style={styles.contactBtnText}>Contact</Text>
                                        </TouchableOpacity>

                                        {isOwner && (
                                            <TouchableOpacity
                                                style={styles.hireBtn}
                                                onPress={() => handleHireFreelancer(item._id, item.freelancerId?.name || 'Freelancer')}
                                            >
                                                <Text style={styles.hireBtnText}>Hire Freelancer</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.proposalButton}
                    onPress={() => navigation.navigate('SubmitProposal', { projectId: project._id })}
                >
                    <Text style={styles.proposalButtonText}>Submit a Proposal</Text>
                </TouchableOpacity>
            </View>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    topContainer: {
        paddingTop: 50,
        paddingBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    container: {
        paddingBottom: 120,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    emptyText: {
        color: COLORS.textMuted,
    },
    content: {
        padding: 20,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    postedAt: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 20,
    },
    budgetContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    budgetInfo: {
        marginLeft: 16,
    },
    budgetLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 2,
    },
    budgetValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: COLORS.textMuted,
        lineHeight: 24,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillBadge: {
        backgroundColor: COLORS.backgroundSoft,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    skillText: {
        color: COLORS.text,
        fontSize: 14,
    },
    activityItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    activityLabel: {
        fontSize: 15,
        color: COLORS.textMuted,
        width: 100,
    },
    activityValue: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.overlay,
        padding: 20,
        paddingBottom: 35,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    proposalButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: COLORS.geometry.radiusMedium,
        alignItems: 'center',
        ...COLORS.getGlow(COLORS.primary),
    },
    proposalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyProposalCard: {
        backgroundColor: COLORS.card,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyProposalText: {
        color: COLORS.textMuted,
        marginTop: 10,
        fontSize: 14,
        textAlign: 'center',
    },
    proposalCard: {
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    proposalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    proposerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.primary + '30',
        borderWidth: 1,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    proposerName: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 15,
    },
    proposalDays: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    proposalBid: {
        color: COLORS.success,
        fontWeight: 'bold',
        fontSize: 16,
    },
    proposalCover: {
        color: COLORS.textLight,
        fontSize: 14,
        lineHeight: 20,
    },
    ownerControlBox: {
        backgroundColor: COLORS.card,
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
    },
    ownerControlTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    statusButtonGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    statusBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusBtnActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    statusBtnText: {
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: 'bold',
    },
    statusBtnTextActive: {
        color: '#FFFFFF',
    },
    proposalActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 10,
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '15',
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    contactBtnText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: 'bold',
    },
    hireBtn: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    hireBtnText: {
        color: '#000000',
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default ProjectDetailsScreen;
