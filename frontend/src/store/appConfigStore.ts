import { create } from 'zustand';
import axios from 'axios';
import { CONFIG } from '../constants/config';

const API_URL = CONFIG.API_URL;

export interface AppConfig {
    isMaintenanceMode: boolean;
    minimumAppVersion: string;
    supportEmail: string;
    websiteUrl: string;
    appDownloadLink: string;
    socialLinks: {
        github: string;
        linkedin: string;
        instagram: string;
        portfolio: string;
    };
    defaultImage: string;
    defaultBlogImage: string;
    referralMessage: string;
}

export interface PlatformStats {
    projectsDelivered: number;
    verifiedFreelancers: number;
    totalCourses: number;
    escrowSecuredAmount: number;
}

interface AppConfigState {
    config: AppConfig | null;
    stats: PlatformStats | null;
    isLoading: boolean;
    error: string | null;
    fetchConfig: () => Promise<void>;
    fetchStats: () => Promise<void>;
}

export const useAppConfigStore = create<AppConfigState>((set) => ({
    config: null,
    stats: null,
    isLoading: false,
    error: null,
    fetchConfig: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/config`);
            if (response.data && response.data.success) {
                set({ config: response.data.data, isLoading: false });
            } else {
                throw new Error('Failed to fetch config');
            }
        } catch (error: any) {
            console.error('Error fetching app config:', error.message);
            // Fallback to default values if API fails
            set({
                config: {
                    isMaintenanceMode: false,
                    minimumAppVersion: '1.0.0',
                    supportEmail: 'support@novaedgedigitallabs.tech',
                    websiteUrl: 'https://novaedgedigitallabs.tech',
                    appDownloadLink: 'https://play.google.com/store/apps/details?id=in.novaedgedigitallabs.tech',
                    socialLinks: {
                        github: 'https://github.com/novaedge',
                        linkedin: 'https://linkedin.com/company/novaedge',
                        instagram: 'https://instagram.com/novaedge',
                        portfolio: 'https://novaedgedigitallabs.tech'
                    },
                    defaultImage: 'https://novaedgedigitallabs.tech/logo.png',
                    defaultBlogImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
                    referralMessage: 'Join NovaEdge Digital Labs and get premium tools for FREE! Use my referral code: {CODE}\n\nDownload now: {LINK}'
                },
                isLoading: false,
                error: error.message
            });
        }
    },
    fetchStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/config/stats`);
            if (response.data && response.data.success) {
                set({ stats: response.data.data });
            }
        } catch (error: any) {
            console.error('Error fetching platform stats:', error.message);
            set({
                stats: {
                    projectsDelivered: 48,
                    verifiedFreelancers: 120,
                    totalCourses: 15,
                    escrowSecuredAmount: 250000
                }
            });
        }
    }
}));
