const Group = require('../models/Group');
const User = require('../models/User');
const File = require('../models/File');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @desc    Get groups for the logged-in user
// @route   GET /api/groups
// @access  Private
const getUserGroups = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Find groups where the user is listed in the members array
  // Select only the necessary fields for the list view
  const groups = await Group.find({ 'members.user': userId })
                          .select('_id name') // Select only id and name for the list
                          .sort({ name: 1 }); // Optional: sort alphabetically

  if (!groups) {
    // This case is unlikely with find(), it would return [] if none found,
    // but good practice to handle potential null/undefined if logic changes.
    res.status(404).json({ message: 'Could not retrieve groups.' });
    return;
  }

  res.status(200).json(groups); // Return the array of groups
});

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; // User ID from isAuthenticated middleware

  if (!name || name.trim().length === 0) {
    res.status(400);
    throw new Error('Group name cannot be empty');
  }

  // Find the user creating the group
  const user = await User.findById(userId);
  if (!user) {
    res.status(404); // Or 401 if session somehow becomes invalid
    throw new Error('User not found');
  }

  // Create the group
  const group = await Group.create({
    name: name.trim(),
    owner: userId,
    members: [{ user: userId, role: 'admin' }] // Add owner as admin
  });

  if (group) {
    // Add the group reference to the user's groups array
    user.groups.push(group._id);
    await user.save();

    // Populate owner and member details before sending response (optional but helpful)
    const populatedGroup = await Group.findById(group._id)
        .populate('owner', 'id username') // Populate owner field
        .populate('members.user', 'id username'); // Populate user in members array

    res.status(201).json(populatedGroup);
  } else {
    res.status(400);
    throw new Error('Invalid group data or failed to create group');
  }
});

// @desc    Get details for a specific group
// @route   GET /api/groups/:groupId
// @access  Private (User must be a member)
const getGroupDetails = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    res.status(400);
    throw new Error('Invalid group ID format');
  }

  // Find the group and populate owner and members
  const group = await Group.findById(groupId)
                         .populate('owner', 'id username')
                         .populate('members.user', 'id username'); // Populate user field within members array

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  // Check if the requesting user is a member of the group
  const isMember = group.members.some(member => member.user._id.toString() === userId);
  if (!isMember) {
    res.status(403); // Forbidden - User is not a member
    throw new Error('You do not have permission to access this group');
  }

  // Find files associated with this group
  const files = await File.find({ groupId: groupId })
                        .populate('ownerId', 'id username') // Populate owner info for each file
                        .sort({ createdAt: -1 }); // Sort by newest first

  // Return the group details and associated files
  res.status(200).json({
    group: group,
    files: files,
  });
});

// @desc    Update group details
// @route   PUT /api/groups/:groupId
// @access  Private (Owner/Admin only)
const updateGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  // TODO: Find group, verify user is owner/admin, update group name
  res.status(501).json({ message: 'updateGroup not implemented' });
});

// @desc    Delete a group
// @route   DELETE /api/groups/:groupId
// @access  Private (Owner only)
const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  // TODO: Find group, verify user is owner, delete group, remove group ref from users, delete associated files?
  res.status(501).json({ message: 'deleteGroup not implemented' });
});

// @desc    Add a member to a group
// @route   POST /api/groups/:groupId/members
// @access  Private (Admin only)
const addMember = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  // Expecting email or username in the body to find the user to add
  const { identifier, role } = req.body; 
  const requesterId = req.user.id;

  // Validate Group ID
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    res.status(400);
    throw new Error('Invalid group ID format');
  }

  if (!identifier) {
    res.status(400);
    throw new Error('User identifier (email or username) is required');
  }

  // Find the group
  const group = await Group.findById(groupId);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  // Authorization: Check if the requester is an admin
  const requesterMembership = group.members.find(member => member.user.toString() === requesterId);
  if (!requesterMembership || requesterMembership.role !== 'admin') {
    res.status(403);
    throw new Error('Only group admins can add members');
  }

  // Find the user to add by identifier (email or username)
  const userToAdd = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
  });
  if (!userToAdd) {
    res.status(404);
    throw new Error(`User with identifier "${identifier}" not found`);
  }

  // Check if the user is already a member
  const isAlreadyMember = group.members.some(member => member.user.toString() === userToAdd._id.toString());
  if (isAlreadyMember) {
    res.status(400);
    throw new Error('User is already a member of this group');
  }

  // Add the user to the group's members array
  group.members.push({ user: userToAdd._id, role: role || 'member' });
  
  // Add the group to the user's groups array
  userToAdd.groups.push(group._id);

  // Save both documents concurrently (or sequentially if preferred)
  await Promise.all([group.save(), userToAdd.save()]);

  // Respond with the updated members list (or just success)
  const updatedGroup = await Group.findById(groupId)
                              .populate('members.user', 'id username'); // Repopulate members
  
  res.status(200).json(updatedGroup.members);
});

// @desc    Remove a member from a group
// @route   DELETE /api/groups/:groupId/members/:userId
// @access  Private (Admin only)
const removeMember = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params; // userId is the user to remove
  const requesterId = req.user.id;

  // TODO: Find group, verify requester is admin, remove member, update removed user's group list
  res.status(501).json({ message: 'removeMember not implemented' });
});

// @desc    Upload a file to a group
// @route   POST /api/groups/:groupId/files
// @access  Private (Member only)
const uploadGroupFile = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // TODO: Find group, verify user is member, save file details to DB with groupId
  res.status(501).json({ message: 'uploadGroupFile not implemented' });
});


module.exports = {
  getUserGroups,
  createGroup,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  uploadGroupFile,
}; 