const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController.js'); // 引入控制器

// GET /api/analytics/page-views
router.get('/page-views', analyticsController.getPageViews);

// GET /api/analytics/user-interactions
router.get('/user-interactions', analyticsController.getUserInteractions);

// GET /api/analytics/file-type-distribution
router.get('/file-type-distribution', analyticsController.getFileTypeDistribution);


// Increment PageView for the current day
router.post('/page-view', analyticsController.incrementPageView);

module.exports = router;