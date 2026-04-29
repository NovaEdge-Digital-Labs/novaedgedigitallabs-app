import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '../components/PrimaryButton';
import { formatCurrency } from '../utils/helpers';

export const JobDetailScreen = ({ route, navigation }: any) => {
    const { jobId } = route.params;
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchJobDetails = async () => {
        try {
            const res = await marketplaceApi.getJobById(jobId);
            setJob(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    if (loading) {
        return (
            <ThemeWrapper>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 100 }} />
            </ThemeWrapper>
        );
    }

    if (!job) {
        return (
            <ThemeWrapper>
                <Text style={{ color: COLORS.text, textAlign: 'center', marginTop: 50 }}>Job not found</Text>
            </ThemeWrapper>
        );
    }

    return (
        <ThemeWrapper>
            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="share-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.headerCard}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="business" size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.companyId.name}</Text>

                    <View style={styles.badgesRow}>
                        <View style={styles.infoBadge}>
                            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.infoBadgeText}>{job.jobType}</Text>
                        </View>
                        <View style={styles.infoBadge}>
                            <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.infoBadgeText}>{job.location}</Text>
                        </View>
                        <View style={styles.infoBadge}>
                            <Ionicons name="flash-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.infoBadgeText}>{job.experienceLevel}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Salary Range</Text>
                    <Text style={styles.salaryText}>
                        {formatCurrency(job.salaryRange.min)} - {formatCurrency(job.salaryRange.max)} / month
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{job.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Required Skills</Text>
                    <View style={styles.skillsRow}>
                        {job.requiredSkills.map((skill: string, index: number) => (
                            <View key={index} style={styles.skillChip}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={[styles.section, styles.companySection]}>
                    <Text style={styles.sectionTitle}>About {job.companyId.name}</Text>
                    <Text style={styles.companyDesc}>{job.companyId.description}</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(job.companyId.website)} style={styles.websiteLink}>
                        <Text style={styles.websiteLinkText}>Visit Website</Text>
                        <Ionicons name="open-outline" size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton}>
                    <Ionicons name="bookmark-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <PrimaryButton
                    title="Apply for this job"
                    onPress={() => navigation.navigate('JobApplication', { jobId: job._id, jobTitle: job.title })}
                    style={styles.applyButton}
                    textStyle={styles.applyText}
                />
            </View>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
    },
    scrollContent: {
        padding: 20,
    },
    headerCard: {
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: 8,
    },
    companyName: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 16,
    },
    badgesRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    infoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(110, 68, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    infoBadgeText: {
        color: COLORS.text,
        fontSize: 12,
        marginLeft: 5,
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 12,
    },
    salaryText: {
        fontSize: 20,
        color: '#4ADE80', // Beautiful Green
        fontWeight: 'bold',
    },
    descriptionText: {
        fontSize: 15,
        color: COLORS.textMuted,
        lineHeight: 24,
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillChip: {
        backgroundColor: COLORS.card,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    skillText: {
        color: COLORS.text,
        fontSize: 14,
    },
    companySection: {
        backgroundColor: COLORS.card,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    companyDesc: {
        fontSize: 14,
        color: COLORS.textMuted,
        lineHeight: 22,
        marginBottom: 12,
    },
    websiteLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    websiteLinkText: {
        color: COLORS.primary,
        fontWeight: '600',
        marginRight: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        paddingHorizontal: 20,
        paddingVertical: 20,
        flexDirection: 'row',
        gap: 15,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    saveButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    applyGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default JobDetailScreen;
