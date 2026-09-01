import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../constants/colors';
import courseApi, { Course } from '../api/courseApi';
import { formatCurrency } from '../utils/helpers';
import PrimaryButton from '../components/PrimaryButton';

const { width } = Dimensions.get('window');

const CourseFeedScreen = () => {
    const navigation = useNavigation<any>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCourses = async () => {
        try {
            const response = await courseApi.getAllCourses();
            if (response.success) {
                setCourses(response.data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCourses();
    };

    const [filter, setFilter] = useState<'All' | 'Free' | 'Paid'>('All');

    const filteredCourses = courses.filter((course) => {
        if (filter === 'Free') return course.price === 0;
        if (filter === 'Paid') return course.price > 0;
        return true;
    });

    const renderCourseItem = ({ item }: { item: Course }) => (
        <TouchableOpacity
            style={styles.courseCard}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}
            activeOpacity={0.9}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.badgeRow}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.category}</Text>
                </View>
                {item.price === 0 ? (
                    <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>FREE</Text>
                    </View>
                ) : (
                    <View style={styles.certBadge}>
                        <Ionicons name="ribbon" size={10} color="#FFF" style={{ marginRight: 3 }} />
                        <Text style={styles.certBadgeText}>Certificate</Text>
                    </View>
                )}
            </View>
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.instructorRow}>
                    <View style={styles.instructorProfile}>
                        <Image 
                            source={{ uri: item.instructor.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.instructor.name) + '&background=random&color=fff' }} 
                            style={styles.instructorAvatarSmall} 
                        />
                        <Text style={styles.instructorName}>By {item.instructor.name}</Text>
                    </View>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                </View>
                <View style={styles.footerRow}>
                    <View style={styles.priceContainer}>
                        {item.price === 0 ? (
                            <Text style={[styles.price, { color: COLORS.success || '#00FF9D' }]}>Free</Text>
                        ) : (
                            <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                        )}
                        {item.originalPrice && item.originalPrice > item.price && item.price > 0 && (
                            <Text style={styles.originalPrice}>{formatCurrency(item.originalPrice)}</Text>
                        )}
                    </View>
                    <Text style={styles.enrolledText}>{item.enrolledCount} enrolled</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Explore Courses</Text>
                    <Text style={styles.headerSubtitle}>Job-ready skills — real projects ke saath</Text>
                </View>
                <TouchableOpacity
                    style={styles.myCoursesBtn}
                    onPress={() => navigation.navigate('MyCourses')}
                >
                    <Ionicons name="play-circle-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
                {(['All', 'Free', 'Paid'] as const).map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.filterChip, filter === type && styles.activeFilterChip]}
                        onPress={() => setFilter(type)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.filterText, filter === type && styles.activeFilterText]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredCourses}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="school-outline" size={64} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>No courses found for "{filter}".</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    myCoursesBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.backgroundSoft,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    listContainer: {
        padding: SPACING.lg,
    },
    courseCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        marginBottom: SPACING.lg,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    thumbnail: {
        width: '100%',
        height: 180,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        gap: 10,
        marginBottom: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.backgroundSoft,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activeFilterChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    activeFilterText: {
        color: '#FFF',
    },
    badgeRow: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    freeBadge: {
        backgroundColor: COLORS.success || '#00FF9D',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    freeBadgeText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: '900',
    },
    certBadge: {
        backgroundColor: 'rgba(145, 39, 255, 0.85)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    certBadgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    courseInfo: {
        padding: SPACING.md,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    instructorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructorProfile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    instructorAvatarSmall: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 8,
    },
    instructorName: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 4,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
    },
    originalPrice: {
        fontSize: 14,
        color: COLORS.textMuted,
        textDecorationLine: 'line-through',
        marginLeft: 8,
    },
    enrolledText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
});

export default CourseFeedScreen;
