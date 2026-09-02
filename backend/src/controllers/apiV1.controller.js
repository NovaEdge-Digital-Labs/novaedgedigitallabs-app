const JobListing = require('../models/JobListing.model');
const Course = require('../models/Course.model');
const Gig = require('../models/Gig.model');
const Product = require('../models/Product.model');

// @desc    Get public jobs for external developers
// @route   GET /api/v1/jobs
// @access  Private (API Key required)
exports.getJobs = async (req, res, next) => {
    try {
        const jobs = await JobListing.find({ status: 'open' })
            .select('-__v -applicants')
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public courses for external developers
// @route   GET /api/v1/academy
// @access  Private (API Key required)
exports.getCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .select('-__v -enrolledStudents')
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public marketplace gigs for external developers
// @route   GET /api/v1/marketplace
// @access  Private (API Key required)
exports.getGigs = async (req, res, next) => {
    try {
        const gigs = await Gig.find({ status: 'active' })
            .select('-__v')
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.status(200).json({
            success: true,
            count: gigs.length,
            data: gigs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public store products for external developers
// @route   GET /api/v1/store
// @access  Private (API Key required)
exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isActive: true })
            .select('-__v')
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};
