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
    }
};

export default developerApi;
