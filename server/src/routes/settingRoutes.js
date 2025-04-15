const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Apply authentication middleware to all setting routes
router.use(isAuthenticated);

// Route to update user profile (username, email)
router.put('/profile', settingController.updateUserProfile);

// Route to update user password
router.put('/password', settingController.updateUserPassword);

module.exports = router; 