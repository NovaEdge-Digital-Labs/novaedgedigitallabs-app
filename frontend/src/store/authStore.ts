import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';

export type Persona = 'client' | 'freelancer' | 'student' | 'jobseeker' | 'employer';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    plan: 'free' | 'pro' | 'business';
    planExpiry?: string;
    isActive: boolean;
    /** Returned by /auth/login and /auth/me; gates the admin surfaces. */
    role?: 'user' | 'admin' | string;
    novaedgeCredits?: number;
    referralCode?: string;
    referralStats?: {
        totalReferrals: number;
        pending: number;
        rewards: number;
    };
    dailyLoginStreak?: number;
    isEmailVerified?: boolean;
    // What the user came here to do — drives Home cards and Profile menu order.
    // Empty array means "not asked yet" → onboarding picker shows.
    personas?: Persona[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<any>;
    register: (name: string, email: string, password: string, referralCode?: string) => Promise<any>;
    setAuth: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    updateProfile: (nameOrData: string | Record<string, any>, avatar?: string) => Promise<any>;
    savePersonas: (personas: Persona[]) => Promise<void>;
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

    setAuth: async (user, token) => {
        await AsyncStorage.setItem('userToken', token);
        set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
        });
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        console.log(`[AuthStore] Attempting login for: ${email}`);
        try {
            const data = await authApi.login(email, password);
            if (data.requiresOtp) {
                set({ isLoading: false });
                return data;
            }
            const { user, token } = data;
            if (token) {
                await AsyncStorage.setItem('userToken', token);
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false
                });
            }
            return data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            console.error(`[AuthStore] Login error: ${errorMessage}`, err);
            set({
                isLoading: false,
                error: errorMessage
            });
            throw err;
        }
    },

    register: async (name, email, password, referralCode) => {
        set({ isLoading: true, error: null });
        console.log(`[AuthStore] Attempting registration for: ${email}`);
        try {
            const data = await authApi.register(name, email, password, referralCode);
            if (data.requiresOtp) {
                set({ isLoading: false });
                return data;
            }
            const { user, token } = data;
            if (token) {
                await AsyncStorage.setItem('userToken', token);
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false
                });
            }
            return data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            console.error(`[AuthStore] Registration error: ${errorMessage}`, err);
            set({
                isLoading: false,
                error: errorMessage
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

            const response = await authApi.getMe();
            const userData = response.data;
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

    updateProfile: async (nameOrData: any, avatar?: string) => {
        set({ isLoading: true, error: null });
        try {
            const payload = typeof nameOrData === 'object' ? nameOrData : { name: nameOrData, avatar };
            const data = await authApi.updateProfile(payload);
            if (data.user) {
                set({ user: data.user, isLoading: false });
            }
            return data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
            set({ isLoading: false, error: errorMessage });
            throw err;
        }
    },

    // Persist the onboarding picker's answer. Applied locally first so the UI
    // re-routes immediately even if the request is slow; a failure is non-fatal
    // because personas only affect presentation.
    savePersonas: async (personas) => {
        const currentUser = get().user;
        if (currentUser) {
            set({ user: { ...currentUser, personas } });
        }
        try {
            await authApi.updateProfile({ personas });
        } catch (err) {
            console.error('Failed to persist personas:', err);
        }
    },
}));
