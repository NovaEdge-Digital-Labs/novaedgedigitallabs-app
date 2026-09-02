import axiosInstance from './axiosInstance';

export interface ApiUsageStats {
    monthlyCalls: number;
    monthlyLimit: number;
    totalCalls: number;
    toolBreakdown: {
        _id: string; // endpoint
        count: number;
    }[];
}

export interface ApiCallLog {
    _id: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    timestamp: string;
}

const developerApi = {
    getApiKey: async () => {
        const response = await axiosInstance.get('/developer/key');
        return response.data;
    },
    regenerateApiKey: async () => {
        const response = await axiosInstance.post('/developer/key/regenerate');
        return response.data;
    },
    getUsageStats: async () => {
        const response = await axiosInstance.get('/developer/stats');
        return response.data;
    },
    createSubscriptionOrder: async (data: { plan: string, amount: number, quota: number }) => {
        const response = await axiosInstance.post('/developer/subscribe', data);
        return response.data;
    },
    verifyPayment: async (data: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, quotaToAdd: number }) => {
        const response = await axiosInstance.post('/developer/verify-payment', data);
        return response.data;
    }
};

export default developerApi;
