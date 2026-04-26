const Course = require('../models/Course.model');
const CoursePurchase = require('../models/CoursePurchase.model');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().select('-lectures.videoUrl'); // Hide video URLs until purchased
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get course by ID (with restricted lecture access)
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if user has purchased the course
        const isEnrolled = await CoursePurchase.findOne({
            userId: req.user._id,
            courseId: req.params.id,
            status: 'completed'
        });

        const courseData = course.toObject();

        // If not enrolled, hide full video URLs except for free previews
        if (!isEnrolled) {
            courseData.lectures = courseData.lectures.map(lecture => {
                if (!lecture.freePreview) {
                    return { ...lecture, videoUrl: null };
                }
                return lecture;
            });
        }

        res.status(200).json({ success: true, data: courseData, isEnrolled: !!isEnrolled });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Razorpay order for course
exports.enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if already purchased
        const existingPurchase = await CoursePurchase.findOne({
            userId: req.user._id,
            courseId,
            status: 'completed'
        });

        if (existingPurchase) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
        }

        const options = {
            amount: course.price * 100, // in paise
            currency: 'INR',
            receipt: `course_${courseId}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Save pending purchase
        await CoursePurchase.findOneAndUpdate(
            { userId: req.user._id, courseId },
            {
                amount: course.price,
                razorpayOrderId: order.id,
                status: 'pending'
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify payment for course
exports.verifyCoursePayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            const purchase = await CoursePurchase.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: 'completed'
                },
                { new: true }
            );

            if (purchase) {
                // Increment enrolled count
                await Course.findByIdAndUpdate(purchase.courseId, { $inc: { enrolledCount: 1 } });
            }

            res.status(200).json({ success: true, message: 'Enrolled successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get my courses
exports.getMyCourses = async (req, res) => {
    try {
        const purchases = await CoursePurchase.find({
            userId: req.user._id,
            status: 'completed'
        }).populate('courseId');

        const courses = purchases.map(p => p.courseId).filter(c => c != null);
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
