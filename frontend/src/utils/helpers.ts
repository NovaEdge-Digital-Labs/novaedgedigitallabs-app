export const formatDate = (date: Date) => {
    return date.toLocaleDateString();
};

export const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
    return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

import { CONFIG } from '../constants/config';

export const getImageUrl = (url: string | undefined | null) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = CONFIG.BASE_URL.endsWith('/') ? CONFIG.BASE_URL.slice(0, -1) : CONFIG.BASE_URL;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
};
