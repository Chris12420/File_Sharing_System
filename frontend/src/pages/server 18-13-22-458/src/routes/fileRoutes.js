const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// All file routes require authentication
router.use(isAuthenticated);

// Upload a file
router.post('/upload', fileController.uploadFile);

// Get all files
router.get('/', fileController.getAllFiles);

// Download a file by ID
router.get('/download/:id', fileController.downloadFile);

// Delete a file by ID
router.delete('/:id', fileController.deleteFile);

module.exports = router; 