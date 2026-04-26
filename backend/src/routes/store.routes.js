const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const purchaseController = require('../controllers/purchase.controller');
const downloadController = require('../controllers/download.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// Product Routes
router.get('/', productController.getAllProducts);
router.get('/:id', optionalAuth, productController.getProductDetails);
router.post('/:id/review', protect, productController.submitReview);

// Purchase Routes
router.post('/purchase', protect, purchaseController.createOrder);
router.post('/verify', protect, purchaseController.verifyPayment);
router.get('/my-purchases', protect, purchaseController.getUserPurchases);

// Download Route
router.get('/:productId/download', protect, downloadController.downloadProduct);

module.exports = router;
