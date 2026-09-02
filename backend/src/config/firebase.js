const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

try {
    const keyPath = path.isAbsolute(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        ? process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        : path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    if (fs.existsSync(keyPath)) {
        const { cert } = require('firebase-admin/app');
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        admin.initializeApp({
            credential: cert(serviceAccount)
        });
    } else {
        console.warn(`Firebase key not found at: ${keyPath}`);
    }
} catch (error) {
    console.warn('Firebase service account key not found or invalid. Firebase functionality might be limited.', error.message);
}

module.exports = admin;
