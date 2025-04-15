const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Apply authentication middleware to all group routes
router.use(isAuthenticated);

// --- Group Routes ---

// Get all groups the user is a member of
router.get('/', groupController.getUserGroups);

// Create a new group
router.post('/', groupController.createGroup);

// --- Specific Group Routes ---

// Get details for a specific group
router.get('/:groupId', groupController.getGroupDetails);

// Update group details (e.g., name)
router.put('/:groupId', groupController.updateGroup);

// Delete a group
router.delete('/:groupId', groupController.deleteGroup);

// --- Group Member Routes ---

// Add a member to the group
router.post('/:groupId/members', groupController.addMember);

// Remove a member from the group
router.delete('/:groupId/members/:userId', groupController.removeMember);

// --- Group File Routes ---

// Upload a file to the group
router.post('/:groupId/files', upload.single('file'), groupController.uploadGroupFile);

// Get files for a specific group (Could be part of getGroupDetails or separate)
// router.get('/:groupId/files', groupController.getGroupFiles);

module.exports = router; 