const CompanyProfile = require('../models/CompanyProfile.model');
const JobListing = require('../models/JobListing.model');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

// --- Company Profile ---

exports.createCompanyProfile = async (req, res) => {
    try {
        const { name, logo, website, location, description } = req.body;
        const profile = await CompanyProfile.findOneAndUpdate(
            { userId: req.user.id },
            { name, logo, website, location, description },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCompanyProfile = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Company profile not found' });
        }
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Job Posting (with Payment) ---

const PRICES = {
    'Basic': 999,
    'Featured': 1999,
    'Premium': 2999
};

const EXPIRY_DAYS = {
    'Basic': 30,
    'Featured': 45,
    'Premium': 60
};

exports.createJobOrder = async (req, res) => {
    try {
        const { listingType } = req.body;
        const amount = PRICES[listingType];

        if (!amount) {
            return res.status(400).json({ success: false, message: 'Invalid listing type' });
        }

        const options = {
            amount: amount * 100, // in paise
            currency: 'INR',
            receipt: `job_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.publishJob = async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            jobData // title, location, type, etc.
        } = req.body;

        // Verify Signature
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        const company = await CompanyProfile.findOne({ userId: req.user.id });
        if (!company) {
            return res.status(404).json({ success: false, message: 'Create company profile first' });
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS[jobData.listingType]);

        const job = await JobListing.create({
            ...jobData,
            companyId: company._id,
            postedBy: req.user.id,
            expiryDate,
            razorpayOrderId,
            razorpayPaymentId
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
