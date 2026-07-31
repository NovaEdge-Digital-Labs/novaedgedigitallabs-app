import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import postApi, { Post } from '../api/postApi';
import ThemeWrapper from '../components/ThemeWrapper';
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
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: async () => {
                        setUserPosts((prev) => prev.filter((p) => p._id !== postId));
                        const res = await postApi.deletePost(postId);
                        if (!res || !res.success) {
                            Alert.alert('Error', res.message || 'Failed to delete post.');
                            fetchUserPosts(false);
                        }
                    } 
                }
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]
        );
    };

    const MenuItem = ({ icon, title, subtitle, onPress, color = '#a855f7' }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${color}18`, borderColor: `${color}35`, borderWidth: 1 }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>
    );

    return (
        <ThemeWrapper>
            <ScrollView 
                contentContainerStyle={styles.contentContainer} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => {
                            setIsRefreshing(true);
                            fetchUserPosts(false);
                        }}
                        tintColor={COLORS.primary}
                    />
                }
            >
                <View style={styles.header}>
                    <View style={[styles.avatarContainer, COLORS.getGlow(COLORS.primary, 20, 0.4)]}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>

                    <View style={[styles.planBadge, { backgroundColor: user?.plan === 'free' ? COLORS.backgroundSoft : COLORS.primary }]}>
                        <Ionicons name="star" size={12} color="white" style={{ marginRight: 5 }} />
                        <Text style={styles.planText}>{user?.plan?.toUpperCase() || 'FREE'} PLAN</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{userPosts.length}</Text>
                        <Text style={styles.statLabel} numberOfLines={1}>Posts</Text>
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity 
                        style={styles.statBox} 
                        onPress={() => navigation.navigate('Subscription')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.statValue, { color: '#38bdf8' }]}>
                            {user?.plan === 'free' ? 'FREE' : user?.plan === 'pro' ? 'PRO' : 'ACTIVE'}
                        </Text>
                        <Text style={styles.statLabel} numberOfLines={1}>Plan</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: '#c042ff', fontSize: user?.plan === 'free' ? 18 : 22 }]}>
                            {user?.plan === 'business' || user?.plan === 'pro' ? '∞' : '1'}
                        </Text>
                        <Text style={styles.statLabel} numberOfLines={1}>Job Quota</Text>
                    </View>
                </View>

                {/* Services & Tools */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services & Tools</Text>
                    <MenuItem
                        icon="apps-outline"
                        title="Utility Tools"
                        subtitle="Access GST, EMI calculators and more"
                        onPress={() => navigation.navigate('Tools')}
                        color="#a855f7"
                    />
                    <MenuItem
                        icon="cart-outline"
                        title="Digital Store"
                        subtitle="Buy premium assets and products"
                        onPress={() => navigation.navigate('Store')}
                        color="#38bdf8"
                    />
                    <MenuItem
                        icon="business-outline"
                        title="Studio Services"
                        subtitle="Request web/app development and quotes"
                        onPress={() => navigation.navigate('Services')}
                        color="#34d399"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Workspace</Text>
                    <MenuItem
                        icon="briefcase-outline"
                        title="Workspace Overview"
                        subtitle="View your active projects and tickets"
                        onPress={() => navigation.navigate('MyWorkspace')}
                        color="#fbbf24"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <MenuItem
                        icon="person-outline"
                        title="Edit Profile"
                        subtitle="Update your personal details"
                        onPress={() => navigation.navigate('EditProfile')}
                        color="#818cf8"
                    />
                    <MenuItem
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Manage alerts and news"
                        onPress={() => navigation.navigate('Notifications')}
                        color="#f43f5e"
                    />
                    <MenuItem
                        icon="download-outline"
                        title="My Purchases"
                        subtitle="Assets you have bought"
                        onPress={() => navigation.navigate('MyPurchases')}
                        color="#38bdf8"
                    />
                    <MenuItem
                        icon="star-outline"
                        title="Premium Candidate Pass"
                        subtitle="Get verified checkmark & top rank for recruiters"
                        onPress={() => navigation.navigate('PremiumUpgrade')}
                        color="#FFD700"
                    />
                    <MenuItem
                        icon="document-text-outline"
                        title="My Job Applications"
                        subtitle="Track status of your submitted applications"
                        onPress={() => navigation.navigate('MyApplications')}
                        color="#a855f7"
                    />
                    <MenuItem
                        icon="bookmark-outline"
                        title="Saved / Bookmarked Jobs"
                        subtitle="View your saved job listings"
                        onPress={() => navigation.navigate('SavedJobs')}
                        color="#fbbf24"
                    />
                    <MenuItem
                        icon="briefcase-outline"
                        title="My Posted Jobs"
                        subtitle="Edit or delete your posted job listings"
                        onPress={() => navigation.navigate('MyPostedJobs')}
                        color="#ec4899"
                    />
                    <MenuItem
                        icon="people-outline"
                        title="Received Applicants"
                        subtitle="Manage candidate applications for your jobs"
                        onPress={() => navigation.navigate('EmployerApplicants')}
                        color="#38bdf8"
                    />
                    <MenuItem
                        icon="shield-checkmark-outline"
                        title="Privacy & Security"
                        subtitle="Password and data settings"
                        onPress={() => navigation.navigate('PrivacySecurity')}
                        color="#34d399"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Subscription</Text>
                    <MenuItem
                        icon="card-outline"
                        title="Manage Subscription"
                        subtitle="View billing history and plans"
                        onPress={() => navigation.navigate('Subscription')}
                        color="#a855f7"
                    />
                    <MenuItem
                        icon="gift-outline"
                        title="Refer and Earn"
                        subtitle="Invite friends and get Pro free"
                        onPress={() => navigation.navigate('ReferEarn')}
                        color="#fbbf24"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <MenuItem
                        icon="help-circle-outline"
                        title="Help Center"
                        subtitle="FAQs and guides"
                        onPress={() => navigation.navigate('Support', { title: 'Help Center' })}
                        color="#60a5fa"
                    />
                    <MenuItem
                        icon="chatbubble-ellipses-outline"
                        title="Contact Support"
                        subtitle="Talk to our experts"
                        onPress={() => navigation.navigate('Support', { title: 'Contact Support' })}
                        color="#34d399"
                    />
                    <MenuItem
                        icon="book-outline"
                        title="About NovaEdge"
                        onPress={() => navigation.navigate('About')}
                        color="#a855f7"
                    />
                </View>

                {/* Admin Section (Fallback check) */}
                {(user?.email?.includes('admin') || (user as any)?.role === 'admin' || (user as any)?.isAdmin) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Admin</Text>
                        <MenuItem
                            icon="shield-half-outline"
                            title="Admin Dashboard"
                            subtitle="Manage users, jobs, courses"
                            onPress={() => navigation.navigate('AdminDashboard')}
                            color={COLORS.warning || '#ffb800'}
                        />
                    </View>
                )}

                {/* My Shared Updates (Social Feed on Profile) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Updates</Text>
                    {isPostsLoading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
                    ) : userPosts.length === 0 ? (
                        <Text style={styles.emptyPostsText}>You haven't posted anything yet.</Text>
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

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0 (Build 42)</Text>
            </ScrollView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: COLORS.white + '30',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: '900',
        color: 'white',
    },
    userName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 6,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 20,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    planText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 12,
        marginBottom: 30,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    divider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 15,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        padding: 14,
        borderRadius: 16,
        marginBottom: 10,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 18,
        borderRadius: COLORS.geometry.radiusMedium,
        marginTop: 10,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: 12,
        marginBottom: 10,
        opacity: 0.7,
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
    emptyPostsText: {
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 15,
    },
});

export default ProfileScreen;
