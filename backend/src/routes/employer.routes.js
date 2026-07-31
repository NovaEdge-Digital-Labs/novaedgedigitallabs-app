const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employer.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/profile', employerController.createCompanyProfile);
router.get('/profile', employerController.getCompanyProfile);

router.post('/job/order', employerController.createJobOrder);
router.post('/job/publish', employerController.publishJob);

router.get('/applicants', employerController.getEmployerApplicants);
router.patch('/applicants/:id/status', employerController.updateApplicantStatus);

router.get('/jobs', employerController.getMyPostedJobs);
router.put('/job/:id', employerController.updateEmployerJob);
router.delete('/job/:id', employerController.deleteEmployerJob);

module.exports = router;
