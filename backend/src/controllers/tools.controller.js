const sharp = require('sharp');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User.model');
const ToolUsage = require('../models/ToolUsage.model');
const trackUsage = require('../utils/trackUsage');
const fs = require('fs');

/**
 * @desc    Compress Image
 * @route   POST /api/tools/compress-image
 * @access  Private
 */
exports.compressImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image' });
        }

        const user = await User.findById(req.user.id);
        const limit = user.plan === 'free' ? 10 : -1;

        // Track usage
        await trackUsage(user._id, 'compress', limit);

        const compressedImageBuffer = await sharp(req.file.path)
            .resize({ width: 1500, withoutEnlargement: true })
            .jpeg({ quality: 75 })
            .toBuffer();

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'novaedge/compressed', resource_type: 'image' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(compressedImageBuffer);
        });

        res.status(200).json({
            success: true,
            originalSize: req.file.size,
            compressedSize: result.bytes,
            compressionRatio: ((1 - result.bytes / req.file.size) * 100).toFixed(2) + '%',
            url: result.secure_url
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Generate QR Code
 * @route   POST /api/tools/generate-qr
 * @access  Private
 */
exports.generateQR = async (req, res, next) => {
    try {
        const { text, size = 300, color = '#000000', bgColor = '#FFFFFF', custom } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: 'Text is required' });
        }

        // Validate size (max 1000px to avoid DoS)
        const qrSize = Math.min(Math.max(parseInt(size) || 300, 100), 1000);

        // Validate hex colors
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        const qrColor = hexRegex.test(color) ? color : '#000000';
        const qrBgColor = hexRegex.test(bgColor) ? bgColor : '#FFFFFF';

        const user = await User.findById(req.user.id);

        if (custom && user.plan !== 'business') {
            return res.status(403).json({ success: false, message: 'Custom QR with logo is available for Business plan only' });
        }

        const limit = user.plan === 'free' ? 5 : -1;
        await trackUsage(user._id, 'qr', limit);

        const qrBase64 = await QRCode.toDataURL(text, {
            width: qrSize,
            margin: 2,
            color: {
                dark: qrColor,
                light: qrBgColor
            }
        });

        res.status(200).json({
            success: true,
            qrBase64,
            size: qrSize
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Calculate GST
 * @route   POST /api/tools/calculate-gst
 * @access  Public
 */
exports.calculateGST = async (req, res, next) => {
    try {
        const { amount, gstRate, type = 'exclusive' } = req.body;

        if (amount === undefined || gstRate === undefined) {
            return res.status(400).json({ success: false, message: 'Amount and GST rate are required' });
        }

        const numAmount = parseFloat(amount);
        const numGstRate = parseFloat(gstRate);

        if (isNaN(numAmount) || isNaN(numGstRate)) {
            return res.status(400).json({ success: false, message: 'Amount and GST rate must be numbers' });
        }

        let baseAmount, gstAmount, totalAmount;

        if (type === 'exclusive') {
            baseAmount = numAmount;
            gstAmount = (numAmount * numGstRate) / 100;
            totalAmount = numAmount + gstAmount;
        } else {
            totalAmount = numAmount;
            baseAmount = numAmount / (1 + numGstRate / 100);
            gstAmount = totalAmount - baseAmount;
        }

        res.status(200).json({
            success: true,
            baseAmount: baseAmount.toFixed(2),
            cgst: (gstAmount / 2).toFixed(2),
            sgst: (gstAmount / 2).toFixed(2),
            igst: gstAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            gstRate: numGstRate
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Calculate EMI
 * @route   POST /api/tools/calculate-emi
 * @access  Public
 */
exports.calculateEMI = async (req, res, next) => {
    try {
        const { principal, annualRate, tenureMonths } = req.body;

        if (!principal || !annualRate || !tenureMonths) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const numPrincipal = parseFloat(principal);
        const numAnnualRate = parseFloat(annualRate);
        const numTenure = parseInt(tenureMonths);

        if (isNaN(numPrincipal) || isNaN(numAnnualRate) || isNaN(numTenure) || numPrincipal <= 0 || numAnnualRate <= 0 || numTenure <= 0) {
            return res.status(400).json({ success: false, message: 'Please provide valid positive numbers for all fields' });
        }

        const r = annualRate / (12 * 100); // monthly interest rate
        const n = tenureMonths;

        const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalAmount = emi * n;
        const totalInterest = totalAmount - principal;

        // Amortization schedule (first 3 months)
        const schedule = [];
        let balance = principal;
        for (let i = 1; i <= Math.min(3, n); i++) {
            const interest = balance * r;
            const principalComp = emi - interest;
            balance -= principalComp;
            schedule.push({
                month: i,
                emi: emi.toFixed(2),
                interest: interest.toFixed(2),
                principal: principalComp.toFixed(2),
                balance: Math.max(0, balance).toFixed(2)
            });
        }

        res.status(200).json({
            success: true,
            emi: emi.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            totalInterest: totalInterest.toFixed(2),
            schedule
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Generate Invoice PDF
 * @route   POST /api/tools/generate-invoice
 * @access  Private (PRO/Business or Free limit)
 */
exports.generateInvoice = async (req, res, next) => {
    try {
        const { invoiceNo, clientName, clientEmail, clientAddress, items, gstRate = 18, notes } = req.body;

        if (!invoiceNo || !clientName || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid invoice data' });
        }

        // Validate items
        for (const item of items) {
            if (!item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
                return res.status(400).json({ success: false, message: 'Each item must have a name, price, and quantity' });
            }
        }

        const numGstRate = parseFloat(gstRate);
        if (isNaN(numGstRate) || numGstRate < 0) {
            return res.status(400).json({ success: false, message: 'Invalid GST rate' });
        }

        const user = await User.findById(req.user.id);

        // Handle monthly reset for invoice tool
        let usage = await ToolUsage.findOne({ userId: user._id, toolName: 'invoice' });
        if (!usage) {
            usage = await ToolUsage.create({ userId: user._id, toolName: 'invoice' });
        }

        const today = new Date();
        const lastReset = new Date(usage.lastResetDate);
        if (today.getMonth() !== lastReset.getMonth() || today.getFullYear() !== lastReset.getFullYear()) {
            usage.usageCount = 0;
            usage.lastResetDate = today;
        }

        if (user.plan === 'free' && usage.usageCount >= 3) {
            return res.status(403).json({ success: false, message: 'Monthly limit of 3 invoices reached for Free plan. Please upgrade to Pro.' });
        }

        usage.usageCount += 1;
        await usage.save();

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const gst = (subtotal * gstRate) / 100;
        const total = subtotal + gst;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #007AFF; padding-bottom: 20px; }
                .logo { font-size: 28px; font-weight: bold; color: #007AFF; }
                .client-info { margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                th { background: #f8f8f8; text-align: left; padding: 12px; }
                td { padding: 12px; border-bottom: 1px solid #eee; }
                .totals { margin-top: 30px; text-align: right; }
                .total-row { font-size: 18px; font-weight: bold; color: #007AFF; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="logo">NovaEdge Digital Labs</div>
                    <p>contact@novaedge.tech</p>
                </div>
                <div style="text-align: right">
                    <h1>INVOICE</h1>
                    <p>#${invoiceNo}</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <div class="client-info">
                <h3>Bill To:</h3>
                <p><strong>${clientName}</strong></p>
                <p>${clientEmail}</p>
                <p>${clientAddress || ''}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price}</td>
                            <td>₹${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="totals">
                <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
                <p>GST (${gstRate}%): ₹${gst.toFixed(2)}</p>
                <p class="total-row">Total: ₹${total.toFixed(2)}</p>
            </div>
            ${notes ? `<div style="margin-top: 40px"><p><strong>Notes:</strong> ${notes}</p></div>` : ''}
        </body>
        </html>
        `;

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        // Upload PDF to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'novaedge/invoices', resource_type: 'raw', format: 'pdf' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(pdfBuffer);
        });

        res.status(200).json({
            success: true,
            invoiceUrl: result.secure_url,
            invoiceNo
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Usage Stats
 * @route   GET /api/tools/usage-stats
 * @access  Private
 */
exports.getUsageStats = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const usage = await ToolUsage.find({ userId: req.user.id });

        const stats = {
            compress: { used: 0, limit: user.plan === 'free' ? 10 : -1 },
            qr: { used: 0, limit: user.plan === 'free' ? 5 : -1 },
            invoice: { used: 0, limit: user.plan === 'free' ? 3 : -1 }
        };

        usage.forEach(record => {
            if (stats[record.toolName]) {
                // For daily tools, check if last reset was today
                const today = new Date().toDateString();
                const lastReset = new Date(record.lastResetDate).toDateString();

                if (record.toolName === 'invoice') {
                    // For monthly, check month/year
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    const resetMonth = new Date(record.lastResetDate).getMonth();
                    const resetYear = new Date(record.lastResetDate).getFullYear();

                    if (currentMonth === resetMonth && currentYear === resetYear) {
                        stats[record.toolName].used = record.usageCount;
                    }
                } else if (today === lastReset) {
                    stats[record.toolName].used = record.usageCount;
                }
            }
        });

        res.status(200).json({
            success: true,
            plan: user.plan,
            stats
        });
    } catch (error) {
        next(error);
    }
};
