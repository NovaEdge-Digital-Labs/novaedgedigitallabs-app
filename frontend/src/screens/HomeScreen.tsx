import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Image, 
    TextInput, 
    ActivityIndicator, 
    Linking, 
    Alert,
    Pressable,
    RefreshControl,
    Share,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { useAuthStore } from '../store/authStore';
import postApi, { Post } from '../api/postApi';
import { Text as UIText, Card, Button, EmptyState, SkeletonCard, ConfirmModal } from '../components/ui';
import { SPACING, RADIUS, withAlpha } from '../constants/colors';

interface PostCardProps {
    item: Post;
    currentUserId: string;
    onLike: (id: string) => void;
    onComment: (id: string, text: string) => Promise<boolean>;
    onShare: (id: string, content: string, link?: string) => void;
    onUpdate: (id: string, content: string, link?: string) => Promise<boolean>;
    onDelete: (id: string) => void;
    onOpenLink: (url: string) => void;
    getRelativeTime: (dateString: string) => string;
}

const PostCard: React.FC<PostCardProps> = ({
    item,
    currentUserId,
    onLike,
    onComment,
    onShare,
    onUpdate,
    onDelete,
    onOpenLink,
    getRelativeTime
}) => {
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(item.content);
    const [editLink, setEditLink] = useState(item.link || '');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleAddCommentLocal = async () => {
        if (!commentText.trim()) return;
        setIsCommenting(true);
        const success = await onComment(item._id, commentText.trim());
        setIsCommenting(false);
        if (success) {
            setCommentText('');
        }
    };

    const isLiked = item.likes ? item.likes.includes(currentUserId) : false;
    const postUserId = typeof item.userId === 'object' ? item.userId?._id : item.userId;
    const isOwner = Boolean(currentUserId && postUserId && String(postUserId) === String(currentUserId));
    const relativeTime = getRelativeTime(item.createdAt);
    const editedTime = item.updatedAt ? getRelativeTime(item.updatedAt) : 'Just now';
    const userInitial = item.userId?.name?.charAt(0) || 'U';

    // Strictly check isEdited flag (do NOT use updatedAt alone because likes/comments change updatedAt)
    const isPostEdited = Boolean(item.isEdited === true);

    return (
        <View style={[styles.postCard, COLORS.glass]}>
            <View style={styles.postHeader}>
                <View style={[styles.avatarContainer, COLORS.getGlow(COLORS.primary, 8, 0.2)]}>
                    {item.userId?.avatar ? (
                        <Image source={{ uri: item.userId.avatar }} style={styles.postAvatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{userInitial}</Text>
                    )}
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>{item.userId?.name || 'User'}</Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                        {relativeTime}
                        {isPostEdited ? (
                            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                                {` • Edited ${editedTime}`}
                            </Text>
                        ) : null}
                    </Text>
                </View>
                {/* Only Post Owner Can View & Execute Edit / Delete */}
                {isOwner && (
                    <View style={styles.ownerActionsRow}>
                        <TouchableOpacity 
                            onPress={() => {
                                setEditContent(item.content);
                                setEditLink(item.link || '');
                                setIsEditing(!isEditing);
                            }} 
                            style={styles.ownerIconButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons 
                                name={isEditing ? "close-circle-outline" : "create-outline"} 
                                size={18} 
                                color={isEditing ? '#ef4444' : COLORS.primary} 
                            />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => onDelete(item._id)} 
                            style={styles.ownerIconButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            
            {/* If Editing Mode is Active */}
            {isEditing ? (
                <View style={styles.editFormContainer}>
                    <Text style={styles.editFormLabel}>Edit Post</Text>
                    <TextInput
                        style={styles.editTextInput}
                        multiline
                        maxLength={280}
                        value={editContent}
                        onChangeText={setEditContent}
                        placeholder="Edit your post content..."
                        placeholderTextColor={COLORS.textMuted}
                    />
                    <View style={styles.editLinkRow}>
                        <Ionicons name="link" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                        <TextInput
                            style={styles.editLinkInput}
                            value={editLink}
                            onChangeText={setEditLink}
                            placeholder="Edit link (optional)"
                            placeholderTextColor={COLORS.textMuted}
                            autoCapitalize="none"
                            keyboardType="url"
                        />
                    </View>
                    <View style={styles.editButtonsRow}>
                        <TouchableOpacity 
                            style={styles.editCancelBtn} 
                            onPress={() => setIsEditing(false)}
                            disabled={isUpdating}
                        >
                            <Text style={styles.editCancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.editSaveBtn, (!editContent.trim() || isUpdating) && { opacity: 0.5 }]} 
                            disabled={!editContent.trim() || isUpdating}
                            onPress={async () => {
                                setIsUpdating(true);
                                const ok = await onUpdate(item._id, editContent.trim(), editLink.trim());
                                setIsUpdating(false);
                                if (ok) {
                                    setIsEditing(false);
                                }
                            }}
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.editSaveBtnText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                /* Regular Post View */
                <>
                    <Text style={styles.postContent}>{item.content}</Text>
                    
                    {item.link && (
                        <TouchableOpacity onPress={() => onOpenLink(item.link!)} activeOpacity={0.7} style={styles.linkContainer}>
                            <Ionicons name="link-outline" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
                            <Text numberOfLines={1} style={styles.linkText}>{item.link}</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}

            <View style={styles.postActions}>
                {/* Like Action */}
                <TouchableOpacity 
                    onPress={() => onLike(item._id)} 
                    style={styles.actionButton}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name={isLiked ? 'heart' : 'heart-outline'} 
                        size={18} 
                        color={isLiked ? '#ef4444' : COLORS.textMuted} 
                    />
                    <Text style={[styles.actionText, isLiked && { color: '#ef4444' }]}>
                        {item.likes ? item.likes.length : 0}
                    </Text>
                </TouchableOpacity>

                {/* Comment Action */}
                <TouchableOpacity 
                    onPress={() => {
                        setIsCommentsExpanded(!isCommentsExpanded);
                        setCommentText('');
                    }} 
                    style={[styles.actionButton, { marginLeft: 24 }]}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name="chatbubble-outline" 
                        size={18} 
                        color={isCommentsExpanded ? COLORS.primary : COLORS.textMuted} 
                    />
                    <Text style={[styles.actionText, isCommentsExpanded && { color: COLORS.primary }]}>
                        {item.comments ? item.comments.length : 0}
                    </Text>
                </TouchableOpacity>

                {/* Share Action */}
                <TouchableOpacity 
                    onPress={() => onShare(item._id, item.content, item.link)} 
                    style={[styles.actionButton, { marginLeft: 24 }]}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name="share-social-outline" 
                        size={18} 
                        color={COLORS.textMuted} 
                    />
                    <Text style={styles.actionText}>
                        {item.shares ? item.shares.length : 0}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Inline Comments Section */}
            {isCommentsExpanded && (
                <View style={styles.commentsSection}>
                    {item.comments && item.comments.length > 0 && (
                        <View style={styles.commentsList}>
                            {item.comments.map((comment) => (
                                <View key={comment._id} style={styles.commentItem}>
                                    <View style={styles.commentHeader}>
                                        <View style={styles.commentAvatar}>
                                            <Text style={styles.commentAvatarText}>
                                                {comment.userId?.name?.charAt(0) || 'U'}
                                            </Text>
                                        </View>
                                        <View style={styles.commentInfo}>
                                            <Text style={styles.commentUser}>{comment.userId?.name || 'User'}</Text>
                                            <Text style={styles.commentTime}>{getRelativeTime(comment.createdAt)}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.commentContent}>{comment.text}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.addCommentRow}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Write a comment..."
                            placeholderTextColor={COLORS.textMuted}
                            value={commentText}
                            onChangeText={setCommentText}
                        />
                        <TouchableOpacity 
                            onPress={handleAddCommentLocal} 
                            style={[styles.sendCommentButton, !commentText.trim() && { opacity: 0.5 }]}
                            disabled={!commentText.trim() || isCommenting}
                        >
                            {isCommenting ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                                <Ionicons name="send" size={18} color={COLORS.primary} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const HomeScreen: React.FC<any> = ({ navigation }) => {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostText, setNewPostText] = useState('');
    const [newPostLink, setNewPostLink] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [composerFocus, setComposerFocus] = useState<'text' | 'link' | null>(null);
    const [deletePostId, setDeletePostId] = useState<string | null>(null);

    const firstName = (user?.name || '').trim().split(' ')[0] || 'there';
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? `Morning, ${firstName}` : hour < 18 ? `Afternoon, ${firstName}` : `Evening, ${firstName}`;
    const [isRefreshing, setIsRefreshing] = useState(false);

    const currentUserId = user?.id || (user as any)?._id || '';

    const fetchFeed = useCallback(async (showLoader = false) => {
        if (showLoader) setIsLoading(true);
        const res = await postApi.getFeed();
        if (res && res.success) {
            setPosts(res.data);
        }
        setIsLoading(false);
        setIsRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            // Fetch silently on focus if already loaded, otherwise show loader
            fetchFeed(posts.length === 0);
        }, [fetchFeed])
    );

    const handleCreatePost = async () => {
        if (!newPostText.trim()) {
            Alert.alert('Empty Post', 'Please write something before posting.');
            return;
        }

        setIsPosting(true);
        const res = await postApi.createPost(newPostText, newPostLink);
        setIsPosting(false);

        if (res && res.success) {
            setNewPostText('');
            setNewPostLink('');
            // Add new post directly to local state for instant feedback
            setPosts((prev) => [res.data, ...prev]);
        } else {
            Alert.alert('Error', res.message || 'Failed to publish post.');
        }
    };

    const handleLikePost = async (postId: string) => {
        setPosts((prevPosts) => 
            prevPosts.map((post) => {
                if (post._id === postId) {
                    const postLikes = post.likes || [];
                    const liked = postLikes.includes(currentUserId);
                    const updatedLikes = liked 
                        ? postLikes.filter((id) => id !== currentUserId)
                        : [...postLikes, currentUserId];
                    return { ...post, likes: updatedLikes };
                }
                return post;
            })
        );

        await postApi.likePost(postId);
    };

    const handleAddComment = async (postId: string, text: string) => {
        const res = await postApi.addComment(postId, text);
        if (res && res.success) {
            setPosts((prevPosts) => 
                prevPosts.map((post) => post._id === postId ? res.data : post)
            );
            return true;
        } else {
            Alert.alert('Error', res.message || 'Failed to submit comment.');
            return false;
        }
    };

    const handleSharePost = async (postId: string, content: string, link?: string) => {
        try {
            // Optimistic UI update
            setPosts((prevPosts) => 
                prevPosts.map((post) => {
                    if (post._id === postId) {
                        const postShares = post.shares || [];
                        const shared = postShares.includes(currentUserId);
                        const updatedShares = shared 
                            ? postShares.filter((id) => id !== currentUserId)
                            : [...postShares, currentUserId];
                        return { ...post, shares: updatedShares };
                    }
                    return post;
                })
            );

            // Backend Call
            await postApi.sharePost(postId);

            // Native Share Sheet
            const shareMessage = link ? `${content}\n\nLink: ${link}` : content;
            await Share.share({
                message: shareMessage,
            });
        } catch (error) {
            console.error('Error sharing post:', error);
        }
    };

    const handleUpdatePost = async (postId: string, content: string, link?: string) => {
        const nowIso = new Date().toISOString();
        // Optimistic UI update for instant feedback
        setPosts((prevPosts) => 
            prevPosts.map((post) => 
                post._id === postId 
                    ? { ...post, content, link: link || undefined, isEdited: true, updatedAt: nowIso } 
                    : post
            )
        );

        const res = await postApi.updatePost(postId, content, link);
        if (res && res.success) {
            setPosts((prevPosts) => 
                prevPosts.map((post) => (post._id === postId ? { ...res.data, isEdited: true, updatedAt: res.data.updatedAt || nowIso } : post))
            );
            Alert.alert('Success', 'Post updated successfully.');
            return true;
        } else {
            Alert.alert('Error', res.message || 'Failed to update post.');
            fetchFeed();
            return false;
        }
    };

    const handleOpenLink = async (url: string) => {
        try {
            let formattedUrl = url.trim();
            if (!/^https?:\/\//i.test(formattedUrl)) {
                formattedUrl = 'https://' + formattedUrl;
            }
            const supported = await Linking.canOpenURL(formattedUrl);
            if (supported) {
                await Linking.openURL(formattedUrl);
            } else {
                Alert.alert('Invalid URL', 'Cannot open this link.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to open the link.');
        }
    };

    const handleDeletePost = (postId: string) => {
        setDeletePostId(postId);
    };

    const confirmDeletePost = async () => {
        if (!deletePostId) return;
        const postId = deletePostId;
        setDeletePostId(null);
        
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        postApi.deletePost(postId).then(res => {
            if (!res || !res.success) {
                if (Platform.OS === 'web') {
                    window.alert(res?.message || 'Failed to delete post.');
                } else {
                    Alert.alert('Error', res?.message || 'Failed to delete post.');
                }
                fetchFeed();
            }
        });
    };

    const getRelativeTime = (dateString: string) => {
        const now = new Date();
        const postDate = new Date(dateString);
        const diffMs = now.getTime() - postDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <ThemeWrapper>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoRow}>
                    <View style={styles.brandMark}>
                        <Image source={require('../../assets/icon.png')} style={styles.headerIcon} />
                    </View>
                    <View style={styles.brandText}>
                        <UIText variant="wordmark" style={styles.logoNova}>NovaEdge</UIText>
                        <UIText variant="eyebrow" tone="accent">Digital Labs</UIText>
                    </View>
                </View>

                <Pressable
                    onPress={() => navigation.navigate('Profile')}
                    hitSlop={8}
                    style={({ pressed }) => [styles.avatarButton, pressed && styles.avatarButtonPressed]}
                    accessibilityLabel="Open profile"
                >
                    <UIText variant="bodyStrong" color={COLORS.white}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </UIText>
                </Pressable>
            </View>

            <View style={styles.greeting}>
                <UIText variant="display" numberOfLines={1}>
                    {greeting}
                </UIText>
                <UIText variant="bodyLarge" tone="muted">
                    Here's what the network is building.
                </UIText>
            </View>

            {/* Main Content */}
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <PostCard
                        item={item}
                        currentUserId={currentUserId}
                        onLike={handleLikePost}
                        onComment={handleAddComment}
                        onShare={handleSharePost}
                        onUpdate={handleUpdatePost}
                        onDelete={handleDeletePost}
                        onOpenLink={handleOpenLink}
                        getRelativeTime={getRelativeTime}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefreshing} 
                        onRefresh={() => {
                            setIsRefreshing(true);
                            fetchFeed(false);
                        }} 
                        tintColor={COLORS.primary}
                    />
                }
                ListHeaderComponent={
                    <Card style={styles.createPostCard}>
                        <View style={styles.composerHeader}>
                            <View style={[styles.composerAvatar, !user?.avatar && { backgroundColor: COLORS.primary }]}>
                                {user?.avatar ? (
                                    <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
                                ) : (
                                    <UIText variant="bodyStrong" color={COLORS.white}>
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </UIText>
                                )}
                            </View>
                            <UIText variant="h3">Share an update</UIText>
                        </View>

                        <TextInput
                            style={[styles.textInput, composerFocus === 'text' && styles.inputFocused]}
                            placeholder="What are you working on?"
                            placeholderTextColor={COLORS.textFaint}
                            multiline
                            maxLength={280}
                            value={newPostText}
                            onChangeText={setNewPostText}
                            onFocus={() => setComposerFocus('text')}
                            onBlur={() => setComposerFocus(null)}
                        />

                        <View style={[styles.linkInputRow, composerFocus === 'link' && styles.inputFocused]}>
                            <Ionicons
                                name="link"
                                size={16}
                                color={composerFocus === 'link' ? COLORS.accent : COLORS.textMuted}
                            />
                            <TextInput
                                style={styles.linkInput}
                                placeholder="Add a link (optional)"
                                placeholderTextColor={COLORS.textFaint}
                                value={newPostLink}
                                onChangeText={setNewPostLink}
                                onFocus={() => setComposerFocus('link')}
                                onBlur={() => setComposerFocus(null)}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="url"
                            />
                            {newPostLink ? (
                                <Pressable onPress={() => setNewPostLink('')} hitSlop={10}>
                                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                                </Pressable>
                            ) : null}
                        </View>

                        <View style={styles.cardFooter}>
                            <UIText
                                variant="caption"
                                tone={newPostText.length >= 260 ? 'error' : 'faint'}
                            >
                                {280 - newPostText.length} left
                            </UIText>
                            <Button
                                title="Post"
                                size="sm"
                                fullWidth={false}
                                loading={isPosting}
                                disabled={!newPostText.trim()}
                                onPress={handleCreatePost}
                                icon={<Ionicons name="send" size={14} color={COLORS.white} />}
                            />
                        </View>
                    </Card>
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View>
                            <SkeletonCard lines={3} />
                            <SkeletonCard lines={2} />
                        </View>
                    ) : (
                        <EmptyState
                            icon="chatbubble-ellipses-outline"
                            title="No updates yet"
                            message="Be the first to share what you're building."
                        />
                    )
                }
            />
            <ConfirmModal
                visible={!!deletePostId}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
                onConfirm={confirmDeletePost}
                onCancel={() => setDeletePostId(null)}
            />
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
            },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        width: 26,
        height: 26,
        resizeMode: 'contain',
    },
    logoNova: {
        marginBottom: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    createPostCard: {
        marginBottom: SPACING.md,
    },
    textInput: {
        minHeight: 84,
        maxHeight: 160,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
        backgroundColor: withAlpha(COLORS.white, 0.05),
        paddingHorizontal: SPACING.md - 2,
        paddingTop: 12,
        paddingBottom: 12,
        color: COLORS.text,
        textAlignVertical: 'top',
        fontSize: 15,
        lineHeight: 21,
    },
    linkInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        height: 44,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.borderSubtle,
        backgroundColor: withAlpha(COLORS.white, 0.05),
        paddingHorizontal: SPACING.md - 2,
    },
    linkInput: {
        flex: 1,
        marginHorizontal: SPACING.sm,
        color: COLORS.text,
        fontSize: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
    },
    postCard: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 15,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    postAvatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: 'bold',
    },
    userEmail: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    ownerActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ownerIconButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    editFormContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        padding: 12,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    editFormLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    editTextInput: {
        minHeight: 70,
        color: COLORS.white,
        fontSize: 14,
        textAlignVertical: 'top',
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        marginBottom: 10,
    },
    editLinkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 36,
        marginBottom: 12,
    },
    editLinkInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: 13,
    },
    editButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    editCancelBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    editCancelBtnText: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    editSaveBtn: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editSaveBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    postContent: {
        color: COLORS.white,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    linkText: {
        color: COLORS.primary,
        fontSize: 14,
        flex: 1,
    },
    postActions: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: 10,
        flexDirection: 'row',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '600',
    },
    commentsSection: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: 12,
    },
    commentsList: {
        marginBottom: 12,
    },
    commentItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    commentAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    commentAvatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 11,
    },
    commentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentUser: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: 'bold',
        marginRight: 6,
    },
    commentTime: {
        color: COLORS.textMuted,
        fontSize: 11,
    },
    commentContent: {
        color: COLORS.white,
        fontSize: 13,
        lineHeight: 18,
        paddingLeft: 4,
    },
    addCommentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 38,
    },
    commentInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: 13,
    },
    sendCommentButton: {
        padding: 4,
    },

    composerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    composerAvatar: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        marginRight: SPACING.sm + 2,
    },
    inputFocused: {
        borderColor: COLORS.primary,
        backgroundColor: withAlpha(COLORS.primary, 0.08),
    },

    brandMark: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(COLORS.primary, 0.14),
        borderWidth: 1,
        borderColor: withAlpha(COLORS.primary, 0.32),
        marginRight: SPACING.sm + 2,
    },
    brandText: {
        justifyContent: 'center',
    },
    avatarButton: {
        width: 38,
        height: 38,
        borderRadius: RADIUS.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderWidth: 1,
        borderColor: withAlpha(COLORS.white, 0.22),
    },
    avatarButtonPressed: {
        opacity: 0.75,
    },
    greeting: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
    },
});

export default HomeScreen;
