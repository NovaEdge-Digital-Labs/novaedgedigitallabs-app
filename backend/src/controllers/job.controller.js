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
        if (jobType && jobType !== 'All') query.jobType = jobType;
        if (minSalary) query['salaryRange.min'] = { $gte: Number(minSalary) };

        if (search && typeof search === 'string' && search.trim() !== '') {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: regex },
                { description: regex },
                { location: regex },
                { requiredSkills: regex }
            ];
        }

        const jobs = await JobListing.find(query)
            .populate('companyId', 'name logo website description')
            .sort({ createdAt: -1 });

        const tierOrder = { 'Premium': 3, 'Featured': 2, 'Basic': 1 };
        const sortedJobs = jobs.sort((a, b) => (tierOrder[b.listingType] || 1) - (tierOrder[a.listingType] || 1));

        res.status(200).json({ success: true, count: sortedJobs.length, data: sortedJobs });
    } catch (error) {
        console.error('getAllJobs error:', error);
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

exports.getJobsByIds = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }
        const jobs = await JobListing.find({ _id: { $in: ids } }).populate('companyId', 'name logo website');
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Applications ---

exports.applyToJob = async (req, res) => {
    try {
        const { jobId, name, email, phone, resumeUrl, coverNote } = req.body;

        const job = await JobListing.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Prevent Job Author from applying to their own job
        if (job.postedBy && job.postedBy.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot apply to your own job listing.'
            });
        }

        // Check for existing application by same user
        const existingApp = await JobApplication.findOne({
            jobId,
            applicantId: req.user.id
        });

        if (existingApp) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted an application for this position.'
            });
        }

        // Check for active Premium Candidate Pass
        const activePass = await PremiumJobSeeker.findOne({
            userId: req.user.id,
            status: 'active',
            expiryDate: { $gte: new Date() }
        });
        const isPremiumCandidate = Boolean(activePass);

        const application = await JobApplication.create({
            jobId,
            applicantId: req.user.id,
            name,
            email,
            phone,
            resumeUrl,
            coverNote,
            isPremiumCandidate
        });

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
