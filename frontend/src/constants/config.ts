const DEV_BASE_URL = 'http://192.168.29.100:5000';
const PROD_BASE_URL = 'https://app.novaedgedigitallabs.in';

export const CONFIG = {
    API_URL: __DEV__ ? `${DEV_BASE_URL}/api` : `${PROD_BASE_URL}/api`,
    BASE_URL: __DEV__ ? DEV_BASE_URL : PROD_BASE_URL,
    TIMEOUT: 15000,
};
