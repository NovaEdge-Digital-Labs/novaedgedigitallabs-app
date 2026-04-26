const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', courseController.getAllCourses);
router.get('/my-courses', protect, courseController.getMyCourses);
router.get('/:id', protect, courseController.getCourseById);
router.post('/enroll', protect, courseController.enrollInCourse);
router.post('/verify-payment', protect, courseController.verifyCoursePayment);

module.exports = router;
