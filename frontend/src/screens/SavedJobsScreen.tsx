import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import { formatCurrency } from '../utils/helpers';

const SavedJobsScreen = ({ navigation }: any) => {
    const [savedJobs, setSavedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSavedJobs = async () => {
        try {
            const stored = await AsyncStorage.getItem('SAVED_JOBS_LIST');
            const ids: string[] = stored ? JSON.parse(stored) : [];

            if (ids.length === 0) {
                setSavedJobs([]);
            } else {
                const res = await marketplaceApi.getJobsByIds(ids);
                setSavedJobs(res.data || []);
            }
        } catch (error) {
            console.error('Fetch saved jobs error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchSavedJobs();
        });
        fetchSavedJobs();
        return unsubscribe;
    }, [navigation]);

    const handleRemoveBookmark = async (jobId: string) => {
        try {
            setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
            const stored = await AsyncStorage.getItem('SAVED_JOBS_LIST');
            let ids: string[] = stored ? JSON.parse(stored) : [];
            ids = ids.filter((id) => id !== jobId);
            await AsyncStorage.setItem('SAVED_JOBS_LIST', JSON.stringify(ids));
        } catch (e) {
            console.error('Remove bookmark error:', e);
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={styles.companyInfo}>
                    <View style={styles.logoPlaceholder}>
                        <Ionicons name="business" size={24} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle}>{item.title}</Text>
                        <Text style={styles.companyName}>{item.companyId?.name || 'Company'}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveBookmark(item._id)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="bookmark" size={20} color="#c042ff" />
                </TouchableOpacity>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={15} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{item.location}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={15} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{item.jobType}</Text>
                </View>
                {item.salaryRange ? (
                    <View style={styles.detailItem}>
                        <Ionicons name="cash-outline" size={15} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{formatCurrency(item.salaryRange.min)} - {formatCurrency(item.salaryRange.max)}</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.savedBadgeText}>📌 Bookmarked</Text>
                <View style={styles.viewJobBtn}>
                    <Text style={styles.viewJobText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved Jobs</Text>
                <View style={{ width: 32 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={savedJobs}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchSavedJobs} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="bookmark-outline" size={60} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>No Saved Jobs Yet</Text>
                            <Text style={styles.emptySub}>Tap the bookmark icon 🔖 on any job to save it here for quick access later.</Text>
                            <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('JobFeed')}>
                                <Text style={styles.browseText}>Explore Jobs</Text>
                            </TouchableOpacity>
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
    companyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logoPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(110, 68, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 2,
    },
    companyName: {
        fontSize: 13,
        color: COLORS.textMuted,
    },
    removeBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(168, 85, 247, 0.12)',
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        marginBottom: 4,
    },
    detailText: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginLeft: 5,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        paddingTop: 10,
    },
    savedBadgeText: {
        fontSize: 12,
        color: '#c042ff',
        fontWeight: '600',
    },
    viewJobBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewJobText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginRight: 2,
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
        marginTop: 8,
        lineHeight: 18,
    },
    browseButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
    },
    browseText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default SavedJobsScreen;
