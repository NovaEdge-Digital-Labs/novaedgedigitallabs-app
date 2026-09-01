import axiosInstance from './axiosInstance';

export interface CreateOrderResponse {
    success: boolean;
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
}

/**
 * The backend mounts these under `/api/payment` (singular). This module used to
 * call `/payments/*`, so every subscription payment request 404'd — which is
 * why the upgrade screen had been left faking success locally.
 */
export const paymentApi = {
    createOrder: async (plan: string, billingCycle: string): Promise<CreateOrderResponse> => {
        const response = await axiosInstance.post('/payment/create-order', { plan, billingCycle });
        return response.data;
    },

    /**
     * Only the three Razorpay fields are sent. The plan and billing cycle are
     * resolved server-side from the stored order — passing them from here was
     * how a cheap order could activate an expensive plan.
     */
    verifyPayment: async (payment: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }) => {
        const response = await axiosInstance.post('/payment/verify', payment);
        return response.data;
    },

    getHistory: async () => {
        const response = await axiosInstance.get('/payment/history');
        return response.data;
    },

    cancelSubscription: async () => {
        const response = await axiosInstance.post('/payment/cancel');
        return response.data;
    },
};

export default paymentApi;
