const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

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
            console.warn(`Firebase key not found at: ${keyPath}`);
        }
    }

    if (serviceAccount) {
        const { cert } = require('firebase-admin/app');
        admin.initializeApp({
            credential: cert(serviceAccount)
        });
    }
} catch (error) {
    console.warn('Firebase service account key not found or invalid. Firebase functionality might be limited.', error.message);
}

module.exports = admin;
