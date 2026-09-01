import axiosInstance from './axiosInstance';

// NOTE: the server mounts these at /api/payment (singular) — see backend/server.js.
export const paymentApi = {
    createOrder: async (plan: string, billingCycle: string) => {
        const response = await axiosInstance.post('/payment/create-order', { plan, billingCycle });
        return response.data;
    },

    verifyPayment: async (paymentData: any) => {
        const response = await axiosInstance.post('/payment/verify', paymentData);
        return response.data;
    },

    getSubscriptions: async () => {
        const response = await axiosInstance.get('/payment/history');
        return response.data;
    },

    cancelSubscription: async () => {
        const response = await axiosInstance.post('/payment/cancel');
        return response.data;
    },
};
