const CompanyProfile = require('../models/CompanyProfile.model');
const JobListing = require('../models/JobListing.model');
const JobApplication = require('../models/JobApplication.model');
const User = require('../models/User.model');
const PricingTier = require('../models/PricingTier.model');
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
        let profile = await CompanyProfile.findOne({ userId: req.user.id });
        if (!profile) {
            const user = await User.findById(req.user.id);
            profile = await CompanyProfile.create({
                userId: req.user.id,
                name: user?.name || 'NovaEdge Client',
                location: 'Remote',
                description: 'NovaEdge Business Account Profile'
            });
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
        const user = await User.findById(req.user.id);
        const isBusinessUser = user && (user.plan === 'business' || user.plan === 'pro' || user.role === 'admin');

        // Business/Pro Plan users get Premium & Featured listings 100% FREE
        if (isBusinessUser) {
            return res.status(200).json({
                success: true,
                isFree: true,
                orderId: `FREE_BUSINESS_${Date.now()}`,
                amount: 0,
                currency: 'INR',
                keyId: process.env.RAZORPAY_KEY_ID || 'dummy'
            });
        }

        let amount = PRICES[listingType] || 2999;
        const tierDoc = await PricingTier.findOne({ tierId: listingType, isActive: true });
        if (tierDoc) {
            amount = tierDoc.price;
        }

        const options = {
            amount: amount * 100, // in paise
            currency: 'INR',
            receipt: `job_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            isFree: false,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        // Fallback for dev/test mode without razorpay keys
        res.status(200).json({
            success: true,
            isFree: true,
            orderId: `FREE_BUSINESS_${Date.now()}`,
            amount: 0,
            currency: 'INR',
            keyId: 'dummy'
        });
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

        const user = await User.findById(req.user.id);
        const isBusinessUser = user && (user.plan === 'business' || user.plan === 'pro' || user.role === 'admin');
        const isFreeOrder = !razorpayOrderId || razorpayOrderId.startsWith('FREE_BUSINESS_');

        // Verify Signature if paying via Razorpay
        if (!isBusinessUser && !isFreeOrder && razorpaySignature) {
            try {
                const body = razorpayOrderId + '|' + razorpayPaymentId;
                const expectedSignature = crypto
                    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                    .update(body.toString())
                    .digest('hex');

                if (expectedSignature !== razorpaySignature) {
                    return res.status(400).json({ success: false, message: 'Payment verification failed' });
                }
            } catch (sigErr) {
                console.log('Signature check skipped in dev mode');
            }
        }

        let company = await CompanyProfile.findOne({ userId: req.user.id });
        if (!company) {
            company = await CompanyProfile.create({
                userId: req.user.id,
                name: user?.name || 'NovaEdge Client',
                location: jobData?.location || 'Remote',
                description: 'NovaEdge Business Account Profile'
            });
        }

        const listingType = jobData?.listingType || 'Premium';
        const expiryDays = EXPIRY_DAYS[listingType] || 60;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);

        const validJobType = ['Full-time', 'Part-time', 'Remote', 'Internship'].includes(jobData?.jobType)
            ? jobData.jobType
            : 'Full-time';

        const targetTitle = (jobData?.title || 'Senior Software Engineer').trim();

        // Prevent rapid duplicate job creation by the same user
        const existingRecentJob = await JobListing.findOne({
            postedBy: req.user.id,
            title: new RegExp(`^${targetTitle}$`, 'i'),
            createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Created within last 10 minutes
        });

        const websiteUrl = (jobData?.websiteUrl || jobData?.website || company?.website || 'https://novaedgedigitallabs.tech').trim();

        if (jobData?.websiteUrl && company) {
            company.website = websiteUrl;
            await company.save();
        }

        let job;
        if (existingRecentJob) {
            job = await JobListing.findByIdAndUpdate(
                existingRecentJob._id,
                {
                    title: targetTitle,
                    location: jobData?.location || existingRecentJob.location,
                    jobType: validJobType,
                    salaryRange: jobData?.salaryRange || existingRecentJob.salaryRange,
                    requiredSkills: Array.isArray(jobData?.skillsRequired) ? jobData.skillsRequired : Array.isArray(jobData?.requiredSkills) ? jobData.requiredSkills : existingRecentJob.requiredSkills,
                    experienceLevel: jobData?.experienceLevel || existingRecentJob.experienceLevel,
                    description: jobData?.description || existingRecentJob.description,
                    websiteUrl,
                    listingType,
                    expiryDate,
                    isActive: true
                },
                { new: true }
            );
            console.log('✅ Duplicate prevented - Updated recent job listing:', job._id);
        } else {
            job = await JobListing.create({
                title: targetTitle,
                location: jobData?.location || 'Remote, India',
                jobType: validJobType,
                salaryRange: jobData?.salaryRange || { min: 0, max: 0 },
                requiredSkills: Array.isArray(jobData?.skillsRequired) ? jobData.skillsRequired : Array.isArray(jobData?.requiredSkills) ? jobData.requiredSkills : ['General'],
                experienceLevel: jobData?.experienceLevel || '1-3 yrs',
                description: jobData?.description || 'Job details and requirements.',
                websiteUrl,
                companyId: company._id,
                postedBy: req.user.id,
                listingType,
                expiryDate,
                razorpayOrderId: razorpayOrderId || `FREE_BUSINESS_${Date.now()}`,
                razorpayPaymentId: razorpayPaymentId || `FREE_BUSINESS_${Date.now()}`
            });
            console.log('✅ New Job Published successfully in Backend:', job._id);
        }

        // Send Invoice Email with CC to app@novaedgedigitallabs.in & BCC to amitkumarraikwar27@gmail.com
        try {
            const sendInvoice = require('../utils/sendInvoice');
            const employerUser = await User.findById(req.user.id);
            if (employerUser) {
                await sendInvoice({
                    user: { name: employerUser.name, email: employerUser.email },
                    purchaseType: 'subscription',
                    itemDetails: {
                        name: `${listingType || 'Job'} Listing Package`,
                        price: listingType === 'Premium' ? 2999 : listingType === 'Featured' ? 1999 : 999,
                        billingCycle: '30 Days'
                    },
                    paymentDetails: {
                        orderId: razorpayOrderId || `ORDER_${Date.now()}`,
                        paymentId: razorpayPaymentId || `PAY_${Date.now()}`,
                        date: new Date()
                    }
                });
            }
        } catch (mailErr) {
            console.error('Failed to send invoice email for Job Publication:', mailErr);
        }

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error('❌ Error publishing job in employer.controller:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getEmployerApplicants = async (req, res) => {
    try {
        const userJobs = await JobListing.find({ postedBy: req.user.id });
        const jobIds = userJobs.map((j) => j._id);

        const applications = await JobApplication.find({ jobId: { $in: jobIds } })
            .populate('jobId', 'title location listingType')
            .sort({ isPremiumCandidate: -1, createdAt: -1 });

        res.status(200).json({ success: true, count: applications.length, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateApplicantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await JobApplication.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateEmployerJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await JobListing.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized to edit this job' });
        }

        const {
            title,
            location,
            jobType,
            salaryRange,
            skillsRequired,
            requiredSkills,
            experienceLevel,
            description,
            websiteUrl
        } = req.body;

        if (title) job.title = title.trim();
        if (location) job.location = location.trim();
        if (jobType) job.jobType = jobType;
        if (salaryRange) job.salaryRange = salaryRange;
        if (skillsRequired || requiredSkills) {
            job.requiredSkills = Array.isArray(skillsRequired) ? skillsRequired : Array.isArray(requiredSkills) ? requiredSkills : job.requiredSkills;
        }
        if (experienceLevel) job.experienceLevel = experienceLevel;
        if (description) job.description = description.trim();
        if (websiteUrl) job.websiteUrl = websiteUrl.trim();

        await job.save();
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteEmployerJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await JobListing.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this job' });
        }

        await JobListing.findByIdAndDelete(id);
        await JobApplication.deleteMany({ jobId: id });

        res.status(200).json({ success: true, message: 'Job and associated applications deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyPostedJobs = async (req, res) => {
    try {
        const jobs = await JobListing.find({ postedBy: req.user.id })
            .populate('companyId')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
