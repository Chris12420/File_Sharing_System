const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Route to create a new user
router.post('/', userController.createUser);

// Route for user login
router.post('/login', userController.loginUser);

// Route to get all users
router.get('/', userController.getAllUsers);

// Route to delete a user
router.delete('/:id', userController.deleteUser);

// Route to update a user
router.put('/:id', userController.updateUser);

// Add other user routes here (e.g., GET user by ID, update user, delete user)

module.exports = router; 