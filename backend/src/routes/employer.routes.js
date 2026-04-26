const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employer.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/profile', employerController.createCompanyProfile);
router.get('/profile', employerController.getCompanyProfile);

router.post('/job/order', employerController.createJobOrder);
router.post('/job/publish', employerController.publishJob);

module.exports = router;
