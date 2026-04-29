import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import { formatCurrency } from '../utils/helpers';

const ProjectDetailsScreen = ({ route, navigation }: any) => {
    const { id } = route.params;
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            const allProjects = await marketplaceApi.getProjects();
            const foundProject = allProjects.data.find((p: any) => p._id === id);
            setProject(foundProject);
        } catch (error) {
            console.error('Fetch project details error:', error);
        } finally {
            setLoading(false);
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

                    <Text style={styles.postedAt}>Posted 2 hours ago</Text>

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
                            <Text style={styles.activityValue}>{project.totalProposals || 0}</Text>
                        </View>
                        <View style={styles.activityItem}>
                            <Text style={styles.activityLabel}>Last viewed:</Text>
                            <Text style={styles.activityValue}>10 minutes ago</Text>
                        </View>
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
});

export default ProjectDetailsScreen;
