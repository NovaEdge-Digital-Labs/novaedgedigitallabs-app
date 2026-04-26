import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import courseApi, { Course } from '../api/courseApi';
import PrimaryButton from '../components/PrimaryButton';

const MyCoursesScreen = () => {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyCourses = async () => {
        try {
            const response = await courseApi.getMyCourses();
            if (response.success) {
                setCourses(response.data);
            }
        } catch (error) {
            console.error('Error fetching my courses:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchMyCourses();
        }
    }, [isFocused]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyCourses();
    };

    const renderCourseItem = ({ item }: { item: Course }) => (
        <TouchableOpacity
            style={styles.courseCard}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}
            activeOpacity={0.9}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.instructorName}>By {item.instructor.name}</Text>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '30%' }]} />
                    </View>
                    <Text style={styles.progressText}>30% Complete</Text>
                </View>
                <PrimaryButton
                    title="Continue"
                    onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}
                    containerStyle={styles.continueBtn}
                    textStyle={styles.continueBtnText}
                />
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
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Learning</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={courses}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="play-circle-outline" size={80} color={COLORS.gray[300]} />
                        <Text style={styles.emptyTitle}>No courses yet</Text>
                        <Text style={styles.emptySubtitle}>Courses you enroll in will appear here.</Text>
                        <PrimaryButton
                            title="Browse Courses"
                            onPress={() => navigation.navigate('CourseFeed')}
                            containerStyle={styles.browseBtn}
                        />
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
        paddingTop: 50,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    listContainer: {
        padding: SPACING.lg,
    },
    courseCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginBottom: SPACING.md,
        padding: SPACING.sm,
        ...SHADOWS.small,
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    courseInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    instructorName: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBar: {
        height: 4,
        backgroundColor: COLORS.gray[100],
        borderRadius: 2,
        width: '100%',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    progressText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    continueBtn: {
        marginTop: 10,
        height: 32,
        borderRadius: 8,
    },
    continueBtnText: {
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    browseBtn: {
        width: '100%',
    }
});

export default MyCoursesScreen;
