import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Image,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, withAlpha } from '../constants/colors';
import ThemeWrapper from '../components/ThemeWrapper';
import { Text, Card, Badge, Button, EmptyState, SkeletonCard, TopBar } from '../components/ui';
import courseApi, { Course } from '../api/courseApi';
import { formatCurrency } from '../utils/helpers';

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

    const renderCourseItem = ({ item }: { item: Course }) => {
        const avatar =
            item.instructor.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.instructor.name)}&background=ac4bff&color=fff`;
        const discounted = item.originalPrice && item.originalPrice > item.price;

        return (
            <Card
                padded={false}
                onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}
                style={styles.courseCard}
            >
                <View>
                    <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                    {item.category ? (
                        <Badge label={item.category} tone="primary" style={styles.badge} />
                    ) : null}
                </View>

                <View style={styles.courseInfo}>
                    <Text variant="bodyStrong" numberOfLines={2}>{item.title}</Text>

                    <View style={styles.instructorRow}>
                        <View style={styles.instructorProfile}>
                            <Image source={{ uri: avatar }} style={styles.instructorAvatarSmall} />
                            <Text variant="caption" tone="muted" numberOfLines={1} style={styles.instructorName}>
                                {item.instructor.name}
                            </Text>
                        </View>
                        {item.rating ? (
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={13} color="#fcbb00" />
                                <Text variant="caption" tone="muted" style={styles.ratingText}>
                                    {item.rating}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.footerRow}>
                        <View style={styles.priceContainer}>
                            <Text variant="bodyStrong" tone="success">{formatCurrency(item.price)}</Text>
                            {discounted ? (
                                <Text variant="caption" tone="faint" style={styles.originalPrice}>
                                    {formatCurrency(item.originalPrice as number)}
                                </Text>
                            ) : null}
                        </View>
                        <Text variant="caption" tone="muted">
                            {item.enrolledCount || 0} enrolled
                        </Text>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <ThemeWrapper>
            <TopBar
                large
                title="Academy"
                subtitle="Upskill with short, focused courses"
                showBack={false}
                right={
                    <Button
                        title="My courses"
                        size="sm"
                        variant="secondary"
                        fullWidth={false}
                        icon={<Ionicons name="play-circle-outline" size={16} color={COLORS.text} />}
                        onPress={() => navigation.navigate('MyCourses')}
                    />
                }
            />

            {loading && !refreshing ? (
                <View style={styles.listContainer}>
                    <SkeletonCard lines={3} />
                    <SkeletonCard lines={3} />
                    <SkeletonCard lines={3} />
                </View>
            ) : (
                <FlatList
                    data={courses}
                    renderItem={renderCourseItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            icon="school-outline"
                            title="No courses yet"
                            message="New tutorials land here as the team publishes them."
                        />
                    }
                />
            )}
        </ThemeWrapper>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.xxl * 2,
    },
    courseCard: {
        marginBottom: SPACING.sm + 4,
    },
    thumbnail: {
        width: '100%',
        height: 168,
        backgroundColor: withAlpha(COLORS.white, 0.05),
    },
    badge: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
    },
    courseInfo: {
        padding: SPACING.md,
    },
    instructorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.sm,
    },
    instructorProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: SPACING.sm,
    },
    instructorAvatarSmall: {
        width: 22,
        height: 22,
        borderRadius: RADIUS.pill,
        marginRight: SPACING.sm,
    },
    instructorName: {
        flex: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 4,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
        paddingTop: SPACING.sm + 2,
        borderTopWidth: 1,
        borderTopColor: COLORS.divider,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    originalPrice: {
        marginLeft: 6,
        textDecorationLine: 'line-through',
    },
});

export default CourseFeedScreen;
