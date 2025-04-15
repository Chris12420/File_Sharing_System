const mongoose = require('mongoose');
const { Schema } = require('mongoose');

// Define possible user roles
const USER_ROLES = ['admin', 'user'];

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: USER_ROLES,
    default: 'user'
  },
  groups: [{
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }]
}, {
  timestamps: true, // This will add createdAt and updatedAt fields
  collection: 'users' // Explicitly set the collection name
});

const User = mongoose.model('User', userSchema);

module.exports = User; 