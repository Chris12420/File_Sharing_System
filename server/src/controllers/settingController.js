const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Update user profile (username, email)
// @route   PUT /api/settings/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user.id; // From isAuthenticated middleware

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if username or email is being updated and if it's already taken
  if (username && username !== user.username) {
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      res.status(400);
      throw new Error('Username already exists');
    }
    user.username = username;
  }

  if (email && email !== user.email) {
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      res.status(400);
      throw new Error('Email already exists');
    }
    user.email = email;
  }

  const updatedUser = await user.save();

  // Return updated user info (excluding password)
  // Also update the session user info if needed
  const updatedSessionUser = {
      id: updatedUser._id,
      username: updatedUser.username,
      role: updatedUser.role
      // Add email if you store it in session
  };
  req.session.user = updatedSessionUser; 

  res.status(200).json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
  });
});

// @desc    Update user password
// @route   PUT /api/settings/password
// @access  Private
const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Both current and new password are required');
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if current password matches
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(401); // Unauthorized
    throw new Error('Incorrect current password');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();

  res.status(200).json({ message: 'Password updated successfully' });
});

module.exports = {
  updateUserProfile,
  updateUserPassword,
}; 
 
 