import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl, TextInput, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import postApi, { Post } from '../api/postApi';
import ThemeWrapper from '../components/ThemeWrapper';
import {
    Screen,
    Text as UIText,
    Card,
    Button,
    Badge,
    ListRow,
    SectionHeader,
    StatTile,
    EmptyState,
    SkeletonCard,
    ConfirmModal,
} from '../components/ui';
import { SPACING, RADIUS, withAlpha } from '../constants/colors';
import { useFocusEffect } from '@react-navigation/native';

interface UserPostItemProps {
    post: Post;
    onUpdate: (id: string, content: string, link?: string) => Promise<boolean>;
    onDelete: (id: string) => void;
}

const UserPostItem: React.FC<UserPostItemProps> = ({ post, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [editLink, setEditLink] = useState(post.link || '');
    const [isUpdating, setIsUpdating] = useState(false);

    const isPostEdited = Boolean(post.isEdited === true);
    const getRelativeTime = (dateString?: string) => {
        if (!dateString) return '';
        const now = new Date();
        const postDate = new Date(dateString);
        const diffMs = now.getTime() - postDate.getTime();
        if (isNaN(diffMs) || diffMs < 0) return 'Just now';
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };
    const editedTime = post.updatedAt ? getRelativeTime(post.updatedAt) : 'Just now';

    return (
        <View style={[styles.userPostCard, COLORS.glass]}>
            <View style={styles.userPostHeader}>
                <Text style={styles.userPostBadge}>
                    MY UPDATE{isPostEdited ? <Text style={{ color: COLORS.primary }}> • EDITED {editedTime.toUpperCase()}</Text> : null}
                </Text>
                <View style={styles.userPostActions}>
                    <TouchableOpacity 
                        onPress={() => {
                            setEditContent(post.content);
                            setEditLink(post.link || '');
                            setIsEditing(!isEditing);
                        }} 
                        style={styles.ownerIconButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name={isEditing ? "close-circle-outline" : "create-outline"} 
                            size={16} 
                            color={isEditing ? '#ef4444' : COLORS.primary} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => onDelete(post._id)} 
                        style={styles.ownerIconButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {isEditing ? (
                <View style={styles.editFormContainer}>
                    <TextInput
                        style={styles.editTextInput}
                        multiline
                        maxLength={280}
                        value={editContent}
                        onChangeText={setEditContent}
                        placeholder="Edit your post..."
                        placeholderTextColor={COLORS.textMuted}
                    />
                    <TextInput
                        style={styles.editLinkInput}
                        value={editLink}
                        onChangeText={setEditLink}
                        placeholder="Edit link (optional)"
                        placeholderTextColor={COLORS.textMuted}
                        autoCapitalize="none"
                        keyboardType="url"
                    />
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
                                const ok = await onUpdate(post._id, editContent.trim(), editLink.trim());
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
                <>
                    <Text style={styles.userPostContent}>{post.content}</Text>
                    {post.link && (
                        <Text style={styles.userPostLink} numberOfLines={1}>
                            {post.link}
                        </Text>
                    )}
                </>
            )}

            <View style={styles.userPostStats}>
                <View style={styles.statIconItem}>
                    <Ionicons name="heart" size={14} color="#ef4444" />
                    <Text style={styles.statIconText}>{post.likes ? post.likes.length : 0}</Text>
                </View>
                <View style={[styles.statIconItem, { marginLeft: 16 }]}>
                    <Ionicons name="chatbubble" size={14} color={COLORS.primary} />
                    <Text style={styles.statIconText}>{post.comments ? post.comments.length : 0}</Text>
                </View>
                <View style={[styles.statIconItem, { marginLeft: 16 }]}>
                    <Ionicons name="share-social" size={14} color={COLORS.textMuted} />
                    <Text style={styles.statIconText}>{post.shares ? post.shares.length : 0}</Text>
                </View>
            </View>
        </View>
    );
};

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuthStore();
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [isPostsLoading, setIsPostsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deletePostId, setDeletePostId] = useState<string | null>(null);

    const fetchUserPosts = useCallback(async (showLoader = true) => {
        if (showLoader) setIsPostsLoading(true);
        const res = await postApi.getUserPosts();
        if (res && res.success) {
            setUserPosts(res.data);
        }
        setIsPostsLoading(false);
        setIsRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUserPosts(true);
        }, [fetchUserPosts])
    );

    const handleUpdatePost = async (postId: string, content: string, link?: string) => {
        const res = await postApi.updatePost(postId, content, link);
        if (res && res.success) {
            setUserPosts((prev) =>
                prev.map((post) => (post._id === postId ? res.data : post))
            );
            Alert.alert('Success', 'Post updated successfully.');
            return true;
        } else {
            Alert.alert('Error', res.message || 'Failed to update post.');
            return false;
        }
    };

    const handleDeletePost = (postId: string) => {
        setDeletePostId(postId);
    };

    const confirmDeletePost = async () => {
        if (!deletePostId) return;
        const postId = deletePostId;
        setDeletePostId(null);
        
        setUserPosts((prev) => prev.filter((p) => p._id !== postId));
        postApi.deletePost(postId).then(res => {
            if (!res || !res.success) {
                if (Platform.OS === 'web') {
                    window.alert(res?.message || 'Failed to delete post.');
                } else {
                    Alert.alert('Error', res?.message || 'Failed to delete post.');
                }
                fetchUserPosts(false);
            }
        });
    };

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to log out?')) {
                logout();
            }
        } else {
            Alert.alert(
                'Logout',
                'Are you sure you want to log out?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', style: 'destructive', onPress: logout },
                ]
            );
        }
    };

    /**
     * Profile is account-only now. Tools, Store, Services and Workspace moved
     * to the Explore tab, which cut this list from 20 flat rows to 4 groups.
     */
    const isAdmin = Boolean(
        (user as any)?.role === 'admin' || (user as any)?.isAdmin || user?.email?.includes('admin')
    );

    const MENU_GROUPS: Array<{
        eyebrow: string;
        title: string;
        rows: Array<{
            icon: keyof typeof Ionicons.glyphMap;
            title: string;
            subtitle?: string;
            tint: string;
            onPress: () => void;
            badge?: string;
        }>;
    }> = [
        {
            eyebrow: 'Activity',
            title: 'Your work',
            rows: [
                {
                    icon: 'document-text-outline',
                    title: 'My Applications',
                    subtitle: 'Track roles you have applied to',
                    tint: '#8B7CF6',
                    onPress: () => navigation.navigate('MyApplications'),
                },
                {
                    icon: 'bookmark-outline',
                    title: 'Saved Jobs',
                    subtitle: 'Listings you bookmarked',
                    tint: '#F1A10D',
                    onPress: () => navigation.navigate('SavedJobs'),
                },
                {
                    icon: 'megaphone-outline',
                    title: 'My Posted Jobs',
                    subtitle: 'Edit or close your listings',
                    tint: '#C25EA0',
                    onPress: () => navigation.navigate('MyPostedJobs'),
                },
                {
                    icon: 'people-outline',
                    title: 'Received Applicants',
                    subtitle: 'Candidates who applied to you',
                    tint: '#5B7CFA',
                    onPress: () => navigation.navigate('EmployerApplicants'),
                },
                {
                    icon: 'download-outline',
                    title: 'My Purchases',
                    subtitle: 'Assets you have bought',
                    tint: '#00A2C7',
                    onPress: () => navigation.navigate('MyPurchases'),
                },
            ],
        },
        {
            eyebrow: 'Account',
            title: 'Settings',
            rows: [
                {
                    icon: 'person-outline',
                    title: 'Edit Profile',
                    subtitle: 'Name, avatar and details',
                    tint: '#9E8CFC',
                    onPress: () => navigation.navigate('EditProfile'),
                },
                {
                    icon: 'notifications-outline',
                    title: 'Notifications',
                    subtitle: 'Alerts and news',
                    tint: '#FF6369',
                    onPress: () => Alert.alert('Coming Soon', 'Notifications will be available in the next update.'),
                },
                {
                    icon: 'shield-checkmark-outline',
                    title: 'Privacy & Security',
                    subtitle: 'Password and data settings',
                    tint: '#4CC38A',
                    onPress: () => navigation.navigate('PrivacySecurity'),
                },
            ],
        },
        {
            eyebrow: 'Billing',
            title: 'Plan & rewards',
            rows: [
                {
                    icon: 'card-outline',
                    title: 'Manage Subscription',
                    subtitle: 'Billing history and plans',
                    tint: '#8B7CF6',
                    onPress: () => navigation.navigate('Subscription'),
                },
                {
                    icon: 'star-outline',
                    title: 'Premium Candidate Pass',
                    subtitle: 'Verified badge and top ranking',
                    tint: '#F1A10D',
                    badge: 'PRO',
                    onPress: () => navigation.navigate('PremiumUpgrade'),
                },
                {
                    icon: 'gift-outline',
                    title: 'Refer and Earn',
                    subtitle: 'Invite friends, get Pro free',
                    tint: '#4CC38A',
                    onPress: () => navigation.navigate('ReferEarn'),
                },
            ],
        },
        {
            eyebrow: 'Support',
            title: 'Get help',
            rows: [
                {
                    icon: 'help-circle-outline',
                    title: 'Help Center',
                    subtitle: 'FAQs and guides',
                    tint: '#5B7CFA',
                    onPress: () => navigation.navigate('Support', { title: 'Help Center' }),
                },
                {
                    icon: 'chatbubble-ellipses-outline',
                    title: 'Contact Support',
                    subtitle: 'Talk to our team',
                    tint: '#4CC38A',
                    onPress: () => navigation.navigate('Support', { title: 'Contact Support' }),
                },
                {
                    icon: 'information-circle-outline',
                    title: 'About NovaEdge',
                    tint: '#99a1af',
                    onPress: () => navigation.navigate('About'),
                },
            ],
        },
    ];

    const planLabel = (user?.plan || 'free').toUpperCase();
    const isPaidPlan = user?.plan === 'pro' || user?.plan === 'business';

    return (
        <ThemeWrapper>
            <Screen scroll refreshing={isRefreshing} onRefresh={() => {
                setIsRefreshing(true);
                fetchUserPosts(false);
            }}>
                {/* Identity */}
                <View style={styles.header}>
                    {user?.avatar ? (
                        <Image source={{ uri: user.avatar }} style={{ width: 88, height: 88, borderRadius: 44 }} />
                    ) : (
                        <View style={styles.avatarContainer}>
                            <UIText variant="display" color={COLORS.white}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </UIText>
                        </View>
                    )}
                    <UIText variant="h1" center>{user?.name || 'User Name'}</UIText>
                    <UIText variant="body" tone="muted" center style={styles.headerEmail}>
                        {user?.email || 'user@example.com'}
                    </UIText>
                    <Badge
                        label={`${planLabel} PLAN`}
                        tone={isPaidPlan ? 'primary' : 'neutral'}
                        style={styles.headerBadge}
                    />
                </View>

                {/* Metrics */}
                <View style={styles.statsRow}>
                    <StatTile label="Posts" value={userPosts.length} icon="chatbubbles-outline" />
                    <StatTile
                        label="Plan"
                        value={planLabel}
                        icon="ribbon-outline"
                        tint="#54a2ff"
                        style={styles.statSpacer}
                    />
                    <StatTile
                        label="Job Quota"
                        value={isPaidPlan ? '\u221e' : '1'}
                        icon="briefcase-outline"
                        tint="#c07eff"
                        style={styles.statSpacer}
                    />
                </View>

                <Button
                    title="Edit Profile"
                    variant="secondary"
                    size="sm"
                    icon={<Ionicons name="create-outline" size={16} color={COLORS.text} />}
                    onPress={() => navigation.navigate('EditProfile')}
                    style={styles.editCta}
                />

                {/* Grouped menu */}
                {MENU_GROUPS.map((group) => (
                    <View key={group.eyebrow} style={styles.menuGroup}>
                        <SectionHeader eyebrow={group.eyebrow} title={group.title} />
                        <Card padded={false} variant="subtle">
                            {group.rows.map((row, i) => (
                                <View key={row.title}>
                                    {i > 0 ? <View style={styles.rowDivider} /> : null}
                                    <ListRow
                                        icon={row.icon}
                                        iconColor={row.tint}
                                        title={row.title}
                                        subtitle={row.subtitle}
                                        badge={row.badge}
                                        badgeTone="warning"
                                        onPress={row.onPress}
                                    />
                                </View>
                            ))}
                        </Card>
                    </View>
                ))}

                {isAdmin ? (
                    <View style={styles.menuGroup}>
                        <SectionHeader eyebrow="Admin" title="Operations" />
                        <Card padded={false} variant="subtle">
                            <ListRow
                                icon="shield-half-outline"
                                iconColor={COLORS.warning}
                                title="Admin Dashboard"
                                subtitle="Users, jobs and courses"
                                onPress={() => navigation.navigate('AdminDashboard')}
                            />
                        </Card>
                    </View>
                ) : null}

                {/* Own posts */}
                <View style={styles.menuGroup}>
                    <SectionHeader eyebrow="Feed" title="My updates" />
                    {isPostsLoading ? (
                        <SkeletonCard lines={2} />
                    ) : userPosts.length === 0 ? (
                        <EmptyState
                            icon="create-outline"
                            title="Nothing shared yet"
                            message="Your updates appear here once you post to the Home feed."
                            actionLabel="Go to feed"
                            onAction={() => navigation.navigate('Home')}
                        />
                    ) : (
                        userPosts.map((post) => (
                            <UserPostItem
                                key={post._id}
                                post={post}
                                onUpdate={handleUpdatePost}
                                onDelete={handleDeletePost}
                            />
                        ))
                    )}
                </View>

                <Button
                    title="Log out"
                    variant="ghost"
                    onPress={handleLogout}
                    icon={<Ionicons name="log-out-outline" size={18} color={COLORS.error} />}
                    textStyle={{ color: COLORS.error }}
                    style={styles.logoutBtn}
                />

                <UIText variant="caption" tone="faint" center style={styles.versionText}>
                    Version 1.0.0 (Build 42)
                </UIText>
                <ConfirmModal
                    visible={!!deletePostId}
                    title="Delete Post"
                    message="Are you sure you want to delete this post? This action cannot be undone."
                    confirmText="Delete"
                    isDestructive={true}
                    onConfirm={confirmDeletePost}
                    onCancel={() => setDeletePostId(null)}
                />
            </Screen>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: SPACING.lg,
    },
    avatarContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: withAlpha(COLORS.white, 0.2),
    },
    versionText: {
        marginTop: SPACING.lg,
    },
    userPostCard: {
        padding: 14,
        borderRadius: 16,
        marginBottom: 12,
    },
    userPostHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    userPostBadge: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    userPostActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ownerIconButton: {
        padding: 5,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    editFormContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        padding: 10,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    editTextInput: {
        minHeight: 60,
        color: COLORS.white,
        fontSize: 13,
        textAlignVertical: 'top',
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        marginBottom: 8,
    },
    editLinkInput: {
        color: COLORS.white,
        fontSize: 12,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 10,
    },
    editButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    editCancelBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    editCancelBtnText: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    editSaveBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editSaveBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    userPostContent: {
        color: COLORS.white,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 6,
    },
    userPostLink: {
        color: COLORS.primary,
        fontSize: 12,
        marginBottom: 10,
    },
    userPostStats: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: 8,
    },
    statIconItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIconText: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginLeft: 4,
    },

    headerEmail: {
        marginTop: 4,
    },
    headerBadge: {
        marginTop: SPACING.sm + 4,
        alignSelf: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    statSpacer: {
        marginLeft: SPACING.sm,
    },
    editCta: {
        marginBottom: SPACING.lg,
    },
    menuGroup: {
        marginBottom: SPACING.lg,
    },
    rowDivider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginHorizontal: SPACING.md,
    },
    logoutBtn: {
        marginTop: SPACING.sm,
        borderColor: withAlpha(COLORS.error, 0.4),
    },
});

export default ProfileScreen;
