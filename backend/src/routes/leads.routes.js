const express = require('express');
const router = express.Router();
const {
    submitLead,
    getQuote,
    getAllLeads,
    updateStatus
} = require('../controllers/leads.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkAdmin } = require('../middleware/admin.middleware');
const { leadRateLimit } = require('../middleware/rateLimit.middleware');

router.post('/submit', leadRateLimit, submitLead);
router.post('/get-quote', leadRateLimit, getQuote);

// Admin Only
router.get('/all', protect, checkAdmin, getAllLeads);
router.put('/:id/status', protect, checkAdmin, updateStatus);

module.exports = router;
