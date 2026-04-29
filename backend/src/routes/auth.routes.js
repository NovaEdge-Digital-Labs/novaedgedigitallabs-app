const express = require('express');
const router = express.Router();
const { login, register, getMe, updateFCMToken, deleteAccount, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.patch('/fcm-token', protect, updateFCMToken);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
