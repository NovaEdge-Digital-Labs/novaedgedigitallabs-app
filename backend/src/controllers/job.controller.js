const JobListing = require('../models/JobListing.model');
const JobApplication = require('../models/JobApplication.model');
const CompanyProfile = require('../models/CompanyProfile.model');
const PremiumJobSeeker = require('../models/PremiumJobSeeker.model');

// --- Job Feed ---

exports.getAllJobs = async (req, res) => {
    try {
        const { role, location, jobType, minSalary, search } = req.query;
        let query = { isActive: true };

        if (role) query.title = { $regex: role, $options: 'i' };
        if (location) query.location = { $regex: location, $options: 'i' };
        if (jobType) query.jobType = jobType;
        if (minSalary) query['salaryRange.min'] = { $gte: Number(minSalary) };

        if (search) {
            query.$text = { $search: search };
        }

        // Priority Sorting: Premium > Featured > Basic
        const jobs = await JobListing.find(query)
            .populate('companyId', 'name logo')
            .sort({
                listingType: -1, // This is alphabetical actually, need careful enum/mapping
                createdAt: -1
            });

        // Robust sorting for the tiers
        const tierOrder = { 'Premium': 3, 'Featured': 2, 'Basic': 1 };
        const sortedJobs = jobs.sort((a, b) => tierOrder[b.listingType] - tierOrder[a.listingType]);

        res.status(200).json({ success: true, data: sortedJobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const job = await JobListing.findById(req.params.id).populate('companyId');
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Applications ---

exports.applyToJob = async (req, res) => {
    try {
        const { jobId, name, email, phone, resumeUrl, coverNote } = req.body;

        const application = await JobApplication.create({
            jobId,
            applicantId: req.user.id,
            name,
            email,
            phone,
            resumeUrl,
            coverNote
        });

        // Trigger Email Notification (Placeholder or real service)
        // console.log(`Email sent to company of job ${jobId}`);

        res.status(201).json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const apps = await JobApplication.find({ applicantId: req.user.id })
            .populate({
                path: 'jobId',
                populate: { path: 'companyId', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: apps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
