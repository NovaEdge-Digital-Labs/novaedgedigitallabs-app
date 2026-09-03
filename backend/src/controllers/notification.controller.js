const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const { admin, isFirebaseReady, firebaseInitError } = require('../config/firebase');

// @desc    Update FCM Token for user
// @route   POST /api/notifications/fcm-token
// @access  Private
exports.updateFcmToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) {
            return res.status(400).json({ success: false, message: 'FCM Token is required' });
        }

        await User.findByIdAndUpdate(req.user.id, { fcmToken }, { new: true });
        
        // Subscribe the token to the global broadcast topic
        if (isFirebaseReady()) {
            try {
                await admin.messaging().subscribeToTopic([fcmToken], 'all_users');
            } catch (topicErr) {
                console.error('Error subscribing to all_users topic:', topicErr);
            }
        }

        res.status(200).json({
            success: true,
            message: 'FCM Token updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        // Fetch specific user notifications and global notifications
        const notifications = await Notification.find({
            $or: [
                { userId: req.user.id },
                { userId: null }
            ]
        }).sort({ createdAt: -1 }).limit(50);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Only allow if it's the user's notification
        if (notification.userId && notification.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send push notification (Admin only)
// @route   POST /api/notifications/send
// @access  Private/Admin
exports.sendPushNotification = async (req, res, next) => {
    try {
        const { title, message, type, actionUrl, userId } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }

        // Save notification to DB
        const notification = await Notification.create({
            title,
            message,
            type: type || 'general',
            actionUrl,
            userId: userId || null
        });

        // Send via Firebase. The row is already saved, so a delivery failure
        // must not fail the request — but it MUST be reported back, otherwise
        // the admin sees "sent" for a push that reached nobody.
        const delivery = { attempted: false, delivered: false, error: null };

        if (!isFirebaseReady()) {
            delivery.error = `Firebase is not configured (${firebaseInitError() || 'unknown reason'})`;
            console.error('Push delivery skipped:', delivery.error);
        } else {
            delivery.attempted = true;
            try {
                const payload = {
                    notification: {
                        title,
                        body: message
                    },
                    data: {
                        type: type || 'general',
                        actionUrl: actionUrl || '',
                        notificationId: notification._id.toString()
                    }
                };

                if (userId) {
                    // Send to specific user
                    const user = await User.findById(userId);
                    if (!user) {
                        delivery.error = 'Target user not found';
                    } else if (!user.fcmToken) {
                        delivery.error = 'Target user has no registered device';
                    } else {
                        await admin.messaging().send({
                            ...payload,
                            token: user.fcmToken
                        });
                        delivery.delivered = true;
                    }
                } else {
                    // Global broadcast. Devices are subscribed to 'all_users'
                    // when they register their token in auth.controller.
                    await admin.messaging().send({
                        ...payload,
                        topic: 'all_users'
                    });
                    delivery.delivered = true;
                }
            } catch (firebaseError) {
                delivery.error = firebaseError?.errorInfo?.message || firebaseError?.message || 'Unknown Firebase error';
                console.error('Firebase messaging error:', firebaseError);
            }
        }

        res.status(201).json({
            success: true,
            message: delivery.delivered
                ? 'Notification sent and saved'
                : `Notification saved, but push delivery failed: ${delivery.error}`,
            delivery,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all notifications (Admin only) for history tracking
// @route   GET /api/notifications/all
// @access  Private/Admin
exports.getAllNotificationsForAdmin = async (req, res, next) => {
    try {
        const notifications = await Notification.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};
