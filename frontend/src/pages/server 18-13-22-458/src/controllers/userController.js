const bcrypt = require('bcrypt');
const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Log the request body for debugging
    console.log('Request to create user with data:');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Role:', role); // This is what we're particularly interested in
    console.log('Password provided:', password ? 'Yes (not logged for security)' : 'No');

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    console.log('Attempting to save user with ID:', newUser._id);
    await newUser.save();
    console.log('User saved successfully to database with ID:', newUser._id);

    // Return user without password
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user - FULL ERROR:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.errors) console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    res.status(500).json({ message: 'Error creating user' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Passwords match, create session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    // Return success response (or user details without password)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    console.log('Attempting to fetch all users from the database');
    const users = await User.find({}, { password: 0 }); // Exclude password field
    console.log(`Found ${users.length} users in the database:`, JSON.stringify(users.map(u => ({ id: u._id, username: u.username, email: u.email, role: u.role })), null, 2));
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users - FULL ERROR:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Attempting to delete user with ID: ${id}`);
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      console.log(`User with ID ${id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`User with ID ${id} successfully deleted`);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;
    
    console.log(`Attempting to update user with ID: ${id}`);
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      console.log(`User with ID ${id} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username or email already exists (if they are being changed)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already in use' });
      }
    }
    
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Prepare update object
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log(`User with ID ${id} successfully updated`);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  deleteUser,
  updateUser
}; 