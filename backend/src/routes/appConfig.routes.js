const express = require('express');
const router = express.Router();
const appConfigController = require('../controllers/appConfig.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkAdmin } = require('../middleware/admin.middleware');

// Public route to fetch configuration
router.get('/', appConfigController.getConfig);
router.get('/stats', appConfigController.getStats);

// Admin route to update configuration
router.put('/', protect, checkAdmin, appConfigController.updateConfig);

module.exports = router;
