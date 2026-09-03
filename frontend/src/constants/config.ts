import { Platform } from 'react-native';

// Use localhost for web, and your local IP for mobile devices (Expo Go)
const DEV_BASE_URL = Platform.OS === 'web' ? 'http://localhost:5000' : 'http://192.168.29.100:5000';
const PROD_BASE_URL = 'https://app.novaedgedigitallabs.in';

export const CONFIG = {
    API_URL: __DEV__ ? `${DEV_BASE_URL}/api` : `${PROD_BASE_URL}/api`,
    BASE_URL: __DEV__ ? DEV_BASE_URL : PROD_BASE_URL,
    // The API runs on serverless functions: a cold start measured ~9s before the
    // handler even runs. 15s left almost no headroom on mobile data, so requests
    // aborted and screens rendered empty state as if the data were genuinely 0.
    TIMEOUT: 30000,
};
