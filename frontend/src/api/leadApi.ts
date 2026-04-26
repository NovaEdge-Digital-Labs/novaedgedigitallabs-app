import axiosInstance from './axiosInstance';

export const submitLead = async (leadData: any) => {
    try {
        const response = await axiosInstance.post('/leads/submit', leadData);
        return response.data;
    } catch (error: any) {
        throw error.response?.data?.message || 'Failed to submit lead';
    }
};

export const getQuote = async (quoteData: any) => {
    try {
        const response = await axiosInstance.post('/leads/get-quote', quoteData);
        return response.data;
    } catch (error: any) {
        throw error.response?.data?.message || 'Failed to get quote';
    }
};
