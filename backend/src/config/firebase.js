const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;
let initError = null;

try {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim().startsWith('{')) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const keyPath = path.isAbsolute(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            ? process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            : path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

        if (fs.existsSync(keyPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        } else {
            initError = `Firebase key not found at: ${keyPath}`;
            console.warn(initError);
        }
    } else {
        initError = 'FIREBASE_SERVICE_ACCOUNT_KEY is not set';
        console.warn(`Firebase disabled: ${initError}`);
    }

    if (serviceAccount) {
        const { cert } = require('firebase-admin/app');
        admin.initializeApp({
            credential: cert(serviceAccount)
        });
        initialized = true;
    }
} catch (error) {
    initError = error.message;
    console.warn('Firebase service account key not found or invalid. Firebase functionality might be limited.', error.message);
}

/**
 * Whether a Firebase app was actually initialised.
 *
 * Do not probe this with `admin.messaging` — that property exists on the SDK
 * whether or not `initializeApp` ran, so truthiness checks on it pass even with
 * no credentials and then blow up with "the default Firebase app does not
 * exist" at call time.
 */
const isFirebaseReady = () => initialized && admin.apps.length > 0;

const firebaseInitError = () => initError;

module.exports = { admin, isFirebaseReady, firebaseInitError };
