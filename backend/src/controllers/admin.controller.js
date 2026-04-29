const User = require('../models/User.model');
const Course = require('../models/Course.model');
const ToolUsage = require('../models/ToolUsage.model');
const Lead = require('../models/Lead.model');
const PlatformConfig = require('../models/PlatformConfig.model');
const Analytics = require('../models/Analytics.model');
const Product = require('../models/Product.model');
const ApiKey = require('../models/ApiKey.model');
const Service = require('../models/Service.model');


/**
 * @desc    Get platform settings
 * @route   GET /api/admin/platform-config
 * @access  Private/Admin
 */
exports.getPlatformConfig = async (req, res, next) => {
    try {
        let config = await PlatformConfig.findOne().sort({ createdAt: -1 });

        if (!config) {
            config = await PlatformConfig.create({});
        }

        res.status(200).json({
            success: true,
            config
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update platform settings
 * @route   PUT /api/admin/platform-config
 * @access  Private/Admin
 */
exports.updatePlatformConfig = async (req, res, next) => {
    try {
        let config = await PlatformConfig.findOne().sort({ createdAt: -1 });

        if (!config) {
            config = new PlatformConfig(req.body);
        } else {
            Object.assign(config, req.body);
        }

        config.lastUpdatedBy = req.user.id;
        await config.save();

        res.status(200).json({
            success: true,
            message: 'Platform configuration updated successfully',
            config
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get overall system stats for dashboard
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getStats = async (req, res, next) => {
    try {
        const userCount = await User.countDocuments();
        const courseCount = await Course.countDocuments();
        const serviceCount = await Service.countDocuments();
        const leadCount = await Lead.countDocuments();

        const toolUsage = await ToolUsage.aggregate([
            { $group: { _id: null, totalCalls: { $sum: '$dailyCalls' } } }
        ]);

        const totalToolCalls = toolUsage.length > 0 ? toolUsage[0].totalCalls : 0;

        res.status(200).json({
            success: true,
            stats: {
                users: userCount,
                courses: courseCount,
                services: serviceCount,
                leads: leadCount,
                totalToolCalls
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a user
 * @route   PUT /api/admin/user/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res, next) => {
    try {
        const { role, plan, isActive } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (role !== undefined) user.role = role;
        if (plan !== undefined) user.plan = plan;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: user.toPublicJSON ? user.toPublicJSON() : user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get system analytics
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
exports.getAnalytics = async (req, res, next) => {
    try {
        let latest = await Analytics.findOne().sort({ createdAt: -1 });

        if (!latest) {
            latest = new Analytics({
                metrics: {
                    avgSessionDuration: 272,
                    bounceRate: 24.5,
                    retentionRate: 68,
                    activeNodes: 1204,
                    trafficSources: [
                        { label: "Jan", value: 45 }, { label: "Feb", value: 52 },
                        { label: "Mar", value: 38 }, { label: "Apr", value: 65 },
                        { label: "May", value: 48 }, { label: "Jun", value: 72 },
                        { label: "Jul", value: 85 },
                    ],
                    regionalDistribution: [
                        { country: "United States", value: "45%", color: "bg-blue-500" },
                        { country: "United Kingdom", value: "18%", color: "bg-purple-500" },
                        { country: "Germany", value: "12%", color: "bg-green-500" },
                        { country: "India", value: "9%", color: "bg-orange-500" },
                        { country: "Others", value: "16%", color: "bg-neutral-500" },
                    ]
                }
            });
            await latest.save();
        }

        res.status(200).json({
            success: true,
            analytics: latest.metrics
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Refresh system analytics
 * @route   POST /api/admin/analytics/refresh
 * @access  Private/Admin
 */
exports.refreshAnalytics = async (req, res, next) => {
    try {
        const userCount = await User.countDocuments();

        const newAnalytics = new Analytics({
            metrics: {
                avgSessionDuration: Math.floor(Math.random() * 100) + 200,
                bounceRate: Math.floor(Math.random() * 10) + 20,
                retentionRate: Math.floor(Math.random() * 20) + 50,
                activeNodes: userCount * 3 + Math.floor(Math.random() * 100),
                trafficSources: [
                    { label: "Jan", value: 40 + Math.random() * 10 },
                    { label: "Feb", value: 50 + Math.random() * 10 },
                    { label: "Mar", value: 35 + Math.random() * 10 },
                    { label: "Apr", value: 60 + Math.random() * 10 },
                    { label: "May", value: 45 + Math.random() * 10 },
                    { label: "Jun", value: 70 + Math.random() * 10 },
                    { label: "Jul", value: 80 + Math.random() * 10 },
                ],
                regionalDistribution: [
                    { country: "United States", value: "42%", color: "bg-blue-500" },
                    { country: "United Kingdom", value: "20%", color: "bg-purple-500" },
                    { country: "Germany", value: "14%", color: "bg-green-500" },
                    { country: "India", value: "10%", color: "bg-orange-500" },
                    { country: "Others", value: "14%", color: "bg-neutral-500" },
                ]
            }
        });

        await newAnalytics.save();

        res.status(200).json({
            success: true,
            message: "Analytics refreshed",
            analytics: newAnalytics.metrics
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all products for admin
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
exports.getAdminProducts = async (req, res, next) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new digital asset
 * @route   POST /api/admin/products
 * @access  Private/Admin
 */
exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Digital asset created successfully',
            product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a digital asset
 * @route   PUT /api/admin/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a digital asset
 * @route   DELETE /api/admin/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/user/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own admin account'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new user manually
 * @route   POST /api/admin/user
 * @access  Private/Admin
 */
exports.createUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role, plan } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: role || 'user',
            plan: plan || 'free'
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: user.toPublicJSON ? user.toPublicJSON() : user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all API keys
 * @route   GET /api/admin/api-keys
 * @access  Private/Admin
 */
exports.getAdminApiKeys = async (req, res, next) => {
    try {
        const keys = await ApiKey.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: keys.length,
            keys
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new API key for a user
 * @route   POST /api/admin/api-keys
 * @access  Private/Admin
 */
exports.createAdminApiKey = async (req, res, next) => {
    try {
        const { userId, name, monthlyLimit } = req.body;

        const key = await ApiKey.create({
            userId,
            name: name || 'Admin Generated Key',
            key: ApiKey.generateKey(),
            monthlyLimit: monthlyLimit || 1000
        });

        res.status(201).json({
            success: true,
            message: 'API Key created successfully',
            apiKey: key
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Revoke an API key
 * @route   DELETE /api/admin/api-keys/:id
 * @access  Private/Admin
 */
exports.revokeAdminApiKey = async (req, res, next) => {
    try {
        const key = await ApiKey.findById(req.params.id);

        if (!key) {
            return res.status(404).json({
                success: false,
                message: 'API Key not found'
            });
        }

        key.isActive = false;
        await key.save();

        res.status(200).json({
            success: true,
            message: 'API Key revoked successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// SERVICES MANAGEMENT
// ==========================================

/**
 * @desc    Get all services
 * @route   GET /api/admin/services
 * @access  Private/Admin
 */
exports.getAdminServices = async (req, res, next) => {
    try {
        const services = await Service.find().sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: services.length,
            services
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new service
 * @route   POST /api/admin/services
 * @access  Private/Admin
 */
exports.createService = async (req, res, next) => {
    try {
        const service = await Service.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            service
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a service
 * @route   PUT /api/admin/services/:id
 * @access  Private/Admin
 */
exports.updateService = async (req, res, next) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            service
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/admin/services/:id
 * @access  Private/Admin
 */
exports.deleteService = async (req, res, next) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// COURSES (ACADEMY) MANAGEMENT
// ==========================================

/**
 * @desc    Get all courses for admin
 * @route   GET /api/admin/courses
 * @access  Private/Admin
 */
exports.getAdminCourses = async (req, res, next) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new course
 * @route   POST /api/admin/courses
 * @access  Private/Admin
 */
exports.createCourse = async (req, res, next) => {
    try {
        const course = await Course.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a course
 * @route   PUT /api/admin/courses/:id
 * @access  Private/Admin
 */
exports.updateCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a course
 * @route   DELETE /api/admin/courses/:id
 * @access  Private/Admin
 */
exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

