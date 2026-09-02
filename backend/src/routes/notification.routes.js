const express = require('express');
const router = express.Router();
const { 
    updateFcmToken, 
    getNotifications, 
    markAsRead, 
    sendPushNotification,
    getAllNotificationsForAdmin
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkAdmin } = require('../middleware/admin.middleware');

// Routes accessible to all authenticated users
router.use(protect);

router.post('/fcm-token', updateFcmToken);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

// Routes accessible only to admins
router.get('/all', checkAdmin, getAllNotificationsForAdmin);
router.post('/send', checkAdmin, sendPushNotification);

module.exports = router;
