import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Share, Platform, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { useAppConfigStore } from '../store/appConfigStore';
import { marketplaceApi } from '../api/marketplaceApi';
import PrimaryButton from '../components/PrimaryButton';
import { formatCurrency } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';

export const JobDetailScreen = ({ route, navigation }: any) => {
    const { config } = useAppConfigStore();
    const jobId = route.params?.id || route.params?.jobId;
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
    const [editCompanyName, setEditCompanyName] = useState('');
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
        const shareText = `🔥 ${job?.title || 'Job Opening'} at ${job?.companyId?.name || 'NovaEdge'}\nLocation: ${job?.location || 'Remote'}\nCheck out and apply now on NovaEdge Digital Labs!\n\nDownload the App: ${config?.appDownloadLink || 'https://play.google.com/store/apps/details?id=in.novaedgedigitallabs.tech'}`;
        const shareUrl = (typeof window !== 'undefined' && window.location) ? window.location.href : (config?.websiteUrl || 'https://novaedgedigitallabs.tech');

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
        setEditCompanyName(job.companyId?.name || '');
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
                companyName: editCompanyName.trim() || 'NovaEdge',
                experienceLevel: editExperience.trim() || '1-3 yrs',
                websiteUrl: editWebsiteUrl.trim() || config?.websiteUrl || 'https://novaedgedigitallabs.tech',
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {isOwner && (
                        <>
                            <TouchableOpacity onPress={openEditModal} activeOpacity={0.7} style={styles.navActionBtn}>
                                <Ionicons name="create-outline" size={18} color="#a855f7" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDeleteJob} activeOpacity={0.7} style={[styles.navActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
                                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity onPress={handleShareJob} activeOpacity={0.7} style={styles.navBtn}>
                        <Ionicons name="share-outline" size={22} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>

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
                            const rawUrl = job.websiteUrl || job.companyId?.website || config?.websiteUrl || 'https://novaedgedigitallabs.tech';
                            let formattedUrl = rawUrl.trim();
                            if (!/^https?:\/\//i.test(formattedUrl)) {
                                formattedUrl = 'https://' + formattedUrl;
                            }
                            try {
                                const supported = await Linking.canOpenURL(formattedUrl);
                                if (supported) {
                                    await Linking.openURL(formattedUrl);
                                } else {
                                    await Linking.openURL(config?.websiteUrl || 'https://novaedgedigitallabs.tech');
                                }
                            } catch (e) {
                                Linking.openURL(config?.websiteUrl || 'https://novaedgedigitallabs.tech');
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
                    style={[styles.saveButton, isSaved && { backgroundColor: 'rgba(168, 85, 247, 0.25)', borderColor: '#a855f7' }]}
                    onPress={handleToggleBookmark}
                    activeOpacity={0.7}
                >
                    <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color={isSaved ? "#c042ff" : COLORS.primary} />
                </TouchableOpacity>

                {isOwner ? (
                    <TouchableOpacity
                        style={styles.manageApplicantsBtn}
                        onPress={() => navigation.navigate('EmployerApplicants')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="people-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.manageApplicantsBtnText}>Manage Applicants</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.mainApplyBtn}
                        onPress={() => navigation.navigate('JobApplication', { jobId: job._id, jobTitle: job.title })}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.mainApplyBtnText}>Apply for this job</Text>
                    </TouchableOpacity>
                )}
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
                            <TextInput style={styles.modalInput} value={editWebsiteUrl} onChangeText={setEditWebsiteUrl} placeholder={config?.websiteUrl || "https://novaedgedigitallabs.tech"} placeholderTextColor={COLORS.textMuted} autoCapitalize="none" keyboardType="url" />

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
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 15,
    },
    navBtn: {
        padding: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    navActionBtn: {
        padding: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 25 : 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 10,
    },
    saveButton: {
        width: 52,
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    manageApplicantsBtn: {
        flex: 1,
        height: 52,
        backgroundColor: '#a855f7',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    manageApplicantsBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mainApplyBtn: {
        flex: 1,
        height: 52,
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    mainApplyBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
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
});

export default JobDetailScreen;
