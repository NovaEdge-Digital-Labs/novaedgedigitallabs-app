import axiosInstance from './axiosInstance';

export interface AffiliateLink {
    _id: string;
    name: string;
    logo: string;
    description: string;
    rating: number;
    trackingUrl: string;
    category: string;
    isActive: boolean;
}

export const getAffiliateLinks = async (): Promise<AffiliateLink[]> => {
    try {
        const response = await axiosInstance.get('/affiliate/links');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching affiliate links:', error);
        return [];
    }
};

export const trackAffiliateClick = async (linkId: string, platform: 'ios' | 'android' | 'web'): Promise<void> => {
    try {
        await axiosInstance.post('/affiliate/track', { linkId, platform });
    } catch (error) {
        console.error('Error tracking affiliate click:', error);
    }
};

const affiliateApi = {
    getAffiliateLinks,
    trackAffiliateClick
};

export default affiliateApi;
