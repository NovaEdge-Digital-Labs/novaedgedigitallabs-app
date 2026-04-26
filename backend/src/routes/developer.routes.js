const express = require('express');
const router = express.Router();
const {
    getApiKey,
    regenerateApiKey,
    getApiUsageStats
} = require('../controllers/developer.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/key', protect, getApiKey);
router.post('/key/regenerate', protect, regenerateApiKey);
router.get('/stats', protect, getApiUsageStats);

module.exports = router;
