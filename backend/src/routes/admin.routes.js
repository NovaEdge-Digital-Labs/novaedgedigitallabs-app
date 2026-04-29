const express = require('express');
const router = express.Router();
const {
    getStats,
    getUsers,
    updateUser,
    getPlatformConfig,
    updatePlatformConfig,
    getAnalytics,
    refreshAnalytics,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteUser,
    createUser,
    getAdminApiKeys,
    createAdminApiKey,
    revokeAdminApiKey,
    getAdminServices,
    createService,
    updateService,
    deleteService,
    getAdminCourses,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkAdmin } = require('../middleware/admin.middleware');

// All routes here require authentication and admin privileges
router.use(protect);
router.use(checkAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);
router.post('/user', createUser);
router.get('/platform-config', getPlatformConfig);
router.put('/platform-config', updatePlatformConfig);
router.get('/analytics', getAnalytics);
router.post('/analytics/refresh', refreshAnalytics);

// Product management
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// API Key management
router.get('/api-keys', getAdminApiKeys);
router.post('/api-keys', createAdminApiKey);
router.delete('/api-keys/:id', revokeAdminApiKey);

// Service management
router.get('/services', getAdminServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Course (Academy) management
router.get('/courses', getAdminCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

module.exports = router;
