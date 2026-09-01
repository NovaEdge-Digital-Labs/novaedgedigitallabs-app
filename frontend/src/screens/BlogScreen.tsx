import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import blogApi, { Blog } from '../api/blogApi';
import { useAppConfigStore } from '../store/appConfigStore';

const BlogScreen: React.FC<any> = ({ navigation }) => {
    const { config } = useAppConfigStore();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const fetchBlogs = useCallback(async () => {
        try {
            const res = await blogApi.getBlogs();
            if (res.success && Array.isArray(res.data)) {
                setBlogs(res.data);
            } else if (Array.isArray(res)) {
                setBlogs(res);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBlogs();
    };

    const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category).filter(Boolean))) as string[]];

    const filteredBlogs = blogs.filter(blog => {
        const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
        const matchesSearch = searchQuery.trim() === '' ||
            blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const renderBlogCard = ({ item }: { item: Blog }) => (
        <TouchableOpacity
            style={styles.blogCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BlogDetail', { blogId: item._id, blog: item })}
        >
            <Image
                source={{ uri: item.imageUrl || config?.defaultBlogImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80' }}
                style={styles.cardImage}
                resizeMode="cover"
            />

            <View style={styles.cardContent}>
                {item.category && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.category.toUpperCase()}</Text>
                    </View>
                )}

                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

                {item.excerpt && (
                    <Text style={styles.cardExcerpt} numberOfLines={2}>{item.excerpt}</Text>
                )}

                <View style={styles.cardMeta}>
                    <View style={styles.authorRow}>
                        <Ionicons name="person-circle-outline" size={16} color={COLORS.textMuted} />
                        <Text style={styles.authorText} numberOfLines={1}>
                            {item.author || 'NovaEdge Team'}
                        </Text>
                    </View>

                    <View style={styles.metaRight}>
                        {item.readTime && (
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                                <Text style={styles.metaText}>{item.readTime}</Text>
                            </View>
                        )}
                        {item.publishedAt && (
                            <Text style={styles.metaText}>
                                {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemeWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Blogs & Insights</Text>
                        <Text style={styles.headerSubtitle}>Articles, tech updates & news</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search articles..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Categories */}
                {categories.length > 1 && (
                    <View style={styles.categoriesContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === cat && styles.selectedCategoryChip
                                    ]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryChipText,
                                            selectedCategory === cat && styles.selectedCategoryChipText
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Content List */}
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading articles...</Text>
                    </View>
                ) : filteredBlogs.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="newspaper-outline" size={60} color={COLORS.textMuted} />
                        <Text style={styles.emptyTitle}>No Articles Found</Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery ? 'Try adjusting your search query' : 'Check back later for new blog posts.'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredBlogs}
                        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                        renderItem={renderBlogCard}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                        }
                    />
                )}
            </View>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
    },
    categoriesContainer: {
        marginVertical: 6,
    },
    categoriesContent: {
        paddingHorizontal: 16,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: COLORS.cardBackground,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    selectedCategoryChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryChipText: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    selectedCategoryChipText: {
        color: '#FFF',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    blogCard: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    cardContent: {
        padding: 16,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
    },
    categoryBadgeText: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        lineHeight: 24,
        marginBottom: 6,
    },
    cardExcerpt: {
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 18,
        marginBottom: 12,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border + '60',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    authorText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 4,
        fontWeight: '500',
    },
    metaRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textMuted,
        fontSize: 14,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 6,
    },
});

export default BlogScreen;
