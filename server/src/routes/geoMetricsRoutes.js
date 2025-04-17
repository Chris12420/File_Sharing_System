const express = require('express');
const router = express.Router();
const geographicalMetricsController = require('../controllers/geographicalMetricsController');

// Get geographical metrics aggregated by country
router.get('/countries', geographicalMetricsController.getCountryMetrics);

// Get geographical metrics aggregated by city
router.get('/cities', geographicalMetricsController.getCityMetrics);

// Get browser usage statistics
router.get('/browsers', geographicalMetricsController.getBrowserStats);

// Get device type statistics
router.get('/devices', geographicalMetricsController.getDeviceStats);

// Get summary of all metrics data
router.get('/summary', geographicalMetricsController.getMetricsSummary);

// Store new geographical metrics data
router.post('/store', geographicalMetricsController.storeMetrics);

module.exports = router; 