import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Pressable, FlatList, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, withAlpha } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import ThemeWrapper from '../components/ThemeWrapper';
import { Text, Card, Badge, Button, EmptyState, SkeletonCard, TopBar } from '../components/ui';
import { marketplaceApi } from '../api/marketplaceApi';
import { formatCurrency } from '../utils/helpers';

import { useAuthStore } from '../store/authStore';
import { Alert, Platform } from 'react-native';

const MarketplaceScreen = ({ navigation }: any) => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'gigs' | 'projects'>('gigs');
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Debounced so each keystroke doesn't fire its own request.
    useEffect(() => {
        const id = setTimeout(fetchData, searchQuery ? 350 : 0);
        return () => clearTimeout(id);
    }, [activeTab, searchQuery]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'gigs') {
                const response = await marketplaceApi.getGigs({ search: searchQuery });
                setData(response.data || []);
            } else {
                const response = await marketplaceApi.getProjects({ search: searchQuery });
                setData(response.data || []);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGig = async (gigId: string, gigTitle: string) => {
        const doDelete = async () => {
            try {
                const res = await marketplaceApi.deleteGig(gigId);
                if (res?.success) {
                    setData((prev) => prev.filter((g) => g._id !== gigId));
                    if (Platform.OS === 'web') {
                        window.alert('🗑️ Gig deleted successfully!');
                    }
                }
            } catch (err: any) {
                const msg = err.response?.data?.message || 'Failed to delete gig';
                if (Platform.OS === 'web') {
                    window.alert(msg);
                } else {
                    Alert.alert('Error', msg);
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to delete "${gigTitle}"?`)) {
                doDelete();
            }
        } else {
            Alert.alert('Delete Gig', `Are you sure you want to delete "${gigTitle}"?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: doDelete }
            ]);
        }
    };

    const renderGigItem = ({ item }: any) => {
        const currentUserId = user?.id || (user as any)?._id;
        const isOwner = user && (item.freelancerId?._id === currentUserId || item.freelancerId === currentUserId || (user as any).role === 'admin');
        const hasCoverImage = item.images && item.images.length > 0 && item.images[0];

        return (
            <Card
                padded={false}
                onPress={() => navigation.navigate('GigDetails', { id: item._id })}
                style={styles.card}
            >
                {hasCoverImage ? (
                    <Image source={{ uri: item.images[0] }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={30} color={COLORS.textMuted} />
                    </View>
                )}

                <View style={styles.cardContent}>
                    <View style={styles.cardTitleRow}>
                        <Text variant="bodyStrong" numberOfLines={2} style={styles.cardTitleText}>
                            {item.title}
                        </Text>
                        {isOwner && (
                            <TouchableOpacity
                                style={styles.deleteCardBtn}
                                onPress={() => handleDeleteGig(item._id, item.title)}
                                hitSlop={8}
                            >
                                <Ionicons name="trash-outline" size={17} color={COLORS.error} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text variant="caption" tone="muted" numberOfLines={1}>
                        By {item.freelancerId?.name || 'Freelancer'}
                    </Text>

                    <View style={styles.cardFooter}>
                        <Text variant="bodyStrong" tone="success">
                            From {formatCurrency(item.price)}
                        </Text>
                        {item.rating ? (
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={13} color="#fcbb00" />
                                <Text variant="caption" tone="muted" style={styles.ratingText}>
                                    {Number(item.rating).toFixed(1)}
                                    {item.reviewCount ? ` (${item.reviewCount})` : ''}
                                </Text>
                            </View>
                        ) : (
                            <Text variant="caption" tone="faint">No reviews yet</Text>
                        )}
                    </View>
                </View>
            </Card>
        );
    };

    const renderProjectItem = ({ item }: any) => (
        <Card
            onPress={() => navigation.navigate('ProjectDetails', { id: item._id })}
            style={styles.card}
        >
            <View style={styles.projectHeader}>
                <Text variant="bodyStrong" numberOfLines={2} style={styles.cardTitleText}>
                    {item.title}
                </Text>
                {item.status ? <Badge label={item.status} tone="info" /> : null}
            </View>

            <Text variant="body" tone="muted" numberOfLines={3} style={styles.projectDesc}>
                {item.description}
            </Text>

            <View style={styles.skillsContainer}>
                {item.skillsRequired?.slice(0, 3).map((skill: string) => (
                    <Badge key={skill} label={skill} tone="neutral" style={styles.skillBadge} />
                ))}
            </View>

            <View style={styles.cardFooter}>
                <Text variant="bodyStrong" tone="success">
                    {formatCurrency(item.budgetRange?.min)} – {formatCurrency(item.budgetRange?.max)}
                </Text>
                <Text variant="caption" tone="muted">
                    {item.totalProposals || 0} proposals
                </Text>
            </View>
        </Card>
    );

    const isGigs = activeTab === 'gigs';

    return (
        <ThemeWrapper>
            <TopBar
                large
                title="Marketplace"
                subtitle={isGigs ? 'Services offered by the network' : 'Open briefs looking for talent'}
                showBack={false}
                right={
                    <Button
                        title={isGigs ? 'New gig' : 'New brief'}
                        size="sm"
                        fullWidth={false}
                        icon={<Ionicons name="add" size={16} color={COLORS.white} />}
                        onPress={() => navigation.navigate(isGigs ? 'CreateGig' : 'CreateProject')}
                    />
                }
            />

            {/* Segmented control: the two modes are a switch, not two buttons. */}
            <View style={styles.tabContainer}>
                {([
                    { key: 'gigs', label: 'Find Services' },
                    { key: 'projects', label: 'Find Work' },
                ] as const).map((t) => {
                    const active = activeTab === t.key;
                    return (
                        <Pressable
                            key={t.key}
                            style={[styles.tab, active && styles.activeTab]}
                            onPress={() => setActiveTab(t.key)}
                        >
                            <Text variant="label" color={active ? COLORS.white : COLORS.textMuted}>
                                {t.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={17} color={COLORS.textMuted} />
                    <TextInput
                        placeholder={isGigs ? 'Search services…' : 'Search briefs…'}
                        placeholderTextColor={COLORS.textFaint}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />
                    {searchQuery ? (
                        <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                            <Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
                        </Pressable>
                    ) : null}
                </View>
            </View>

            {loading ? (
                <View style={styles.list}>
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={isGigs ? renderGigItem : renderProjectItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <EmptyState
                            icon={isGigs ? 'pricetags-outline' : 'clipboard-outline'}
                            title={searchQuery ? 'Nothing matches that' : isGigs ? 'No services listed yet' : 'No open briefs'}
                            message={
                                searchQuery
                                    ? 'Try a broader keyword.'
                                    : isGigs
                                        ? 'Be the first to offer a service on the marketplace.'
                                        : 'Post a brief and let freelancers come to you.'
                            }
                            actionLabel={searchQuery ? 'Clear search' : isGigs ? 'Create a gig' : 'Post a brief'}
                            onAction={() => {
                                if (searchQuery) setSearchQuery('');
                                else navigation.navigate(isGigs ? 'CreateGig' : 'CreateProject');
                            }}
                        />
                    }
                />
            )}
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: withAlpha(COLORS.white, 0.05),
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md - 2,
        height: 46,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        color: COLORS.text,
        ...TYPOGRAPHY.body,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        backgroundColor: withAlpha(COLORS.white, 0.05),
        borderRadius: RADIUS.pill,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 9,
        borderRadius: RADIUS.pill,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    list: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.xxl * 2,
    },
    card: {
        marginBottom: SPACING.sm + 4,
    },
    imagePlaceholder: {
        width: '100%',
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(COLORS.white, 0.04),
    },
    cardImage: {
        width: '100%',
        height: 150,
    },
    cardContent: {
        padding: SPACING.md,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    deleteCardBtn: {
        marginLeft: SPACING.sm,
        padding: 2,
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    projectHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: SPACING.sm,
    },
    skillBadge: {
        marginRight: 6,
        marginTop: 6,
    },
    cardTitleText: {
        flex: 1,
        paddingRight: SPACING.xs,
    },
    ratingText: {
        marginLeft: 4,
    },
    projectDesc: {
        marginTop: 6,
    },
});

export default MarketplaceScreen;
