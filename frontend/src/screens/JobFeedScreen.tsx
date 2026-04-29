import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '../components/PrimaryButton';
import { formatCurrency } from '../utils/helpers';

export const JobFeedScreen = ({ navigation }: any) => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Full-time', 'Remote', 'Internship', 'Part-time'];

    const fetchJobs = async () => {
        try {
            const res = await marketplaceApi.getAllJobs({
                search,
                jobType: activeFilter !== 'All' ? activeFilter : undefined
            });
            // Ensure we handle both {data: []} and [] response formats
            setJobs(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [activeFilter]);

    const renderJobItem = ({ item }: any) => (
        <TouchableOpacity
            style={[
                styles.jobCard,
                item.listingType === 'Premium' && styles.premiumCard,
                item.listingType === 'Featured' && styles.featuredCard
            ]}
            onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.companyInfo}>
                    <View style={styles.logoPlaceholder}>
                        <Ionicons name="business" size={24} color={COLORS.primary} />
                    </View>
                    <View>
                        <Text style={styles.jobTitle}>{item.title}</Text>
                        <Text style={styles.companyName}>{item.companyId.name}</Text>
                    </View>
                </View>
                {item.listingType !== 'Basic' && (
                    <View style={[
                        styles.badge,
                        item.listingType === 'Premium' ? styles.premiumBadge : styles.featuredBadge
                    ]}>
                        <Text style={styles.badgeText}>{item.listingType}</Text>
                    </View>
                )}
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{item.location}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{item.jobType}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.detailText}>{formatCurrency(item.salaryRange.min)} - {formatCurrency(item.salaryRange.max)}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.timeAgo}>1 day ago</Text>
                <TouchableOpacity style={styles.applySmallButton}>
                    <Text style={styles.applySmallText}>Apply Now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Jobs</Text>
                <PrimaryButton
                    title="Post Job"
                    onPress={() => navigation.navigate('PostJob')}
                    style={styles.postButton}
                    textStyle={styles.postButtonText}
                    icon={<Ionicons name="add" size={20} color="#FFF" />}
                />
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search roles, skills..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={{ height: 50, marginBottom: 10 }}>
                <FlatList
                    horizontal
                    data={filters}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.filterChip, activeFilter === item && styles.activeChip]}
                            onPress={() => setActiveFilter(item)}
                        >
                            <Text style={[styles.filterText, activeFilter === item && styles.activeFilterText]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item._id}
                    renderItem={renderJobItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchJobs()} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={60} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No jobs found matching your criteria</Text>
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
        paddingTop: 50,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    postButton: {
        height: 40,
        borderRadius: 12,
        paddingHorizontal: 15,
    },
    postButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        borderRadius: 12,
        height: 50,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
    },
    filterList: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    filterChip: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        marginRight: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activeChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.text,
        fontWeight: '600',
    },
    activeFilterText: {
        color: '#FFF',
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
    },
    jobCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    premiumCard: {
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
    },
    featuredCard: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(110, 68, 255, 0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    companyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logoPlaceholder: {
        width: 45,
        height: 45,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    companyName: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    premiumBadge: {
        backgroundColor: '#FFD700',
    },
    featuredBadge: {
        backgroundColor: COLORS.primary,
    },
    badgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        marginBottom: 5,
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
        borderTopColor: COLORS.border,
        paddingTop: 12,
    },
    timeAgo: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    applySmallButton: {
        backgroundColor: 'rgba(110, 68, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    applySmallText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: COLORS.textMuted,
        marginTop: 10,
        fontSize: 16,
    }
});

export default JobFeedScreen;
