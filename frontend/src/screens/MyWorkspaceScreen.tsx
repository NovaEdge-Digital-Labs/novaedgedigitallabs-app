import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { getWorkspaceOverview } from '../api/workspaceApi';

const MyWorkspaceScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useAuthStore();
    const [workspaceData, setWorkspaceData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWorkspaceData = async () => {
        try {
            const res = await getWorkspaceOverview();
            if (res.success) {
                setWorkspaceData(res.data);
            }
        } catch (error) {
            console.error('Error fetching workspace data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWorkspaceData();
    }, []);

    return (
        <ThemeWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Workspace</Text>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchWorkspaceData();
                        }}
                        tintColor={COLORS.primary}
                    />
                }
            >
                
                {/* Greeting */}
                <View style={styles.greetingSection}>
                    <Text style={styles.greetingTitle}>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
                    <Text style={styles.greetingSub}>Here is an overview of your active tasks and recommendations.</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading Workspace...</Text>
                    </View>
                ) : (
                    <>
                        {/* Active Projects */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Ongoing Projects</Text>
                            {workspaceData?.activeProjects?.length > 0 ? workspaceData.activeProjects.map((project: any) => (
                                <View key={project.id} style={[styles.card, COLORS.getGlow(COLORS.primary, 10, 0.1), { marginBottom: 15 }]}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardHeaderLeft}>
                                            <Ionicons name="rocket" size={20} color={COLORS.primary} />
                                            <Text style={styles.cardTitle}>{project.title}</Text>
                                        </View>
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusText}>{project.status}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardDesc}>{project.description}</Text>
                                    
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${project.progress}%` }]} />
                                    </View>
                                    <Text style={styles.progressText}>{project.progress}% Completed</Text>
                                </View>
                            )) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>You don't have any active projects yet.</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Services')} style={styles.emptyActionBtn}>
                                        <Text style={styles.emptyActionText}>Explore Services</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Active Tickets */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Support Tickets</Text>
                            {workspaceData?.activeTickets?.length > 0 ? workspaceData.activeTickets.map((ticket: any) => (
                                <TouchableOpacity key={ticket.id} style={[styles.card, COLORS.glass, { marginBottom: 15 }]} activeOpacity={0.8} onPress={() => navigation.navigate('Support', { title: 'Help Center' })}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardHeaderLeft}>
                                            <Ionicons name="ticket" size={20} color={COLORS.warning} />
                                            <Text style={styles.cardTitle}>{ticket.title}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: COLORS.warning + '20', borderColor: COLORS.warning }]}>
                                            <Text style={[styles.statusText, { color: COLORS.warning }]}>{ticket.status}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardDesc}>{ticket.description}</Text>
                                    <Text style={styles.ticketUpdate}>Last updated: {ticket.lastUpdated}</Text>
                                </TouchableOpacity>
                            )) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>You have no open support tickets.</Text>
                                </View>
                            )}
                        </View>

                        {/* Recommendations */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recommended for You</Text>
                            
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                                
                                {workspaceData?.recommendations?.services?.map((service: any) => (
                                    <TouchableOpacity key={service.id} style={[styles.recCard, COLORS.glass]} onPress={() => navigation.navigate('Services')}>
                                        <Ionicons name="trending-up" size={32} color={COLORS.secondary} style={styles.recIcon} />
                                        <Text style={styles.recTitle}>{service.title}</Text>
                                        <Text style={styles.recDesc}>{service.description}</Text>
                                    </TouchableOpacity>
                                ))}

                                {workspaceData?.recommendations?.courses?.map((course: any) => (
                                    <TouchableOpacity key={course.id} style={[styles.recCard, COLORS.glass]} onPress={() => navigation.navigate('Academy')}>
                                        <Ionicons name="school" size={32} color={COLORS.primary} style={styles.recIcon} />
                                        <Text style={styles.recTitle}>{course.title}</Text>
                                        <Text style={styles.recDesc}>{course.description}</Text>
                                    </TouchableOpacity>
                                ))}

                            </ScrollView>
                        </View>
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    backBtn: {
        marginRight: 15,
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    content: {
        padding: 20,
    },
    greetingSection: {
        marginBottom: 30,
    },
    greetingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 5,
    },
    greetingSub: {
        fontSize: 14,
        color: COLORS.textMuted,
        lineHeight: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 15,
    },
    card: {
        ...COLORS.glass,
        padding: 20,
        borderRadius: COLORS.geometry.radiusMedium,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
        marginLeft: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '20',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    cardDesc: {
        fontSize: 14,
        color: COLORS.textMuted,
        lineHeight: 20,
        marginBottom: 15,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: COLORS.backgroundSoft,
        borderRadius: 3,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        textAlign: 'right',
    },
    ticketUpdate: {
        fontSize: 12,
        color: COLORS.textLight,
        fontStyle: 'italic',
    },
    horizontalScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    recCard: {
        width: 220,
        padding: 20,
        borderRadius: 20,
        marginRight: 15,
    },
    recIcon: {
        marginBottom: 15,
    },
    recTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
    },
    recDesc: {
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 18,
    },
    loadingContainer: {
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 15,
        color: COLORS.textMuted,
        fontSize: 14,
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed'
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
    emptyActionBtn: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.primary + '20',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary
    },
    emptyActionText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: 'bold'
    }
});

export default MyWorkspaceScreen;
