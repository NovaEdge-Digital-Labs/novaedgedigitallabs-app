import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';
import { formatCurrency } from '../utils/helpers';

const MarketplaceScreen = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = useState<'gigs' | 'projects'>('gigs');
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
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

    const renderGigItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('GigDetails', { id: item._id })}
        >
            <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={COLORS.textMuted} />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.freelancerName}>By {item.freelancerId?.name || 'Freelancer'}</Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.price}>From {formatCurrency(item.price)}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>4.8 (24)</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderProjectItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProjectDetails', { id: item._id })}
        >
            <View style={styles.cardContent}>
                <View style={styles.projectHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>
                <Text style={styles.projectDesc} numberOfLines={3}>{item.description}</Text>
                <View style={styles.skillsContainer}>
                    {item.skillsRequired?.slice(0, 3).map((skill: string) => (
                        <View key={skill} style={styles.skillBadge}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.cardFooter}>
                    <Text style={styles.budget}>{formatCurrency(item.budgetRange?.min)} - {formatCurrency(item.budgetRange?.max)}</Text>
                    <Text style={styles.proposals}>{item.totalProposals || 0} proposals</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemeWrapper>
            <View style={styles.topContainer}>
                <View style={styles.titleRow}>
                    <Text style={styles.headerTitle}>Marketplace</Text>
                    <TouchableOpacity
                        style={styles.postButton}
                        onPress={() => navigation.navigate(activeTab === 'gigs' ? 'CreateGig' : 'CreateProject')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={COLORS.textMuted} />
                        <TextInput
                            placeholder={activeTab === 'gigs' ? "Search services..." : "Search projects..."}
                            placeholderTextColor={COLORS.textMuted}
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'gigs' && styles.activeTab]}
                        onPress={() => setActiveTab('gigs')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'gigs' && styles.activeTabText]}>Find Services</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
                        onPress={() => setActiveTab('projects')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>Find Work</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={activeTab === 'gigs' ? renderGigItem : renderProjectItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No results found</Text>
                        </View>
                    }
                />
            )}
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    topContainer: {
        paddingTop: 50, // For status bar compensation
        paddingBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `rgba(255, 255, 255, ${COLORS.effects.inputOpacity})`,
        borderRadius: COLORS.geometry.radiusMedium,
        paddingHorizontal: 15,
        height: 52,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.text,
    },
    postButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...COLORS.getGlow(COLORS.primary),
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: COLORS.card,
        borderRadius: COLORS.geometry.radiusLarge,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: COLORS.geometry.radiusLarge - 4,
    },
    activeTab: {
        backgroundColor: COLORS.primary + '30', // Semi-transparent primary
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    tabText: {
        color: COLORS.textMuted,
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabText: {
        color: COLORS.white,
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imagePlaceholder: {
        width: '100%',
        height: 120,
        backgroundColor: COLORS.backgroundSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    freelancerName: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    budget: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.accent,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.text,
        marginLeft: 4,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    statusBadge: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    projectDesc: {
        fontSize: 14,
        color: COLORS.textMuted,
        lineHeight: 20,
        marginBottom: 12,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    skillBadge: {
        backgroundColor: COLORS.backgroundSoft,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    skillText: {
        color: COLORS.text,
        fontSize: 11,
    },
    proposals: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        color: COLORS.textMuted,
        marginTop: 12,
        fontSize: 16,
    }
});

export default MarketplaceScreen;
