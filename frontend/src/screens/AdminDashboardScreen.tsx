import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import ThemeWrapper from '../components/ThemeWrapper';
import { adminApi } from '../api/adminApi';
import { formatCurrency } from '../utils/helpers';

const AdminDashboardScreen = ({ navigation }: any) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await adminApi.getStats();
            setStats(data.data);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const StatCard = ({ icon, label, value, color }: any) => (
        <View style={[styles.statCard, COLORS.getGlow(color, 15, 0.15)]}>
            <View style={[styles.statIconBox, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <ThemeWrapper>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </ThemeWrapper>
        );
    }

    return (
        <ThemeWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Admin Dashboard</Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.headerButton}>
                        <Ionicons name="refresh" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                >
                    <View style={styles.statsGrid}>
                        <StatCard icon="people" label="Total Users" value={stats?.totalUsers || 0} color={COLORS.primary} />
                        <StatCard icon="star" label="Pro Users" value={stats?.proUsers || 0} color={COLORS.accent} />
                        <StatCard icon="cash" label="Revenue" value={formatCurrency(stats?.totalRevenue || 0)} color="#10b981" />
                        <StatCard icon="briefcase" label="Active Jobs" value={stats?.activeJobs || 0} color="#f59e0b" />
                    </View>

                    <TouchableOpacity
                        style={styles.actionCard}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('AdminUsers')}
                    >
                        <View style={styles.actionIconBox}>
                            <Ionicons name="people-outline" size={24} color={COLORS.white} />
                        </View>
                        <View style={styles.actionText}>
                            <Text style={styles.actionTitle}>User Management</Text>
                            <Text style={styles.actionSub}>View and edit user permissions</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>System Health</Text>
                        <View style={styles.healthCard}>
                            <View style={styles.healthItem}>
                                <Text style={styles.healthLabel}>Database</Text>
                                <View style={[styles.statusIndicator, { backgroundColor: '#10b981' }]} />
                            </View>
                            <View style={styles.healthItem}>
                                <Text style={styles.healthLabel}>Server</Text>
                                <View style={[styles.statusIndicator, { backgroundColor: '#10b981' }]} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
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
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 30,
    },
    statCard: {
        width: '47.5%',
        ...COLORS.glass,
        padding: 15,
        borderRadius: 20,
        gap: 10,
    },
    statIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    statValue: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        ...COLORS.glass,
        padding: 20,
        borderRadius: 24,
        marginBottom: 30,
    },
    actionIconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionText: {
        flex: 1,
    },
    actionTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionSub: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 15,
    },
    healthCard: {
        ...COLORS.glass,
        padding: 20,
        borderRadius: 20,
        gap: 15,
    },
    healthItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    healthLabel: {
        color: COLORS.text,
        fontSize: 14,
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});

export default AdminDashboardScreen;
