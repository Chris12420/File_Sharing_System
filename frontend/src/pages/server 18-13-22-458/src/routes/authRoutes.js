const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createUser } = require('../controllers/userController');

// Registration route
router.post('/register', createUser);

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { username: req.body.username });
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        success: false,
        message: 'Username and password are required' 
      });
    }

    // Find user by username
    const user = await User.findOne({ username });
    console.log('User found:', user ? 'yes' : 'no');
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password' 
      });
    }

    // Set user in session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    console.log('Login successful for user:', user.username);
    
    res.json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check authentication status
router.get('/check', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    res.json({ message: 'Logout successful' });
  });
});

module.exports = router; 