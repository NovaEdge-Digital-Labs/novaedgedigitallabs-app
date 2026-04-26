const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateUser } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkAdmin } = require('../middleware/admin.middleware');

// All routes here require authentication and admin privileges
router.use(protect);
router.use(checkAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/user/:id', updateUser);

module.exports = router;
