import axiosInstance from './axiosInstance';

export const notificationApi = {
    /**
     * Send the device FCM push token to the backend so the user can receive
     * push notifications.
     *
     * Must stay PATCH: the route is declared as
     * `router.patch('/fcm-token', ...)` in backend/src/routes/auth.routes.js.
     * This used to send PUT, which Express answered with a 404 for every
     * device, so no token was ever stored and no notification could be
     * delivered. Errors propagate — the caller decides how loud to be.
     */
    updateFCMToken: async (fcmToken: string) => {
        const response = await axiosInstance.patch('/auth/fcm-token', { fcmToken });
        return response.data;
    },
};

export default notificationApi;
