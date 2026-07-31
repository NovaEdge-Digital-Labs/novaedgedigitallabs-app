import axiosInstance from './axiosInstance';

export const authApi = {
    login: async (email: string, password: string) => {
        const response = await axiosInstance.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (name: string, email: string, password: string, referralCode?: string) => {
        const response = await axiosInstance.post('/auth/register', { name, email, password, referralCode });
        return response.data;
    },

    verifyOtp: async (email: string, otp: string) => {
        const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    resendOtp: async (email: string) => {
        const response = await axiosInstance.post('/auth/resend-otp', { email });
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await axiosInstance.post('/auth/forgot-password', { email });
        return response.data;
    },

    getMe: async () => {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    },

    updateFCMToken: async (fcmToken: string) => {
        const response = await axiosInstance.patch('/auth/fcm-token', { fcmToken });
        return response.data;
    },
};
