import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Modal, Platform, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import ThemeWrapper from '../components/ThemeWrapper';
import { adminApi } from '../api/adminApi';

const AdminUsersScreen = ({ navigation }: any) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editRole, setEditRole] = useState<string>('user');
    const [editPlan, setEditPlan] = useState<string>('free');
    const [editDuration, setEditDuration] = useState<string>('1 Month');
    const [isSaving, setIsSaving] = useState(false);

    const fetchUsers = async () => {
        try {
            const data = await adminApi.getUsers();
            setUsers(data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Error', 'Could not fetch users list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        setEditRole(user.role || 'user');
        setEditPlan(user.plan || 'free');
        setEditDuration('1 Month'); // default
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;
        setIsSaving(true);
        try {
            let planExpiry = null;
            if (editPlan !== 'free') {
                const now = new Date();
                if (editDuration === '1 Month') now.setMonth(now.getMonth() + 1);
                else if (editDuration === '6 Months') now.setMonth(now.getMonth() + 6);
                else if (editDuration === '1 Year') now.setFullYear(now.getFullYear() + 1);
                else if (editDuration === 'Lifetime') now.setFullYear(now.getFullYear() + 100);
                planExpiry = now;
            }

            await adminApi.updateUser(selectedUser._id, { 
                role: editRole, 
                plan: editPlan,
                planExpiry 
            });
            Alert.alert('Success', 'User updated successfully');
            setSelectedUser(null);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Error updating user:', error);
            Alert.alert('Error', 'Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    const UserItem = ({ user }: any) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.badgeRow}>
                    <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? COLORS.primary + '30' : COLORS.backgroundSoft }]}>
                        <Text style={[styles.roleText, { color: user.role === 'admin' ? COLORS.primary : COLORS.textMuted }]}>
                            {user.role?.toUpperCase() || 'USER'}
                        </Text>
                    </View>
                    <View style={[styles.planBadge, { backgroundColor: user.plan === 'free' ? COLORS.backgroundSoft : COLORS.accent + '30' }]}>
                        <Text style={[styles.planLabel, { color: user.plan === 'free' ? COLORS.textMuted : COLORS.accent }]}>
                            {user.plan?.toUpperCase() || 'FREE'}
                        </Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => handleEditClick(user)}>
                <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <ThemeWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>User Management</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => <UserItem user={item} />}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No users found</Text>
                        }
                    />
                )}
            </View>

            {/* Edit User Modal */}
            <Modal visible={!!selectedUser} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit User</Text>
                            <TouchableOpacity onPress={() => setSelectedUser(null)}>
                                <Ionicons name="close" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalSubtitle}>{selectedUser?.name}</Text>
                            <Text style={styles.modalEmail}>{selectedUser?.email}</Text>

                            <Text style={styles.label}>Role</Text>
                            <View style={styles.toggleRow}>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, editRole === 'user' && styles.toggleActive]}
                                    onPress={() => setEditRole('user')}
                                >
                                    <Text style={styles.toggleText}>USER</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, editRole === 'admin' && styles.toggleActive]}
                                    onPress={() => setEditRole('admin')}
                                >
                                    <Text style={styles.toggleText}>ADMIN</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Plan</Text>
                            <View style={styles.toggleRow}>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, editPlan === 'free' && styles.toggleActive]}
                                    onPress={() => setEditPlan('free')}
                                >
                                    <Text style={styles.toggleText}>FREE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, editPlan === 'pro' && styles.toggleActive]}
                                    onPress={() => setEditPlan('pro')}
                                >
                                    <Text style={styles.toggleText}>PRO</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, editPlan === 'business' && styles.toggleActive]}
                                    onPress={() => setEditPlan('business')}
                                >
                                    <Text style={styles.toggleText}>BUSINESS</Text>
                                </TouchableOpacity>
                            </View>

                            {editPlan !== 'free' && (
                                <>
                                    <Text style={styles.label}>Duration</Text>
                                    <View style={styles.toggleGrid}>
                                        {['1 Month', '6 Months', '1 Year', 'Lifetime'].map((dur) => (
                                            <TouchableOpacity 
                                                key={dur}
                                                style={[styles.toggleBtn, styles.toggleGridItem, editDuration === dur && styles.toggleActive]}
                                                onPress={() => setEditDuration(dur)}
                                            >
                                                <Text style={styles.toggleText}>{dur}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}

                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUser} disabled={isSaving}>
                                {isSaving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20 },
    userCard: { flexDirection: 'row', alignItems: 'center', ...COLORS.glass, padding: 15, borderRadius: 18, marginBottom: 12 },
    userInfo: { flex: 1 },
    userName: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    userEmail: { color: COLORS.textMuted, fontSize: 14, marginBottom: 8 },
    badgeRow: { flexDirection: 'row', gap: 8 },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    roleText: { fontSize: 10, fontWeight: 'bold' },
    planBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    planLabel: { fontSize: 10, fontWeight: 'bold' },
    editButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 50, fontSize: 16 },
    
    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.secondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    modalTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
    modalSubtitle: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    modalEmail: { color: COLORS.textMuted, fontSize: 14, marginBottom: 20 },
    label: { color: COLORS.textMuted, fontSize: 12, textTransform: 'uppercase', marginBottom: 10, marginTop: 10 },
    toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    toggleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
    toggleGridItem: { width: '47%' },
    toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: COLORS.backgroundSoft, borderWidth: 1, borderColor: 'transparent' },
    toggleActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
    toggleText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
    saveBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: Platform.OS === 'ios' ? 20 : 0 },
    saveBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});

export default AdminUsersScreen;
