const FreelancerProfile = require('../models/FreelancerProfile.model');
const Gig = require('../models/Gig.model');
const Project = require('../models/Project.model');
const Proposal = require('../models/Proposal.model');
const Contract = require('../models/Contract.model');
const User = require('../models/User.model');

// --- Profile & Freelancer Management ---

exports.createFreelancerProfile = async (req, res) => {
    try {
        const { bio, skills, hourlyRate, title, portfolio } = req.body;
        const profile = await FreelancerProfile.findOneAndUpdate(
            { userId: req.user.id },
            { bio, skills, hourlyRate, title, portfolio },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFreelancerProfile = async (req, res) => {
    try {
        const profile = await FreelancerProfile.findOne({ userId: req.params.userId || req.user.id }).populate('userId', 'name email');
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Gig Management ---

exports.createGig = async (req, res) => {
    try {
        const { title, description, price, deliveryDays, category, images, features } = req.body;
        const gig = await Gig.create({
            freelancerId: req.user.id,
            title,
            description,
            price,
            deliveryDays,
            category,
            images,
            features
        });
        res.status(201).json({ success: true, data: gig });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllGigs = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isActive: true };
        if (category && category !== 'all') query.category = category;
        if (search) query.title = { $regex: search, $options: 'i' };

        const gigs = await Gig.find(query).populate('freelancerId', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: gigs.length, data: gigs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Project Management ---

exports.createProject = async (req, res) => {
    try {
        const { title, description, budgetRange, deadline, skillsRequired } = req.body;
        const project = await Project.create({
            clientId: req.user.id,
            title,
            description,
            budgetRange,
            deadline,
            skillsRequired
        });
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { status: 'open' };
        if (search) query.title = { $regex: search, $options: 'i' };

        const projects = await Project.find(query).populate('clientId', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Proposal Management ---

exports.submitProposal = async (req, res) => {
    try {
        const { projectId, coverLetter, bidAmount, deliveryDays } = req.body;
        const proposal = await Proposal.create({
            projectId,
            freelancerId: req.user.id,
            coverLetter,
            bidAmount,
            deliveryDays
        });
        await Project.findByIdAndUpdate(projectId, { $inc: { totalProposals: 1 } });
        res.status(201).json({ success: true, data: proposal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const EscrowTransaction = require('../models/EscrowTransaction.model');

// ... (previous code)

exports.getProjectProposals = async (req, res) => {
    try {
        const proposals = await Proposal.find({ projectId: req.params.projectId }).populate('freelancerId', 'name');
        res.status(200).json({ success: true, data: proposals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Hiring & Escrow Flow ---

exports.hireFreelancer = async (req, res) => {
    try {
        const { proposalId } = req.body;
        const proposal = await Proposal.findById(proposalId).populate('projectId');

        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Proposal not found' });
        }

        if (proposal.projectId.clientId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the project owner can hire' });
        }

        const amount = proposal.bidAmount;
        const platformCommission = amount * 0.15; // 15% commission
        const freelancerPayout = amount - platformCommission;

        // Create Razorpay Order
        const options = {
            amount: amount * 100, // in paise
            currency: 'INR',
            receipt: `escrow_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Create Contract
        const contract = await Contract.create({
            projectId: proposal.projectId._id,
            clientId: req.user.id,
            freelancerId: proposal.freelancerId,
            amount,
            platformCommission,
            freelancerPayout,
            status: 'active',
            escrowStatus: 'pending'
        });

        // Create Escrow Transaction record
        await EscrowTransaction.create({
            contractId: contract._id,
            amount,
            platformFee: platformCommission,
            freelancerAmount: freelancerPayout,
            razorpayOrderId: order.id,
            status: 'pending'
        });

        // Update Proposal Status
        proposal.status = 'accepted';
        await proposal.save();

        // Close project for new proposals
        await Project.findByIdAndUpdate(proposal.projectId._id, { status: 'in-progress' });

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            contractId: contract._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyEscrowPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, contractId } = req.body;

        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // Update Contract and Transaction
        await Contract.findByIdAndUpdate(contractId, { escrowStatus: 'funded' });
        await EscrowTransaction.findOneAndUpdate(
            { razorpayOrderId },
            { status: 'held', razorpayPaymentId }
        );

        res.status(200).json({ success: true, message: 'Payment verified and funds held in escrow' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitWork = async (req, res) => {
    try {
        const { contractId, content, fileUrl } = req.body;
        const contract = await Contract.findById(contractId);

        if (!contract || contract.freelancerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        contract.workSubmission = {
            content,
            fileUrl,
            submittedAt: new Date()
        };
        await contract.save();

        res.status(200).json({ success: true, message: 'Work submitted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const Message = require('../models/Message.model');

// ... (previous code)

exports.releaseEscrow = async (req, res) => {
    try {
        const { contractId } = req.body;
        const contract = await Contract.findById(contractId);

        if (!contract || contract.clientId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the client can release escrow' });
        }

        contract.escrowStatus = 'released';
        contract.status = 'completed';
        contract.completedAt = new Date();
        await contract.save();

        await EscrowTransaction.findOneAndUpdate(
            { contractId },
            { status: 'released', releasedAt: new Date() }
        );

        // Update Project status
        if (contract.projectId) {
            await Project.findByIdAndUpdate(contract.projectId, { status: 'completed' });
        }

        // Update Freelancer stats
        await FreelancerProfile.findOneAndUpdate(
            { userId: contract.freelancerId },
            { $inc: { totalEarnings: contract.freelancerPayout } }
        );

        res.status(200).json({ success: true, message: 'Escrow released to freelancer' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Dashboards & Active Work ---

exports.getMyJobs = async (req, res) => {
    try {
        const contracts = await Contract.find({ freelancerId: req.user.id })
            .populate('clientId', 'name')
            .populate('projectId', 'title')
            .populate('gigId', 'title')
            .sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: contracts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ clientId: req.user.id }).sort({ createdAt: -1 });
        const contracts = await Contract.find({ clientId: req.user.id })
            .populate('freelancerId', 'name')
            .populate('projectId', 'title')
            .populate('gigId', 'title')
            .sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: { projects, contracts } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Messaging ---

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content, contractId, attachment } = req.body;
        const message = await Message.create({
            senderId: req.user.id,
            receiverId,
            content,
            contractId,
            attachment
        });
        res.status(201).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { otherUserId, contractId } = req.query;
        let query = {
            $or: [
                { senderId: req.user.id, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: req.user.id }
            ]
        };
        if (contractId) query.contractId = contractId;

        const messages = await Message.find(query).sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
