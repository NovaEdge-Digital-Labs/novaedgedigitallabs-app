import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../constants/colors';
import courseApi, { Course, Lecture } from '../api/courseApi';
import PrimaryButton from '../components/PrimaryButton';


const { width } = Dimensions.get('window');

const CourseDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { courseId } = route.params;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    const fetchCourseDetails = async () => {
        try {
            const response = await courseApi.getCourseById(courseId);
            if (response.success) {
                setCourse(response.data);
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
            Alert.alert('Error', 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            const response = await courseApi.enrollInCourse(courseId);
            if (response.success) {
                // Mocking Razorpay payment verification
                // In a real app, you'd open the Razorpay checkout here
                const verifyResponse = await courseApi.verifyPayment({
                    razorpay_order_id: response.data.id,
                    razorpay_payment_id: 'pay_mock_' + Date.now(),
                    razorpay_signature: 'signature_mock'
                });

                if (verifyResponse.success) {
                    Alert.alert('Success', 'You have successfully enrolled in this course!');
                    fetchCourseDetails(); // Refresh to show lectures
                }
            }
        } catch (error: any) {
            console.error('Enrollment error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    const handlePlayLecture = (lecture: Lecture) => {
        if (!lecture.videoUrl && !lecture.freePreview && !course?.isEnrolled) {
            Alert.alert('Locked', 'Please enroll in the course to watch this lecture.');
            return;
        }
        navigation.navigate('LecturePlayer', {
            courseId: course?._id,
            lectureId: lecture._id,
            videoUrl: lecture.videoUrl || course?.previewVideoUrl
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!course) return null;

    return (
        <LinearGradient
            colors={[COLORS.secondary, COLORS.background]}
            style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.videoContainer}>
                    <Image source={{ uri: course.thumbnail }} style={styles.heroImage} />
                    <TouchableOpacity style={styles.playPreviewBtn}>
                        <Ionicons name="play" size={40} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.category}>{course.category}</Text>
                    <Text style={styles.title}>{course.title}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.metaText}>{course.rating} (1.2k reviews)</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                            <Text style={styles.metaText}>{course.totalDuration}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>About this course</Text>
                    <Text style={styles.description}>{course.description}</Text>

                    <View style={styles.instructorCard}>
                        <Image source={{ uri: course.instructor.avatar }} style={styles.instructorAvatar} />
                        <View style={styles.instructorInfo}>
                            <Text style={styles.instructorLabel}>Instructor</Text>
                            <Text style={styles.instructorName}>{course.instructor.name}</Text>
                            <Text style={styles.instructorBio} numberOfLines={2}>{course.instructor.bio}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Course Content</Text>
                    {course.lectures.map((lecture, index) => (
                        <TouchableOpacity
                            key={lecture._id}
                            style={styles.lectureItem}
                            onPress={() => handlePlayLecture(lecture)}
                        >
                            <View style={styles.lectureIndexContainer}>
                                <Text style={styles.lectureIndex}>{index + 1}</Text>
                            </View>
                            <View style={styles.lectureDetails}>
                                <Text style={styles.lectureTitle}>{lecture.title}</Text>
                                <Text style={styles.lectureDuration}>{lecture.duration}</Text>
                            </View>
                            <View style={styles.lectureAction}>
                                {lecture.freePreview || course.isEnrolled ? (
                                    <Ionicons name="play-circle" size={24} color={COLORS.primary} />
                                ) : (
                                    <Ionicons name="lock-closed" size={24} color={COLORS.textMuted} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {!course.isEnrolled ? (
                    <View style={styles.footerContent}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceLabel}>Price</Text>
                            <Text style={styles.price}>₹{course.price}</Text>
                        </View>
                        <PrimaryButton
                            title="Enroll Now"
                            onPress={handleEnroll}
                            loading={enrolling}
                            containerStyle={styles.enrollBtn}
                        />
                    </View>
                ) : (
                    <PrimaryButton
                        title="Resume Learning"
                        onPress={() => handlePlayLecture(course.lectures[0])}
                        containerStyle={styles.fullWidthBtn}
                    />
                )}
            </View>
        </LinearGradient>
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
    scrollContent: {
        flexGrow: 1,
    },
    videoContainer: {
        width: '100%',
        height: 220,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    playPreviewBtn: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: SPACING.lg,
    },
    category: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    metaText: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginLeft: 6,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 24,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: COLORS.textMuted,
    },
    instructorCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: SPACING.md,
        marginTop: 24,
        ...SHADOWS.small,
    },
    instructorAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    instructorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    instructorLabel: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 2,
    },
    instructorName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    instructorBio: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    lectureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: SPACING.md,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(145, 39, 255, 0.1)',
    },
    lectureIndexContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(145, 39, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lectureIndex: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    lectureDetails: {
        flex: 1,
        marginLeft: 12,
    },
    lectureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    lectureDuration: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    lectureAction: {
        padding: 5,
    },
    footer: {
        backgroundColor: 'rgba(6, 0, 15, 0.95)',
        padding: SPACING.lg,
        paddingBottom: SPACING.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        ...SHADOWS.large,
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    price: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
    },
    enrollBtn: {
        flex: 1.5,
    },
    fullWidthBtn: {
        width: '100%',
    }
});

export default CourseDetailScreen;
