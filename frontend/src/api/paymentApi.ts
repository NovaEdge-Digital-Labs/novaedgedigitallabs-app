import axiosInstance from './axiosInstance';

export const paymentApi = {
    createOrder: async (plan: string, billingCycle: string) => {
        const response = await axiosInstance.post('/payments/create-order', { plan, billingCycle });
        return response.data;
    },

    verifyPayment: async (paymentData: any) => {
        const response = await axiosInstance.post('/payments/verify', paymentData);
        return response.data;
    },

    getSubscriptions: async () => {
        const response = await axiosInstance.get('/payments/subscriptions');
        return response.data;
    },
};
