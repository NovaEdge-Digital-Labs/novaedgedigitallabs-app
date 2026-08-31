import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Share, Platform, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { Text as UIText, Card, Badge, Button, EmptyState, SkeletonCard, TopBar } from '../components/ui';
import { SPACING, RADIUS, withAlpha } from '../constants/colors';
import { marketplaceApi } from '../api/marketplaceApi';
import PrimaryButton from '../components/PrimaryButton';
import { formatCurrency } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';

export const JobDetailScreen = ({ route, navigation }: any) => {
    const { jobId } = route.params;
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    // Edit Job Modal State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editJobType, setEditJobType] = useState('Full-time');
    const [editMinSalary, setEditMinSalary] = useState('');
    const [editMaxSalary, setEditMaxSalary] = useState('');
    const [editSkills, setEditSkills] = useState('');
    const [editExperience, setEditExperience] = useState('');
    const [editWebsiteUrl, setEditWebsiteUrl] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const user = useAuthStore((state) => state.user);
    const currentUserId = user?.id || (user as any)?._id;
    const postedById = typeof job?.postedBy === 'object' ? job?.postedBy?._id : job?.postedBy;
    const isOwner = Boolean(currentUserId && postedById && String(postedById) === String(currentUserId));

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

    useEffect(() => {
        const checkBookmark = async () => {
            try {
                const savedJobs = await AsyncStorage.getItem('SAVED_JOBS_LIST');
                if (savedJobs) {
                    const jobsArr = JSON.parse(savedJobs);
                    if (jobsArr.includes(jobId)) {
                        setIsSaved(true);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        checkBookmark();
    }, [jobId]);

    const showAlert = (alertTitle: string, message: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${alertTitle}\n\n${message}`);
        } else {
            Alert.alert(alertTitle, message);
        }
    };

    const handleShareJob = async () => {
        const shareTitle = job?.title || 'Job Opening';
        const shareText = `🔥 ${job?.title || 'Job Opening'} at ${job?.companyId?.name || 'NovaEdge'}\nLocation: ${job?.location || 'Remote'}\nCheck out and apply now on NovaEdge Digital Labs!`;
        const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://novaedgedigitallabs.tech';

        if (Platform.OS === 'web') {
            if (typeof navigator !== 'undefined' && (navigator as any).share) {
                try {
                    await (navigator as any).share({
                        title: shareTitle,
                        text: shareText,
                        url: shareUrl,
                    });
                } catch (err) {
                    console.log('Web share canceled');
                }
            } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                    showAlert('📋 Copied to Clipboard', 'Job details and link copied to clipboard!');
                } catch (err) {
                    showAlert('Job Details', shareText);
                }
            } else {
                showAlert('Job Details', shareText);
            }
            return;
        }

        try {
            await Share.share({
                title: shareTitle,
                message: shareText,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleToggleBookmark = async () => {
        const newSavedState = !isSaved;
        setIsSaved(newSavedState);
        try {
            const savedJobs = await AsyncStorage.getItem('SAVED_JOBS_LIST');
            let jobsArr = savedJobs ? JSON.parse(savedJobs) : [];
            if (newSavedState) {
                if (!jobsArr.includes(jobId)) jobsArr.push(jobId);
                showAlert('Bookmark Saved 📌', 'Job saved to your bookmarks!');
            } else {
                jobsArr = jobsArr.filter((id: string) => id !== jobId);
                showAlert('Bookmark Removed', 'Job removed from your bookmarks.');
            }
            await AsyncStorage.setItem('SAVED_JOBS_LIST', JSON.stringify(jobsArr));
        } catch (e) {
            console.error('Bookmark error:', e);
        }
    };

    const openEditModal = () => {
        if (!job) return;
        setEditTitle(job.title || '');
        setEditLocation(job.location || '');
        setEditJobType(job.jobType || 'Full-time');
        setEditMinSalary(String(job.salaryRange?.min || ''));
        setEditMaxSalary(String(job.salaryRange?.max || ''));
        setEditSkills(Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '');
        setEditExperience(job.experienceLevel || '');
        setEditWebsiteUrl(job.websiteUrl || '');
        setEditDescription(job.description || '');
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim() || !editLocation.trim() || !editDescription.trim()) {
            showAlert('Missing Required Fields', 'Please fill in Job Title, Location, and Description.');
            return;
        }

        setUpdating(true);
        try {
            const updatedData = {
                title: editTitle.trim(),
                location: editLocation.trim(),
                jobType: editJobType,
                salaryRange: { min: Number(editMinSalary) || 0, max: Number(editMaxSalary) || 0 },
                requiredSkills: editSkills ? editSkills.split(',').map((s) => s.trim()).filter(Boolean) : ['General'],
                experienceLevel: editExperience.trim() || '1-3 yrs',
                websiteUrl: editWebsiteUrl.trim() || 'https://novaedgedigitallabs.tech',
                description: editDescription.trim()
            };

            const res = await marketplaceApi.updateEmployerJob(jobId, updatedData);
            setJob(res.data);
            setEditModalVisible(false);
            showAlert('🎉 Job Updated Successfully!', 'Your job posting details have been updated.');
        } catch (error: any) {
            showAlert('Update Failed', error?.response?.data?.message || error?.message || 'Failed to update job posting.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteJob = async () => {
        const performDelete = async () => {
            try {
                await marketplaceApi.deleteEmployerJob(jobId);
                showAlert('Job Deleted 🗑️', 'Your job posting has been deleted successfully.');
                navigation.navigate('JobFeed');
            } catch (error: any) {
                showAlert('Delete Failed', error?.response?.data?.message || error?.message || 'Could not delete job.');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
                performDelete();
            }
        } else {
            Alert.alert(
                'Delete Job Listing',
                'Are you sure you want to delete this job posting? This action cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: performDelete }
                ]
            );
        }
    };

    if (loading) {
        return (
            <ThemeWrapper>
                <TopBar title="Job" showBack onBack={() => navigation.goBack()} />
                <View style={styles.scrollContent}>
                    <SkeletonCard lines={4} />
                    <SkeletonCard lines={3} />
                </View>
            </ThemeWrapper>
        );
    }

    if (!job) {
        return (
            <ThemeWrapper>
                <TopBar title="Job" showBack onBack={() => navigation.goBack()} />
                <EmptyState
                    icon="alert-circle-outline"
                    title="Job not found"
                    message="This listing may have been closed or removed."
                    actionLabel="Back to jobs"
                    onAction={() => navigation.goBack()}
                />
            </ThemeWrapper>
        );
    }

    return (
        <ThemeWrapper>
            <TopBar
                title={job.title}
                subtitle={job.companyId?.name || 'Company'}
                showBack
                onBack={() => navigation.goBack()}
                right={
                    <View style={styles.navActions}>
                        {isOwner && (
                            <>
                                <TouchableOpacity onPress={openEditModal} style={styles.navActionBtn}>
                                    <Ionicons name="create-outline" size={17} color={COLORS.accent} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleDeleteJob}
                                    style={[styles.navActionBtn, styles.navActionDanger]}
                                >
                                    <Ionicons name="trash-outline" size={17} color={COLORS.error} />
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity onPress={handleShareJob} style={styles.navActionBtn}>
                            <Ionicons name="share-outline" size={17} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.headerCard}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="business" size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.companyId?.name || 'Company'}</Text>

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
                        {formatCurrency(job.salaryRange?.min || 0)} - {formatCurrency(job.salaryRange?.max || 0)} / month
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{job.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Required Skills</Text>
                    <View style={styles.skillsRow}>
                        {(job.requiredSkills || []).map((skill: string, index: number) => (
                            <View key={index} style={styles.skillChip}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={[styles.section, styles.companySection]}>
                    <Text style={styles.sectionTitle}>About {job.companyId?.name || 'Company'}</Text>
                    <Text style={styles.companyDesc}>{job.companyId?.description || 'Leading tech innovator.'}</Text>
                    <TouchableOpacity 
                        onPress={async () => {
                            const rawUrl = job.websiteUrl || job.companyId?.website || 'https://novaedgedigitallabs.tech';
                            let formattedUrl = rawUrl.trim();
                            if (!/^https?:\/\//i.test(formattedUrl)) {
                                formattedUrl = 'https://' + formattedUrl;
                            }
                            try {
                                const canOpen = await Linking.canOpenURL(formattedUrl);
                                if (canOpen) {
                                    await Linking.openURL(formattedUrl);
                                } else {
                                    await Linking.openURL('https://novaedgedigitallabs.tech');
                                }
                            } catch (e) {
                                Linking.openURL('https://novaedgedigitallabs.tech');
                            }
                        }} 
                        style={styles.websiteLink}
                    >
                        <Text style={styles.websiteLinkText}>Visit Website</Text>
                        <Ionicons name="open-outline" size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Footer Actions */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, isSaved && styles.saveButtonActive]}
                    onPress={handleToggleBookmark}
                    activeOpacity={0.7}
                    accessibilityLabel={isSaved ? 'Remove bookmark' : 'Save job'}
                >
                    <Ionicons
                        name={isSaved ? 'bookmark' : 'bookmark-outline'}
                        size={20}
                        color={isSaved ? COLORS.accent : COLORS.primary}
                    />
                </TouchableOpacity>

                <View style={styles.footerCta}>
                    {isOwner ? (
                        <Button
                            title="Manage applicants"
                            icon={<Ionicons name="people-outline" size={17} color={COLORS.white} />}
                            onPress={() => navigation.navigate('EmployerApplicants')}
                        />
                    ) : (
                        <Button
                            title="Apply for this job"
                            size="lg"
                            onPress={() =>
                                navigation.navigate('JobApplication', { jobId: job._id, jobTitle: job.title })
                            }
                        />
                    )}
                </View>
            </View>

            {/* EDIT JOB MODAL */}
            <Modal visible={editModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>✏️ Edit Job Posting</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 450 }} showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>Job Title *</Text>
                            <TextInput style={styles.modalInput} value={editTitle} onChangeText={setEditTitle} placeholder="Job Title" placeholderTextColor={COLORS.textMuted} />

                            <Text style={styles.inputLabel}>Location *</Text>
                            <TextInput style={styles.modalInput} value={editLocation} onChangeText={setEditLocation} placeholder="Location (e.g. Remote, India)" placeholderTextColor={COLORS.textMuted} />

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Min Salary (₹)</Text>
                                    <TextInput style={styles.modalInput} value={editMinSalary} onChangeText={setEditMinSalary} keyboardType="numeric" placeholder="60000" placeholderTextColor={COLORS.textMuted} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Max Salary (₹)</Text>
                                    <TextInput style={styles.modalInput} value={editMaxSalary} onChangeText={setEditMaxSalary} keyboardType="numeric" placeholder="120000" placeholderTextColor={COLORS.textMuted} />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Required Skills (comma separated)</Text>
                            <TextInput style={styles.modalInput} value={editSkills} onChangeText={setEditSkills} placeholder="Node.js, React, MongoDB" placeholderTextColor={COLORS.textMuted} />

                            <Text style={styles.inputLabel}>Experience Level</Text>
                            <TextInput style={styles.modalInput} value={editExperience} onChangeText={setEditExperience} placeholder="3-5 yrs" placeholderTextColor={COLORS.textMuted} />

                            <Text style={styles.inputLabel}>Website / Apply URL</Text>
                            <TextInput style={styles.modalInput} value={editWebsiteUrl} onChangeText={setEditWebsiteUrl} placeholder="https://novaedgedigitallabs.tech" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" keyboardType="url" />

                            <Text style={styles.inputLabel}>Job Description *</Text>
                            <TextInput style={[styles.modalInput, styles.modalTextArea]} value={editDescription} onChangeText={setEditDescription} multiline numberOfLines={5} placeholder="Job requirements..." placeholderTextColor={COLORS.textMuted} />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setEditModalVisible(false)}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                            <PrimaryButton
                                title={updating ? 'Saving...' : 'Save Changes'}
                                onPress={handleSaveEdit}
                                loading={updating}
                                style={{ flex: 1, height: 46 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    navActionBtn: {
        width: 34,
        height: 34,
        borderRadius: RADIUS.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(COLORS.white, 0.06),
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
        marginLeft: 6,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    headerCard: {
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: 25,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(110, 68, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: 5,
    },
    companyName: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 15,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    infoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(110, 68, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    infoBadgeText: {
        color: COLORS.text,
        fontSize: 12,
        marginLeft: 6,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 10,
    },
    salaryText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#34d399',
    },
    descriptionText: {
        fontSize: 15,
        color: COLORS.textMuted,
        lineHeight: 24,
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 14,
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
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    companyDesc: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 15,
    },
    websiteLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    websiteLinkText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        marginRight: 5,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm + 2,
        paddingBottom: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
        backgroundColor: withAlpha(COLORS.background, 0.9),
    },
    saveButton: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: withAlpha(COLORS.primary, 0.08),
        marginRight: SPACING.sm + 2,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1E1B4B',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    inputLabel: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
        marginTop: 10,
    },
    modalInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        padding: 12,
        color: '#FFF',
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTextArea: {
        height: 90,
        textAlignVertical: 'top',
    },
    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 15,
    },
    cancelModalBtn: {
        paddingHorizontal: 20,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },

    navActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navActionDanger: {
        backgroundColor: withAlpha(COLORS.error, 0.14),
        borderColor: withAlpha(COLORS.error, 0.3),
    },
    saveButtonActive: {
        backgroundColor: withAlpha(COLORS.primary, 0.25),
        borderColor: COLORS.primary,
    },
    footerCta: {
        flex: 1,
    },
});

export default JobDetailScreen;
