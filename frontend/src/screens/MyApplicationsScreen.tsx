import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { marketplaceApi } from '../api/marketplaceApi';

const MyApplicationsScreen = ({ navigation }: any) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchApplications = async () => {
        try {
            const response = await marketplaceApi.getMyJobApplications();
            setApplications(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'shortlisted': return '#4ADE80';
            case 'rejected': return '#F87171';
            case 'reviewed': return '#60A5FA';
            default: return COLORS.textMuted;
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.jobTitle}>{item.jobId?.title || 'Unknown Role'}</Text>
                    <Text style={styles.companyName}>{item.jobId?.companyId?.name || 'Unknown Company'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.footer}>
                <Text style={styles.date}>Applied on {new Date(item.createdAt).toLocaleDateString()}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('JobDetail', { jobId: item.jobId?._id })}>
                    <Text style={styles.viewJob}>View Position</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Applications</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={applications}
                    keyExtractor={(item: any) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchApplications} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="document-text-outline" size={60} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>You haven't applied to any jobs yet.</Text>
                            <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('JobFeed')}>
                                <Text style={styles.browseText}>Browse Jobs</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    list: {
        padding: 20,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    jobTitle: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    companyName: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 12,
    },
    date: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    viewJob: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    empty: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: COLORS.textMuted,
        marginTop: 15,
        fontSize: 16,
    },
    browseButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 20,
    },
    browseText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});

export default MyApplicationsScreen;
