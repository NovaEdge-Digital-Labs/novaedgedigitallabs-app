const express = require('express');
const router = express.Router();
const {
    compressImage,
    generateQR,
    calculateGST,
    calculateEMI,
    generateInvoice
} = require('../controllers/tools.controller');
const {
    getJobs,
    getCourses,
    getGigs,
    getProducts
} = require('../controllers/apiV1.controller');
const apiKeyAuth = require('../middleware/apiKeyAuth.middleware');
const upload = require('../config/multer');

// Apply API Key authentication to all v1 routes
router.use(apiKeyAuth);

router.post('/tools/compress-image', upload.single('image'), compressImage);
router.post('/tools/generate-qr', generateQR);
router.post('/tools/calculate-gst', calculateGST);
router.post('/tools/calculate-emi', calculateEMI);
router.post('/tools/generate-invoice', generateInvoice);

// Data Endpoints
router.get('/jobs', getJobs);
router.get('/academy', getCourses);
router.get('/marketplace', getGigs);
router.get('/store', getProducts);

module.exports = router;
