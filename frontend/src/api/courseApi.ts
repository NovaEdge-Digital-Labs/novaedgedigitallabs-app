import axiosInstance from './axiosInstance';

export interface Lecture {
    _id: string;
    title: string;
    duration: string;
    videoUrl: string | null;
    freePreview: boolean;
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    instructor: {
        name: string;
        bio?: string;
        avatar?: string;
    };
    price: number;
    originalPrice?: number;
    category: string;
    thumbnail: string;
    previewVideoUrl?: string;
    lectures: Lecture[];
    totalDuration: string;
    enrolledCount: number;
    rating: number;
    tags: string[];
    isEnrolled?: boolean;
}

const courseApi = {
    getAllCourses: async () => {
        const response = await axiosInstance.get('/courses');
        return response.data;
    },

    getCourseById: async (id: string) => {
        const response = await axiosInstance.get(`/courses/${id}`);
        return response.data;
    },

    getMyCourses: async () => {
        const response = await axiosInstance.get('/courses/my-courses');
        return response.data;
    },

    enrollInCourse: async (courseId: string) => {
        const response = await axiosInstance.post('/courses/enroll', { courseId });
        return response.data;
    },

    verifyPayment: async (paymentData: any) => {
        const response = await axiosInstance.post('/courses/verify-payment', paymentData);
        return response.data;
    }
};

export default courseApi;
