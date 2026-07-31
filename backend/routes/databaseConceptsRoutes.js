const express = require('express');
const router = express.Router();
const {
    simulateAcidTransaction,
    simulateCapTheorem,
    analyzeNormalization,
    simulateIndexing,
    simulateTransactionsConcurrency
} = require('../controllers/databaseConceptsController');

// Database Engineering & Concepts Routes
router.post('/acid', simulateAcidTransaction);
router.post('/cap', simulateCapTheorem);
router.post('/normalization', analyzeNormalization);
router.post('/indexing', simulateIndexing);
router.post('/transactions', simulateTransactionsConcurrency);

module.exports = router;
