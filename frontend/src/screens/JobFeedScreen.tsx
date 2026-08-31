import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TextInput,
    Pressable,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, withAlpha } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import ThemeWrapper from '../components/ThemeWrapper';
import { Text, Card, Badge, Button, EmptyState, SkeletonCard, TopBar } from '../components/ui';
import { marketplaceApi } from '../api/marketplaceApi';
import { formatCurrency } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';

const FILTERS = ['All', 'Full-time', 'Remote', 'Internship', 'Part-time'];

const QUICK_LINKS: Array<{
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    tint: string;
    route: string;
}> = [
    { label: 'Applications', icon: 'document-text-outline', tint: '#5B7CFA', route: 'MyApplications' },
    { label: 'Saved', icon: 'bookmark-outline', tint: '#F1A10D', route: 'SavedJobs' },
    { label: 'Applicants', icon: 'people-outline', tint: '#9E8CFC', route: 'EmployerApplicants' },
    { label: 'Pro Pass', icon: 'star-outline', tint: '#F1A10D', route: 'PremiumUpgrade' },
];

const relativeTime = (iso?: string) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    if (Number.isNaN(diff) || diff < 0) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days < 30 ? `${days}d ago` : `${Math.floor(days / 30)}mo ago`;
};

const salaryLabel = (range?: { min?: number; max?: number }) => {
    if (!range || (range.min == null && range.max == null)) return 'Not disclosed';
    if (range.min != null && range.max != null) {
        return `${formatCurrency(range.min)} – ${formatCurrency(range.max)}`;
    }
    return formatCurrency((range.min ?? range.max) as number);
};

export const JobFeedScreen = ({ navigation }: any) => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const user = useAuthStore((state) => state.user);
    const currentUserId = user?.id || (user as any)?._id;

    const fetchJobs = useCallback(async (term: string, filter: string) => {
        try {
            const res = await marketplaceApi.getAllJobs({
                search: term,
                jobType: filter !== 'All' ? filter : undefined,
            });
            setJobs(Array.isArray(res) ? res : res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // `search` was previously absent from the dependency list, so typing a
    // query never triggered a refetch. Debounced so each keystroke isn't a call.
    useEffect(() => {
        const id = setTimeout(() => {
            setLoading(true);
            fetchJobs(search, activeFilter);
        }, search ? 350 : 0);
        return () => clearTimeout(id);
    }, [search, activeFilter, fetchJobs]);

    const renderJobItem = ({ item }: any) => {
        const postedById = typeof item.postedBy === 'object' ? item.postedBy?._id : item.postedBy;
        const isOwner = Boolean(currentUserId && postedById && String(postedById) === String(currentUserId));
        const highlighted = item.listingType === 'Premium' || item.listingType === 'Featured';

        return (
            <Card
                onPress={() => navigation.navigate('JobDetail', { jobId: item._id })}
                style={[styles.jobCard, highlighted && styles.highlightedCard]}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.logoBox}>
                        <Ionicons name="business-outline" size={20} color={COLORS.accent} />
                    </View>
                    <View style={styles.headerText}>
                        <Text variant="bodyStrong" numberOfLines={2}>{item.title}</Text>
                        <Text variant="caption" tone="muted" numberOfLines={1}>
                            {item.companyId?.name || 'Company'}
                        </Text>
                    </View>
                    {item.listingType && item.listingType !== 'Basic' ? (
                        <Badge
                            label={item.listingType}
                            tone={item.listingType === 'Premium' ? 'warning' : 'info'}
                        />
                    ) : null}
                </View>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
                        <Text variant="caption" tone="muted" style={styles.metaText} numberOfLines={1}>
                            {item.location || 'Anywhere'}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                        <Text variant="caption" tone="muted" style={styles.metaText} numberOfLines={1}>
                            {item.jobType || 'Full-time'}
                        </Text>
                    </View>
                </View>

                <View style={styles.salaryRow}>
                    <Ionicons name="cash-outline" size={14} color={COLORS.success} />
                    <Text variant="bodyStrong" tone="success" style={styles.metaText}>
                        {salaryLabel(item.salaryRange)}
                    </Text>
                </View>

                <View style={styles.cardFooter}>
                    <Text variant="caption" tone="faint">{relativeTime(item.createdAt)}</Text>
                    {isOwner ? (
                        <Badge label="Your listing" tone="primary" icon={<Ionicons name="sparkles-outline" size={11} color={COLORS.primary} />} />
                    ) : (
                        <Button
                            title="Apply"
                            size="sm"
                            fullWidth={false}
                            onPress={() =>
                                navigation.navigate('JobApplication', { jobId: item._id, jobTitle: item.title })
                            }
                        />
                    )}
                </View>
            </Card>
        );
    };

    return (
        <ThemeWrapper>
            <TopBar
                large
                title="Jobs"
                subtitle="Roles from the NovaEdge network"
                showBack={false}
                right={
                    <Button
                        title="Post"
                        size="sm"
                        fullWidth={false}
                        icon={<Ionicons name="add" size={16} color={COLORS.white} />}
                        onPress={() => navigation.navigate('PostJob')}
                    />
                }
            />

            <FlatList
                data={loading ? [] : jobs}
                keyExtractor={(item) => item._id}
                renderItem={renderJobItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchJobs(search, activeFilter);
                        }}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
                ListHeaderComponent={
                    <View>
                        {/* Shortcuts scroll horizontally rather than stacking three
                            full-width rows above the first result. */}
                        <FlatList
                            horizontal
                            data={QUICK_LINKS}
                            keyExtractor={(q) => q.route}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.quickRow}
                            renderItem={({ item: q }) => (
                                <Pressable
                                    onPress={() => navigation.navigate(q.route)}
                                    style={({ pressed }) => [
                                        styles.quickChip,
                                        {
                                            backgroundColor: withAlpha(q.tint, pressed ? 0.24 : 0.12),
                                            borderColor: withAlpha(q.tint, 0.28),
                                        },
                                    ]}
                                >
                                    <Ionicons name={q.icon} size={13} color={q.tint} />
                                    <Text variant="caption" color={q.tint} style={styles.quickLabel}>
                                        {q.label}
                                    </Text>
                                </Pressable>
                            )}
                        />

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={17} color={COLORS.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search roles, skills, companies"
                                placeholderTextColor={COLORS.textFaint}
                                value={search}
                                onChangeText={setSearch}
                                returnKeyType="search"
                                autoCapitalize="none"
                            />
                            {search ? (
                                <Pressable onPress={() => setSearch('')} hitSlop={10}>
                                    <Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
                                </Pressable>
                            ) : null}
                        </View>

                        <FlatList
                            horizontal
                            data={FILTERS}
                            keyExtractor={(f) => f}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterList}
                            renderItem={({ item: f }) => {
                                const active = activeFilter === f;
                                return (
                                    <Pressable
                                        onPress={() => setActiveFilter(f)}
                                        style={[styles.filterChip, active && styles.filterChipActive]}
                                    >
                                        <Text
                                            variant="label"
                                            color={active ? COLORS.white : COLORS.textMuted}
                                        >
                                            {f}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                        />

                        {loading ? (
                            <View style={styles.skeletons}>
                                <SkeletonCard lines={3} />
                                <SkeletonCard lines={3} />
                                <SkeletonCard lines={3} />
                            </View>
                        ) : null}
                    </View>
                }
                ListEmptyComponent={
                    loading ? null : (
                        <EmptyState
                            icon="search-outline"
                            title="No jobs match that"
                            message={
                                search || activeFilter !== 'All'
                                    ? 'Try a different keyword or clear the filter.'
                                    : 'Nothing posted yet — be the first to list a role.'
                            }
                            actionLabel={search || activeFilter !== 'All' ? 'Clear filters' : 'Post a job'}
                            onAction={() => {
                                if (search || activeFilter !== 'All') {
                                    setSearch('');
                                    setActiveFilter('All');
                                } else {
                                    navigation.navigate('PostJob');
                                }
                            }}
                        />
                    )
                }
            />
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.lg,
    },
    quickRow: {
        paddingBottom: SPACING.md,
    },
    quickChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: RADIUS.pill,
        borderWidth: 1,
        marginRight: SPACING.sm,
    },
    quickLabel: {
        marginLeft: 5,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: withAlpha(COLORS.white, 0.05),
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md - 2,
        height: 46,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        marginLeft: SPACING.sm,
        ...TYPOGRAPHY.body,
    },
    filterList: {
        paddingVertical: SPACING.md,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: RADIUS.pill,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
        backgroundColor: withAlpha(COLORS.white, 0.04),
        marginRight: SPACING.sm,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    skeletons: {
        marginTop: SPACING.xs,
    },
    jobCard: {
        marginBottom: SPACING.sm + 4,
    },
    highlightedCard: {
        borderColor: withAlpha(COLORS.primary, 0.45),
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    logoBox: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(COLORS.primary, 0.12),
        borderWidth: 1,
        borderColor: withAlpha(COLORS.primary, 0.25),
        marginRight: SPACING.sm + 2,
    },
    headerText: {
        flex: 1,
        paddingRight: SPACING.sm,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: SPACING.md - 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.md,
        marginTop: 4,
    },
    metaText: {
        marginLeft: 5,
    },
    salaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
        paddingTop: SPACING.sm + 2,
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
    },
});

export default JobFeedScreen;
