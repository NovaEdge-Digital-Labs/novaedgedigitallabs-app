import axiosInstance from './axiosInstance';

export const toolsApi = {
    compressImage: async (formData: FormData) => {
        const response = await axiosInstance.post('/tools/compress-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    generateQR: async (text: string) => {
        const response = await axiosInstance.post('/tools/generate-qr', { text });
        return response.data;
    },

    calculateGST: async (amount: number, gstRate: number) => {
        const response = await axiosInstance.post('/tools/calculate-gst', { amount, gstRate });
        return response.data;
    },

    calculateEMI: async (principal: number, annualRate: number, tenureMonths: number) => {
        const response = await axiosInstance.post('/tools/calculate-emi', { principal, annualRate, tenureMonths });
        return response.data;
    },

    generateInvoice: async (data: any) => {
        const response = await axiosInstance.post('/tools/generate-invoice', data);
        return response.data;
    },

    getUsageStats: async () => {
        const response = await axiosInstance.get('/tools/usage-stats');
        return response.data;
    },
};
