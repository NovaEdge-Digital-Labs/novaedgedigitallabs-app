import axiosInstance from './axiosInstance';

export const notificationApi = {
    /**
     * Send the Expo/FCM Push Token to the backend so the user can receive push notifications.
     */
    updateFCMToken: async (fcmToken: string) => {
        try {
            // The backend endpoint is PUT /api/auth/fcm-token
            const response = await axiosInstance.put('/auth/fcm-token', { fcmToken });
            return response.data;
        } catch (error: any) {
            console.error('Error updating FCM token:', error?.response?.data || error.message);
            return { success: false, message: error?.response?.data?.message || 'Failed to update FCM token' };
        }
    },
};

export default notificationApi;
