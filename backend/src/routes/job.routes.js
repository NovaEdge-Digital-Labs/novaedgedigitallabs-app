const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const premiumController = require('../controllers/premiumSeeker.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Protected
router.use(protect);
router.post('/apply', jobController.applyToJob);
router.get('/my/applications', jobController.getMyApplications);

// Premium
router.post('/premium/order', premiumController.createPremiumOrder);
router.post('/premium/verify', premiumController.verifyPremium);
router.get('/premium/status', premiumController.getPremiumStatus);

module.exports = router;
