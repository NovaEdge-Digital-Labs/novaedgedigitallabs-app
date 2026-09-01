const express = require('express');
const router = express.Router();
const { login, register, verifyOtp, resendOtp, getMe, updateFCMToken, deleteAccount, forgotPassword, resetPassword, updateProfile, toggle2FA, updateNotificationPrefs } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.patch('/fcm-token', protect, updateFCMToken);
router.post('/toggle-2fa', protect, toggle2FA);
router.put('/notifications', protect, updateNotificationPrefs);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
