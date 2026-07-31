import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Platform, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import PrimaryButton from '../components/PrimaryButton';
import { formatCurrency } from '../utils/helpers';

const MyPostedJobsScreen = ({ navigation }: any) => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Edit Modal State
    const [selectedJobId, setSelectedJobId] = useState('');
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

    const fetchMyJobs = async () => {
        try {
            const res = await marketplaceApi.getMyPostedJobs();
            setJobs(res.data || []);
        } catch (error) {
            console.error('Fetch my posted jobs error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchMyJobs();
        });
        fetchMyJobs();
        return unsubscribe;
    }, [navigation]);

    const showAlert = (alertTitle: string, message: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${alertTitle}\n\n${message}`);
        } else {
            Alert.alert(alertTitle, message);
        }
    };

    const openEditModal = (item: any) => {
        setSelectedJobId(item._id);
        setEditTitle(item.title || '');
        setEditLocation(item.location || '');
        setEditJobType(item.jobType || 'Full-time');
        setEditMinSalary(String(item.salaryRange?.min || ''));
        setEditMaxSalary(String(item.salaryRange?.max || ''));
        setEditSkills(Array.isArray(item.requiredSkills) ? item.requiredSkills.join(', ') : '');
        setEditExperience(item.experienceLevel || '');
        setEditWebsiteUrl(item.websiteUrl || '');
        setEditDescription(item.description || '');
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim() || !editLocation.trim() || !editDescription.trim()) {
            showAlert('Missing Information', 'Please fill in Job Title, Location, and Description.');
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

            await marketplaceApi.updateEmployerJob(selectedJobId, updatedData);
            setEditModalVisible(false);
            fetchMyJobs();
            showAlert('Job Updated 🎉', 'Your job posting has been updated successfully!');
        } catch (error: any) {
            showAlert('Update Failed', error?.response?.data?.message || error?.message || 'Could not update job.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteJob = async (jobId: string, title: string) => {
        const performDelete = async () => {
            try {
                await marketplaceApi.deleteEmployerJob(jobId);
                setJobs((prev) => prev.filter((j) => j._id !== jobId));
                showAlert('Job Deleted 🗑️', `Job posting "${title}" deleted successfully.`);
            } catch (error: any) {
                showAlert('Delete Failed', error?.response?.data?.message || error?.message || 'Could not delete job.');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
                performDelete();
            }
        } else {
            Alert.alert(
                'Delete Job Posting',
                `Are you sure you want to delete "${title}"? This action cannot be undone.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: performDelete }
                ]
            );
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <Text style={styles.companyName}>{item.companyId?.name || 'Your Company'}</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.listingType || 'Premium'}</Text>
                </View>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{item.location}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{item.jobType}</Text>
                </View>
                {item.salaryRange ? (
                    <View style={styles.detailItem}>
                        <Ionicons name="cash-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{formatCurrency(item.salaryRange.min)} - {formatCurrency(item.salaryRange.max)}</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                    <Ionicons name="create-outline" size={15} color="#a855f7" />
                    <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteJob(item._id, item.title)}>
                    <Ionicons name="trash-outline" size={15} color="#ef4444" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.applicantsBtn} onPress={() => navigation.navigate('EmployerApplicants')}>
                    <Ionicons name="people-outline" size={15} color="#FFF" />
                    <Text style={styles.applicantsBtnText}>Applicants</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Posted Jobs</Text>
                <TouchableOpacity onPress={() => navigation.navigate('PostJob')} style={styles.addBtn}>
                    <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchMyJobs} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="briefcase-outline" size={60} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>No Jobs Posted Yet</Text>
                            <Text style={styles.emptySub}>Post a job opening to reach top talent on NovaEdge Digital Labs.</Text>
                            <TouchableOpacity style={styles.postNowBtn} onPress={() => navigation.navigate('PostJob')}>
                                <Text style={styles.postNowText}>+ Post a Job</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

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
    addBtn: {
        padding: 6,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
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
        marginBottom: 10,
    },
    jobTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 2,
    },
    companyName: {
        fontSize: 13,
        color: COLORS.textMuted,
    },
    badge: {
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#c042ff',
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 14,
        marginBottom: 4,
    },
    detailText: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginLeft: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        paddingTop: 12,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    editBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#a855f7',
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
    },
    deleteBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    applicantsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
        marginLeft: 'auto',
    },
    applicantsBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFF',
    },
    empty: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 15,
    },
    emptySub: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 6,
    },
    postNowBtn: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
    },
    postNowText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
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

export default MyPostedJobsScreen;
