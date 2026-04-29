import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import ThemeWrapper from '../components/ThemeWrapper';
import { adminApi } from '../api/adminApi';

const AdminUsersScreen = ({ navigation }: any) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const data = await adminApi.getUsers();
            setUsers(data.data);
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
            <TouchableOpacity style={styles.editButton}>
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
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        ...COLORS.glass,
        padding: 15,
        borderRadius: 18,
        marginBottom: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    userEmail: {
        color: COLORS.textMuted,
        fontSize: 14,
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    planBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    planLabel: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});

export default AdminUsersScreen;
