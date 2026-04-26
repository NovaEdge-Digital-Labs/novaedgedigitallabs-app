import axios from 'axios';
import { CONFIG } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = CONFIG.API_URL;

const getAuthToken = async () => {
    return await AsyncStorage.getItem('token');
};

export const storeApi = {
    getProducts: async (params: { category?: string; search?: string } = {}) => {
        const response = await axios.get(`${API_URL}/store`, { params });
        return response.data;
    },

    getProductDetails: async (id: string) => {
        const token = await getAuthToken();
        const response = await axios.get(`${API_URL}/store/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    },

    createOrder: async (productId: string) => {
        const token = await getAuthToken();
        const response = await axios.post(`${API_URL}/store/purchase`, { productId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    verifyPayment: async (data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string
    }) => {
        const token = await getAuthToken();
        const response = await axios.post(`${API_URL}/store/verify`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getMyPurchases: async () => {
        const token = await getAuthToken();
        const response = await axios.get(`${API_URL}/store/my-purchases`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getDownloadUrl: (productId: string) => {
        return `${API_URL}/store/${productId}/download`;
    },

    submitReview: async (productId: string, data: { rating: number; comment: string }) => {
        const token = await getAuthToken();
        const response = await axios.post(`${API_URL}/store/${productId}/review`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
