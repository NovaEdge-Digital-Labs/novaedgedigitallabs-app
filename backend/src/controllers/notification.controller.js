const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const admin = require('../config/firebase');

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

        // Send via Firebase
        if (admin && admin.messaging) {
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
                    if (user && user.fcmToken) {
                        await admin.messaging().send({
                            ...payload,
                            token: user.fcmToken
                        });
                    }
                } else {
                    // Global broadcast (Requires users to subscribe to a topic like 'all_users', 
                    // or we have to send multcast to all valid tokens which can be heavy, 
                    // but for now let's use topic 'all_users')
                    await admin.messaging().send({
                        ...payload,
                        topic: 'all_users'
                    });
                }
            } catch (firebaseError) {
                console.error('Firebase messaging error:', firebaseError);
                // We do not fail the request if firebase fails, just log it. 
                // The notification is saved in DB and can be seen in-app.
            }
        }

        res.status(201).json({
            success: true,
            message: 'Notification sent and saved',
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
