const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Public download route (NO authentication)
router.get('/public/:id', fileController.downloadPublicFile);

// All other file routes require authentication
router.use(isAuthenticated);

// Upload a file
router.post('/upload', fileController.uploadFile);

// Get all files
router.get('/', fileController.getAllFiles);

// Download a file by ID
router.get('/download/:id', fileController.downloadFile);

// Delete a file by ID
router.delete('/:id', fileController.deleteFile);

// Toggle public sharing status
router.put('/:id/share', fileController.toggleSharing);

module.exports = router; 