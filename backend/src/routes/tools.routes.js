const express = require('express');
const router = express.Router();
const {
    compressImage,
    generateQR,
    calculateGST,
    calculateEMI,
    generateInvoice,
    getUsageStats
} = require('../controllers/tools.controller');
const { protect } = require('../middleware/auth.middleware');
const checkPlan = require('../middleware/checkPlan.middleware');
const upload = require('../config/multer');

router.post('/compress-image', protect, upload.single('image'), compressImage);
router.post('/generate-qr', protect, generateQR);
router.post('/calculate-gst', calculateGST);
router.post('/calculate-emi', calculateEMI);
router.post('/generate-invoice', protect, generateInvoice); // Logic for free limit handled in controller
router.get('/usage-stats', protect, getUsageStats);

module.exports = router;
