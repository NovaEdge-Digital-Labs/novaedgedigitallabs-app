const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const ToolUsage = require('../models/ToolUsage.model');
const Subscription = require('../models/Subscription.model');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, plan: user.plan, role: user.role || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

// Generate 6-Digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Register a new user (with 6-Digit Email OTP)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, referralCode } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check for existing user
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            if (userExists.isEmailVerified) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists and is verified. Please log in.'
                });
            } else {
                // If existing unverified user registers again, resend OTP
                const otp = generateOtp();
                userExists.emailOtp = otp;
                userExists.emailOtpExpires = Date.now() + 10 * 60 * 1000;
                if (password) userExists.password = password;
                await userExists.save();

                await sendEmail({
                    email: userExists.email,
                    subject: 'Verify Your Email OTP - NovaEdge Digital Labs',
                    message: `Your Email Verification OTP is: ${otp}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #06000F; color: #ffffff; border-radius: 16px; border: 1px solid rgba(145, 39, 255, 0.3);">
                            <h2 style="color: #c042ff; text-align: center;">NovaEdge Digital Labs</h2>
                            <h3 style="text-align: center;">Verify Your Email Address</h3>
                            <p style="color: #94A3B8;">Hello ${userExists.name},</p>
                            <p style="color: #94A3B8;">Please enter the following 6-digit verification OTP code to complete your registration:</p>
                            <div style="padding: 16px; background: linear-gradient(135deg, #9127FF, #C042FF); color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 8px; text-align: center; border-radius: 12px; margin: 24px 0;">
                                ${otp}
                            </div>
                            <p style="color: #94A3B8; font-size: 12px; text-align: center;">This OTP will expire in 10 minutes.</p>
                        </div>
                    `
                });

                return res.status(200).json({
                    success: true,
                    requiresOtp: true,
                    email: userExists.email,
                    message: 'A 6-digit OTP verification code has been sent to your email.'
                });
            }
        }

        // Handle Referral
        let referredBy = null;
        let initialCredits = 0;
        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                referredBy = referrer._id;
                initialCredits = 50;
                referrer.novaedgeCredits += 50;
                await referrer.save();
            }
        }

        // Generate unique referral code for new user
        const newReferralCode = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') + crypto.randomBytes(3).toString('hex').toUpperCase();

        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        const adminEmail = process.env.ADMIN_EMAIL;
        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            role: adminEmail && normalizedEmail === adminEmail.toLowerCase() ? 'admin' : 'user',
            referralCode: newReferralCode,
            referredBy,
            novaedgeCredits: initialCredits,
            isEmailVerified: false,
            emailOtp: otp,
            emailOtpExpires: otpExpires
        });

        // Send OTP Email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify Your Email OTP - NovaEdge Digital Labs',
                message: `Your Email Verification OTP is: ${otp}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #06000F; color: #ffffff; border-radius: 16px; border: 1px solid rgba(145, 39, 255, 0.3);">
                        <h2 style="color: #c042ff; text-align: center;">NovaEdge Digital Labs</h2>
                        <h3 style="text-align: center;">Verify Your Email Address</h3>
                        <p style="color: #94A3B8;">Hello ${user.name},</p>
                        <p style="color: #94A3B8;">Please enter the following 6-digit verification OTP code to complete your registration:</p>
                        <div style="padding: 16px; background: linear-gradient(135deg, #9127FF, #C042FF); color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 8px; text-align: center; border-radius: 12px; margin: 24px 0;">
                            ${otp}
                        </div>
                        <p style="color: #94A3B8; font-size: 12px; text-align: center;">This OTP will expire in 10 minutes.</p>
                    </div>
                `
            });
        } catch (mailError) {
            console.error('Failed to send OTP verification email:', mailError);
        }

        res.status(201).json({
            success: true,
            requiresOtp: true,
            email: user.email,
            message: 'Registration successful! Please enter the 6-digit OTP code sent to your email.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify 6-Digit Email OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and 6-digit OTP code are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const cleanOtp = otp.toString().trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found'
            });
        }

        if (user.isEmailVerified) {
            const token = generateToken(user);
            return res.status(200).json({
                success: true,
                message: 'Email is already verified',
                token,
                user: user.toPublicJSON()
            });
        }

        if (!user.emailOtp || user.emailOtp !== cleanOtp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP verification code. Please check and try again.'
            });
        }

        if (user.emailOtpExpires && user.emailOtpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP verification code has expired. Please tap "Resend OTP".'
            });
        }

        // Verify user
        user.isEmailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;

        // Gamification: Daily Login Bonus
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!user.lastLoginDate || user.lastLoginDate < today) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (user.lastLoginDate && user.lastLoginDate >= yesterday && user.lastLoginDate < today) {
                user.dailyLoginStreak += 1;
            } else {
                user.dailyLoginStreak = 1;
            }

            const bonus = Math.min(50, user.dailyLoginStreak * 5);
            user.novaedgeCredits += (10 + bonus);
            user.lastLoginDate = new Date();
        }

        await user.save();

        const token = generateToken(user);

        // Send Welcome Email
        try {
            const sendWelcomeEmail = require('../utils/sendWelcomeEmail');
            await sendWelcomeEmail({
                user: {
                    name: user.name,
                    email: user.email,
                    referralCode: user.referralCode
                }
            });
        } catch (mailErr) {
            console.error('Welcome email error:', mailErr);
        }

        res.status(200).json({
            success: true,
            message: 'Email address verified successfully! 🎉',
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Resend 6-Digit Email OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
exports.resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified. You can log in directly.'
            });
        }

        const otp = generateOtp();
        user.emailOtp = otp;
        user.emailOtpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail({
            email: user.email,
            subject: 'Verify Your Email OTP - NovaEdge Digital Labs',
            message: `Your New Email Verification OTP is: ${otp}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #06000F; color: #ffffff; border-radius: 16px; border: 1px solid rgba(145, 39, 255, 0.3);">
                    <h2 style="color: #c042ff; text-align: center;">NovaEdge Digital Labs</h2>
                    <h3 style="text-align: center;">Resent Verification OTP</h3>
                    <p style="color: #94A3B8;">Hello ${user.name},</p>
                    <p style="color: #94A3B8;">Here is your new 6-digit OTP verification code:</p>
                    <div style="padding: 16px; background: linear-gradient(135deg, #9127FF, #C042FF); color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 8px; text-align: center; border-radius: 12px; margin: 24px 0;">
                        ${otp}
                    </div>
                    <p style="color: #94A3B8; font-size: 12px; text-align: center;">This OTP will expire in 10 minutes.</p>
                </div>
            `
        });

        res.status(200).json({
            success: true,
            message: 'A new 6-digit OTP code has been sent to your email.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Authenticate user & get token (Enforcing Email OTP Verification)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check user
        const user = await User.findOne({ email: normalizedEmail });
        if (!user || !(await user.comparePassword(password))) {
            console.log(`Login failed for: ${email} - ${!user ? 'User not found' : 'Invalid password'}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if email is verified or 2FA is enabled
        if (!user.isEmailVerified || user.twoFactorAuthEnabled) {
            const otp = generateOtp();
            user.emailOtp = otp;
            user.emailOtpExpires = Date.now() + 10 * 60 * 1000;
            await user.save();

            const subject = user.twoFactorAuthEnabled ? 'Two-Factor Authentication OTP - NovaEdge Digital Labs' : 'Verify Your Email OTP - NovaEdge Digital Labs';
            const title = user.twoFactorAuthEnabled ? 'Two-Factor Authentication' : 'Verify Your Email Address';
            const messageText = user.twoFactorAuthEnabled ? 'Please enter the following 6-digit OTP code to complete your login:' : 'Please verify your email address to log in. Here is your 6-digit OTP code:';

            try {
                await sendEmail({
                    email: user.email,
                    subject: subject,
                    message: `Your OTP is: ${otp}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #06000F; color: #ffffff; border-radius: 16px; border: 1px solid rgba(145, 39, 255, 0.3);">
                            <h2 style="color: #c042ff; text-align: center;">NovaEdge Digital Labs</h2>
                            <h3 style="text-align: center;">${title}</h3>
                            <p style="color: #94A3B8;">Hello ${user.name},</p>
                            <p style="color: #94A3B8;">${messageText}</p>
                            <div style="padding: 16px; background: linear-gradient(135deg, #9127FF, #C042FF); color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 8px; text-align: center; border-radius: 12px; margin: 24px 0;">
                                ${otp}
                            </div>
                            <p style="color: #94A3B8; font-size: 12px; text-align: center;">This OTP will expire in 10 minutes.</p>
                        </div>
                    `
                });
            } catch (mailErr) {
                console.error('Failed to send login OTP email:', mailErr);
            }

            return res.status(200).json({
                success: false,
                requiresOtp: true,
                email: user.email,
                message: user.twoFactorAuthEnabled 
                    ? 'Two-Factor Authentication is enabled. A 6-digit OTP code has been sent to your email.'
                    : 'Your email address is not verified yet. A 6-digit OTP code has been sent to your email.'
            });
        }

        console.log(`Login successful: ${email}`);

        // Double check admin role for master email
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && user.email === adminEmail.toLowerCase() && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        // Gamification: Daily Login Bonus
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!user.lastLoginDate || user.lastLoginDate < today) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (user.lastLoginDate && user.lastLoginDate >= yesterday && user.lastLoginDate < today) {
                user.dailyLoginStreak += 1;
            } else {
                user.dailyLoginStreak = 1;
            }

            const bonus = Math.min(50, user.dailyLoginStreak * 5);
            user.novaedgeCredits += (10 + bonus);
            user.lastLoginDate = new Date();
            await user.save();
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update FCM Token for notifications
 * @route   PATCH /api/auth/fcm-token
 * @access  Private
 */
exports.updateFCMToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return res.status(400).json({
                success: false,
                message: 'FCM Token is required'
            });
        }

        await User.findByIdAndUpdate(req.user.id, { fcmToken });

        res.status(200).json({
            success: true,
            message: 'FCM Token updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user account and all associated data
 * @route   DELETE /api/auth/delete-account
 * @access  Private
 */
exports.deleteAccount = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to confirm account deletion'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password. Account deletion cancelled.'
            });
        }

        await ToolUsage.deleteMany({ user: user._id });
        await Subscription.deleteMany({ user: user._id });
        await User.findByIdAndDelete(user._id);

        res.status(200).json({
            success: true,
            message: 'Your account and all associated data have been permanently deleted.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email address'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        const frontendUrl = process.env.FRONTEND_URL || 'https://novaedgedigitallabs.in';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        
        const message = `You requested a password reset. Reset token: ${resetToken}`;
        const htmlMessage = `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your NovaEdge Digital Labs account.</p>
            <p>Copy and paste this Reset Token in your app:</p>
            <div style="padding: 10px; background-color: #f1f1f1; word-break: break-all; border-radius: 5px;">
                <strong>${resetToken}</strong>
            </div>
        `;
        
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset - NovaEdge Digital Labs',
                message,
                html: htmlMessage
            });
            
            res.status(200).json({
                success: true,
                message: 'Password reset link has been sent to your email.'
            });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later.'
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const rawToken = (req.params.token || '').trim();
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset token'
            });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile (Name & Avatar Image)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, avatar, personas, bio, skills, hourlyRate, portfolioUrl } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (name && name.trim()) {
            user.name = name.trim();
        }

        if (avatar !== undefined) {
            user.avatar = avatar;
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        if (Array.isArray(skills)) {
            user.skills = skills.map(s => String(s).trim()).filter(Boolean);
        }

        if (hourlyRate !== undefined) {
            user.hourlyRate = Number(hourlyRate) || 0;
        }

        if (portfolioUrl !== undefined) {
            user.portfolioUrl = String(portfolioUrl).trim();
        }

        // Personas drive UI routing only. Whitelist explicitly so a client can't
        // slip an arbitrary value (or 'admin') into the array.
        if (Array.isArray(personas)) {
            const allowed = ['client', 'freelancer', 'student', 'jobseeker', 'employer'];
            user.personas = [...new Set(personas.filter((p) => allowed.includes(p)))];
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: user.toPublicJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle Two-Factor Authentication
 * @route   POST /api/auth/toggle-2fa
 * @access  Private
 */
exports.toggle2FA = async (req, res, next) => {
    try {
        const { enable } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.twoFactorAuthEnabled = Boolean(enable);
        await user.save();

        res.status(200).json({
            success: true,
            message: `Two-Factor Authentication ${user.twoFactorAuthEnabled ? 'enabled' : 'disabled'} successfully.`,
            twoFactorAuthEnabled: user.twoFactorAuthEnabled
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update Notification Preferences
 * @route   PUT /api/auth/notifications
 * @access  Private
 */
exports.updateNotificationPrefs = async (req, res, next) => {
    try {
        const { preferences } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.notificationPreferences = {
            ...user.notificationPreferences.toObject(),
            ...preferences
        };
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Notification preferences updated successfully',
            notificationPreferences: user.notificationPreferences
        });
    } catch (error) {
        next(error);
    }
};
