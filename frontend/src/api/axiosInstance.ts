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
            // Clear token and potentially navigate to Login (handled in store/app logic)
            await AsyncStorage.removeItem('userToken');
            // Notify store if needed, but App.tsx will handle the switch based on state
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
