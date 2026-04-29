const User = require('../models/User.model');
const Course = require('../models/Course.model');
const ToolUsage = require('../models/ToolUsage.model');
const Lead = require('../models/Lead.model');
const PlatformConfig = require('../models/PlatformConfig.model');
const Analytics = require('../models/Analytics.model');
const Product = require('../models/Product.model');
const ApiKey = require('../models/ApiKey.model');
const Service = require('../models/Service.model');
const BusinessInquiry = require('../models/BusinessInquiry.model');
const JobListing = require('../models/JobListing.model');
const Project = require('../models/Project.model');
const Gig = require('../models/Gig.model');
const os = require('os');
const fs = require('fs/promises');
const mongoose = require('mongoose');


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
 * @desc    Get live system health metrics
 * @route   GET /api/admin/system-health
 * @access  Private/Admin
 */
exports.getSystemHealth = async (req, res, next) => {
    try {
        const dbStart = Date.now();
        await mongoose.connection.db.admin().ping();
        const apiLatency = Date.now() - dbStart;

        const cpuCount = os.cpus().length || 1;
        const oneMinuteLoad = os.loadavg()[0] || 0;
        const cpuLoad = Math.min(100, Math.round((oneMinuteLoad / cpuCount) * 100));

        let diskUsage = 0;
        try {
            const stat = await fs.statfs('/');
            const total = Number(stat.blocks) * Number(stat.bsize);
            const free = Number(stat.bavail) * Number(stat.bsize);
            const usedPercent = total > 0 ? ((total - free) / total) * 100 : 0;
            diskUsage = Math.round(usedPercent);
        } catch (diskError) {
            diskUsage = 0;
        }

        res.status(200).json({
            success: true,
            health: {
                apiLatency,
                cpuLoad,
                diskUsage
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

/**
 * @desc    Get all lead submissions
 * @route   GET /api/admin/leads
 * @access  Private/Admin
 */
exports.getAdminLeads = async (req, res, next) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leads.length,
            leads
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update lead status/notes
 * @route   PUT /api/admin/leads/:id
 * @access  Private/Admin
 */
exports.updateAdminLead = async (req, res, next) => {
    try {
        const { status, notes, assignedTo } = req.body;
        const payload = {};

        if (status !== undefined) payload.status = status;
        if (notes !== undefined) payload.notes = notes;
        if (assignedTo !== undefined) payload.assignedTo = assignedTo;

        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true }
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lead updated successfully',
            lead
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all business inquiry submissions
 * @route   GET /api/admin/inquiries
 * @access  Private/Admin
 */
exports.getAdminInquiries = async (req, res, next) => {
    try {
        const inquiries = await BusinessInquiry.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: inquiries.length,
            inquiries
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update inquiry status (approval workflow)
 * @route   PUT /api/admin/inquiries/:id
 * @access  Private/Admin
 */
exports.updateAdminInquiry = async (req, res, next) => {
    try {
        const { status } = req.body;

        const inquiry = await BusinessInquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inquiry updated successfully',
            inquiry
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all job posts
 * @route   GET /api/admin/jobs
 * @access  Private/Admin
 */
exports.getAdminJobs = async (req, res, next) => {
    try {
        const jobs = await JobListing.find()
            .populate('postedBy', 'firstName lastName email')
            .populate('companyId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update job post
 * @route   PUT /api/admin/jobs/:id
 * @access  Private/Admin
 */
exports.updateAdminJob = async (req, res, next) => {
    try {
        const { isActive, expiryDate, listingType } = req.body;
        const payload = {};

        if (isActive !== undefined) payload.isActive = isActive;
        if (expiryDate !== undefined) payload.expiryDate = expiryDate;
        if (listingType !== undefined) payload.listingType = listingType;

        const job = await JobListing.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job post updated successfully',
            job
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete job post
 * @route   DELETE /api/admin/jobs/:id
 * @access  Private/Admin
 */
exports.deleteAdminJob = async (req, res, next) => {
    try {
        const job = await JobListing.findByIdAndDelete(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job post deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all projects and gigs (work)
 * @route   GET /api/admin/work
 * @access  Private/Admin
 */
exports.getAdminWork = async (req, res, next) => {
    try {
        const [projects, gigs] = await Promise.all([
            Project.find().populate('clientId', 'firstName lastName email').sort({ createdAt: -1 }),
            Gig.find().populate('freelancerId', 'firstName lastName email').sort({ createdAt: -1 })
        ]);

        res.status(200).json({
            success: true,
            projects,
            gigs
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update project status
 * @route   PUT /api/admin/work/projects/:id
 * @access  Private/Admin
 */
exports.updateAdminProject = async (req, res, next) => {
    try {
        const { status } = req.body;
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/admin/work/projects/:id
 * @access  Private/Admin
 */
exports.deleteAdminProject = async (req, res, next) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update gig status
 * @route   PUT /api/admin/work/gigs/:id
 * @access  Private/Admin
 */
exports.updateAdminGig = async (req, res, next) => {
    try {
        const { isActive } = req.body;
        const gig = await Gig.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true, runValidators: true }
        );

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Gig updated successfully',
            gig
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete gig
 * @route   DELETE /api/admin/work/gigs/:id
 * @access  Private/Admin
 */
exports.deleteAdminGig = async (req, res, next) => {
    try {
        const gig = await Gig.findByIdAndDelete(req.params.id);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Gig deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

