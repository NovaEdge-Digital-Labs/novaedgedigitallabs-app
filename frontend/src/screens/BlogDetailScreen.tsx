import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import blogApi, { Blog } from '../api/blogApi';
import Markdown from 'react-native-markdown-display';
import { useAppConfigStore } from '../store/appConfigStore';

const BlogDetailScreen: React.FC<any> = ({ route, navigation }) => {
    const { config } = useAppConfigStore();
    const { blogId, blog: initialBlog } = route.params || {};
    const [blog, setBlog] = useState<Blog | null>(initialBlog || null);
    const [isLoading, setIsLoading] = useState(!initialBlog && !!blogId);

    useEffect(() => {
        if (blogId && (!blog || !blog.content)) {
            const loadBlogDetail = async () => {
                try {
                    setIsLoading(true);
                    const res = await blogApi.getBlogById(blogId);
                    if (res.success && res.data) {
                        setBlog(res.data);
                    }
                } catch (error) {
                    console.error('Error fetching blog detail:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadBlogDetail();
        }
    }, [blogId]);

    const handleShare = async () => {
        if (!blog) return;
        try {
            await Share.share({
                title: blog.title,
                message: `${blog.title}\n\nRead more on NovaEdge Digital Labs App!\n\nDownload the App: ${config?.appDownloadLink || 'https://play.google.com/store/apps/details?id=in.novaedgedigitallabs.tech'}`,
            });
        } catch (error) {
            console.error('Error sharing blog:', error);
        }
    };

    const renderFormattedText = (text: string, baseStyle: any, keyPrefix: string) => {
        let cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        const parts = cleanText.split(/(\*\*.*?\*\*)/g);
        return (
            <Text key={keyPrefix} style={baseStyle}>
                {parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <Text key={index} style={{ fontWeight: '700', color: COLORS.text }}>{part.slice(2, -2)}</Text>;
                    }
                    return <Text key={index}>{part}</Text>;
                })}
            </Text>
        );
    };

    if (isLoading) {
        return (
            <ThemeWrapper>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading article...</Text>
                </View>
            </ThemeWrapper>
        );
    }

    if (!blog) {
        return (
            <ThemeWrapper>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color={COLORS.accent} />
                    <Text style={styles.errorTitle}>Article Not Found</Text>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ThemeWrapper>
        );
    }

    return (
        <ThemeWrapper>
            <View style={styles.container}>
                {/* Header Bar */}
                <View style={styles.headerBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>Article</Text>
                    <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                        <Ionicons name="share-social-outline" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Hero Image */}
                    <Image 
                        source={{ uri: blog.imageUrl || blog.coverImage?.url || config?.defaultBlogImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80' }} 
                        style={styles.heroImage}
                        resizeMode="cover"
                    />

                    <View style={styles.articleBody}>
                        {/* Category & Metadata */}
                        <View style={styles.metaHeader}>
                            {blog.category && (
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{blog.category.toUpperCase()}</Text>
                                </View>
                            )}
                            {blog.readTime && (
                                <View style={styles.readTimeRow}>
                                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                                    <Text style={styles.readTimeText}>{blog.readTime}</Text>
                                </View>
                            )}
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>{blog.title}</Text>

                        {/* Author & Date Box */}
                        <View style={styles.authorBox}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitial}>
                                    {(blog.author || 'N')[0].toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.authorInfo}>
                                <Text style={styles.authorName}>{blog.author || 'NovaEdge Team'}</Text>
                                {blog.publishedAt && (
                                    <Text style={styles.publishDate}>
                                        Published on {new Date(blog.publishedAt).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Excerpt / Summary Box */}
                        {blog.excerpt && (
                            <View style={styles.excerptBox}>
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} style={styles.quoteIcon} />
                                <Text style={styles.excerptText}>{blog.excerpt}</Text>
                            </View>
                        )}

                    {/* Key Takeaways */}
                    {blog.keyTakeaways && blog.keyTakeaways.length > 0 && (
                        <View style={styles.takeawaysContainer}>
                            <Text style={styles.sectionHeaderTitle}>⚡ Key Takeaways</Text>
                            {blog.keyTakeaways.map((item, index) => (
                                <View key={index} style={styles.takeawayItem}>
                                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                    <Text style={styles.takeawayText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Main Content (String fallback) */}
                    {blog.content && typeof blog.content === 'string' && (
                        <Text style={styles.mainContentText}>{blog.content}</Text>
                    )}

                    {/* Dynamic Body Content (Supports blog.body or blog.content as array) */}
                    {(() => {
                        const blocks = Array.isArray(blog.content) ? blog.content : (Array.isArray(blog.body) ? blog.body : []);
                        if (!blocks || blocks.length === 0) return null;
                        
                        return blocks.map((block: any, idx: number) => {
                        // Handle 'html' type (fallback)
                        if (block.type === 'html' && block.content) {
                            const cleanText = block.content.replace(/<[^>]*>?/gm, '');
                            return <Text key={`body-${idx}`} style={styles.mainContentText}>{cleanText}</Text>;
                        }
                        // Handle 'paragraph' type
                        if (block.type === 'paragraph' && block.text) {
                            return (
                                <View key={`body-${idx}`} style={{ marginBottom: 20 }}>
                                    <Markdown style={markdownStyles}>{block.text}</Markdown>
                                </View>
                            );
                        }
                        // Handle 'heading' type
                        if (block.type === 'heading' && block.text) {
                            const headingStyle: any = block.level === 3 
                                ? { fontSize: 20, marginBottom: 12, marginTop: 12, fontWeight: '700', color: COLORS.text } 
                                : { fontSize: 24, marginTop: 24, marginBottom: 16, fontWeight: '800', color: COLORS.text, lineHeight: 32 };
                            return <Text key={`body-${idx}`} style={headingStyle}>{block.text}</Text>;
                        }
                        // Handle 'list' type
                        if (block.type === 'list' && block.items && Array.isArray(block.items)) {
                            return (
                                <View key={`body-${idx}`} style={styles.listContainer}>
                                    {block.items.map((item: string, i: number) => (
                                        <View key={`li-${i}`} style={styles.listItem}>
                                            <Text style={styles.bulletPoint}>•</Text>
                                            {renderFormattedText(item, styles.listItemText, `li-text-${i}`)}
                                        </View>
                                    ))}
                                </View>
                            );
                        }
                        // Handle 'image' type
                        if ((block.type === 'image' && block.url) || (block.type === 'image' && block.src)) {
                            const imgSrc = block.url || block.src;
                            return <Image key={`body-${idx}`} source={{ uri: imgSrc }} style={styles.sectionImage} resizeMode="cover" />;
                        }
                        // Handle 'divider' type
                        if (block.type === 'divider') {
                            return <View key={`body-${idx}`} style={styles.divider} />;
                        }
                        return null;
                        });
                    })()}

                    {/* Content Sections */}
                    {blog.sections && blog.sections.length > 0 && blog.sections.map((sec, idx) => (
                        <View key={`sec-${idx}`} style={styles.sectionBlock}>
                            {sec.title && <Text style={styles.sectionTitle}>{sec.title}</Text>}
                            {sec.image && (
                                <Image source={{ uri: sec.image }} style={styles.sectionImage} resizeMode="cover" />
                            )}
                            {sec.content && <Text style={styles.sectionContent}>{sec.content}</Text>}
                        </View>
                    ))}

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {blog.tags.map((tag, idx) => (
                                <View key={idx} style={styles.tagChip}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Author Bio */}
                    {blog.authorBio && (
                        <View style={styles.authorBioCard}>
                            <Text style={styles.authorBioTitle}>About {blog.author || 'Author'}</Text>
                            <Text style={styles.authorBioText}>{blog.authorBio}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
            </View>
        </ThemeWrapper>
    );
};

const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 28,
        letterSpacing: 0.2,
    },
    table: {
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 8,
    },
    tr: {
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    th: {
        backgroundColor: COLORS.cardBackground,
        color: COLORS.text,
        fontWeight: 'bold',
        padding: 8,
    },
    td: {
        padding: 8,
        color: COLORS.text,
    },
    strong: {
        fontWeight: '700',
        color: COLORS.text,
    },
    link: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    paragraph: {
        marginTop: 0,
        marginBottom: 0,
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 52,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    iconBtn: {
        padding: 6,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 12,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroImage: {
        width: '100%',
        height: 230,
    },
    articleBody: {
        padding: 20,
    },
    metaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    categoryText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    readTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readTimeText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        lineHeight: 32,
        marginBottom: 16,
    },
    authorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20,
    },
    avatarPlaceholder: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarInitial: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    authorInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    publishDate: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    excerptBox: {
        backgroundColor: COLORS.cardBackground,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    quoteIcon: {
        marginBottom: 6,
    },
    excerptText: {
        fontSize: 15,
        fontStyle: 'italic',
        color: COLORS.text,
        lineHeight: 22,
    },
    takeawaysContainer: {
        backgroundColor: COLORS.primary + '10',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    sectionHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 12,
    },
    takeawayItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    takeawayText: {
        fontSize: 14,
        color: COLORS.text,
        marginLeft: 8,
        flex: 1,
        lineHeight: 20,
    },
    mainContentText: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 28,
        marginBottom: 20,
        letterSpacing: 0.2,
    },
    listContainer: {
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    bulletPoint: {
        color: COLORS.primary,
        fontSize: 18,
        marginRight: 10,
        marginTop: -2,
        fontWeight: 'bold',
    },
    listItemText: {
        color: COLORS.text,
        fontSize: 16,
        lineHeight: 26,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 30,
        opacity: 0.5,
    },
    sectionBlock: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 10,
    },
    sectionImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: 12,
    },
    sectionContent: {
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 24,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
        marginBottom: 20,
    },
    tagChip: {
        backgroundColor: COLORS.cardBackground,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tagText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '500',
    },
    authorBioCard: {
        backgroundColor: COLORS.cardBackground,
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    authorBioTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 6,
    },
    authorBioText: {
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 18,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textMuted,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 12,
        marginBottom: 16,
    },
    backBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backBtnText: {
        color: '#FFF',
        fontWeight: '600',
    },
});

export default BlogDetailScreen;
