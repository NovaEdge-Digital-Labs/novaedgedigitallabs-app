const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplace.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/gigs', marketplaceController.getAllGigs);
router.get('/projects', marketplaceController.getAllProjects);
router.get('/profile/:userId', marketplaceController.getFreelancerProfile);

// Protected routes
router.use(protect);

router.post('/profile', marketplaceController.createFreelancerProfile);
router.get('/profile', marketplaceController.getFreelancerProfile);

router.post('/gigs', marketplaceController.createGig);
router.post('/projects', marketplaceController.createProject);

router.post('/proposals', marketplaceController.submitProposal);
router.get('/projects/:projectId/proposals', marketplaceController.getProjectProposals);

router.post('/hire', marketplaceController.hireFreelancer);
router.post('/verify-escrow', marketplaceController.verifyEscrowPayment);
router.post('/submit-work', marketplaceController.submitWork);
router.post('/release-escrow', marketplaceController.releaseEscrow);

router.get('/my-jobs', marketplaceController.getMyJobs);
router.get('/my-projects', marketplaceController.getMyProjects);

router.post('/messages', marketplaceController.sendMessage);
router.get('/messages', marketplaceController.getMessages);

module.exports = router;
