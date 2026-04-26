const Lead = require('../models/Lead.model');
const transporter = require('../config/mailer');

/**
 * @desc    Submit a general lead (Contact Us)
 * @route   POST /api/leads/submit
 * @access  Public
 */
exports.submitLead = async (req, res, next) => {
    try {
        const { name, email, phone, service, message, budget } = req.body;

        if (!name || !email || !phone || !service || !message) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Phone based rate limit (max 3 per day)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const count = await Lead.countDocuments({
            phone,
            createdAt: { $gte: startOfDay }
        });

        if (count >= 3) {
            return res.status(429).json({ success: false, message: 'Too many submissions for this phone number today' });
        }

        const lead = await Lead.create({
            name, email, phone, service, message, budget, source: 'app'
        });

        // Send Email to Admin
        const adminEmail = process.env.ADMIN_EMAIL || 'novaedgedigitallabs@gmail.com';
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: `New Lead from App: ${name} - ${service}`,
            html: `
                <h3>New Lead Details</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
                <p><strong>Message:</strong> ${message}</p>
                <p><strong>Status:</strong> New</p>
                <p><strong>Source:</strong> Mobile App</p>
            `
        };

        // Send confirmation to Client
        const clientMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Thank you for contacting NovaEdge Digital Labs",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #007AFF;">Hello ${name},</h2>
                    <p>Thank you for reaching out to <strong>NovaEdge Digital Labs</strong>. We have received your inquiry regarding <strong>${service}</strong>.</p>
                    <p>Our team will review your requirements and get back to you within <strong>24 business hours</strong>.</p>
                    <br/>
                    <p>Best Regards,</p>
                    <p><strong>NovaEdge Digital Labs Team</strong></p>
                    <p><a href="https://novaedge.tech">novaedge.tech</a></p>
                </div>
            `
        };

        // Fire and forget emails (or use Promise.all)
        transporter.sendMail(adminMailOptions).catch(err => console.error('Admin Email Error:', err));
        transporter.sendMail(clientMailOptions).catch(err => console.error('Client Email Error:', err));

        res.status(201).json({
            success: true,
            message: 'We will contact you within 24 hours!'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a Quote request
 * @route   POST /api/leads/get-quote
 * @access  Public
 */
exports.getQuote = async (req, res, next) => {
    try {
        const { name, email, phone, service, budget, message, projectType, deadline, hasExistingDesign } = req.body;

        const lead = await Lead.create({
            name, email, phone, service, budget, message,
            source: 'quote-request',
            projectType, deadline, hasExistingDesign
        });

        // Similar email logic...
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || 'novaedgedigitallabs@gmail.com',
            subject: `QUOTE REQUEST: ${name} - ${service}`,
            html: `
                <h3>Quote Request Details</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Project:</strong> ${service}</p>
                <p><strong>Details:</strong> ${message}</p>
                <p><strong>Budget:</strong> ${budget}</p>
                <p><strong>Deadline:</strong> ${deadline || 'N/A'}</p>
            `
        };
        transporter.sendMail(adminMailOptions).catch(err => console.error('Admin Quote Email Error:', err));

        res.status(201).json({
            success: true,
            estimatedResponse: '2-4 business hours'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get All Leads
 * @route   GET /api/leads/all
 * @access  Private/Admin
 */
exports.getAllLeads = async (req, res, next) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leads });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update Lead Status
 * @route   PUT /api/leads/:id/status
 * @access  Private/Admin
 */
exports.updateStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            { status, notes },
            { new: true }
        );

        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};
