const admin = require('firebase-admin');

try {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.warn('Firebase service account key not found or invalid. Firebase functionality might be limited.');
}

module.exports = admin;
