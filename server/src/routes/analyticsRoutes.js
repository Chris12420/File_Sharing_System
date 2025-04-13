const express = require('express');
const router = express.Router();

// Mock data for page views
const pageViewsData = [
  { name: 'Mar 25', value: 166 },
  { name: 'Mar 26', value: 120 },
  { name: 'Mar 27', value: 145 },
  { name: 'Mar 28', value: 156 },
  { name: 'Mar 29', value: 182 },
  { name: 'Mar 30', value: 210 },
  { name: 'Mar 31', value: 195 },
];

// Mock data for user interactions
const userInteractionsData = [
  { action: 'Upload', count: 245 },
  { action: 'Download', count: 689 },
  { action: 'Share', count: 178 },
  { action: 'Delete', count: 92 },
];


const fileTypeDistribution = [
  { name: 'Documents', value: 65 },
  { name: 'Images', value: 20 },
  { name: 'Videos', value: 10 },
  { name: 'Audio', value: 5 },
];



// GET /api/analytics/page-views
router.get('/page-views', (req, res) => {
  res.json(pageViewsData);
});

// GET /api/analytics/user-interactions
router.get('/user-interactions', (req, res) => {
  res.json(userInteractionsData);
});

// GET /api/analytics/file-type-distribution
router.get('/file-type-distribution', (req, res) => {
  res.json(fileTypeDistribution);
});


module.exports = router;