import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

const axiosInstance = axios.create({
    baseURL: CONFIG.API_URL,
    timeout: CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach Bearer token from AsyncStorage
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error fetching token from storage', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: handle 401 Unauthorized
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('userToken');
            try {
                const { useAuthStore } = require('../store/authStore');
                if (useAuthStore?.getState) {
                    useAuthStore.getState().logout();
                }
            } catch (e) {
                console.error('Failed to trigger logout in interceptor:', e);
            }

            if (error.response?.data) {
                const rawMsg = error.response.data.message;
                if (!rawMsg || rawMsg.includes('token') || rawMsg.includes('Not authorized')) {
                    error.response.data.message = 'Session expired. Please log in again.';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
