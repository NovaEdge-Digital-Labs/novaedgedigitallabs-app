import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';

interface User {
    id: string;
    name: string;
    email: string;
    plan: 'free' | 'pro' | 'business';
    planExpiry?: string;
    isActive: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    setError: (error: string | null) => void;
    error: string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

    setError: (error) => set({ error }),

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authApi.login(email, password);
            const { user, token } = data;

            await AsyncStorage.setItem('userToken', token);
            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (err: any) {
            set({
                isLoading: false,
                error: err.response?.data?.message || 'Login failed'
            });
            throw err;
        }
    },

    register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authApi.register(name, email, password);
            const { user, token } = data;

            await AsyncStorage.setItem('userToken', token);
            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (err: any) {
            set({
                isLoading: false,
                error: err.response?.data?.message || 'Registration failed'
            });
            throw err;
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false
            });
        } catch (err) {
            console.error('Logout error:', err);
        }
    },

    loadUser: async () => {
        set({ isLoading: true });
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                set({ isLoading: false, isAuthenticated: false });
                return;
            }

            // Verify session with backend
            const response = await authApi.getMe();
            const userData = response.data; // Extract user from { success: true, data: user }
            set({
                user: userData,
                token,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (err) {
            await AsyncStorage.removeItem('userToken');
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false
            });
        }
    },

    updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
            set({ user: { ...currentUser, ...userData } });
        }
    },
}));
