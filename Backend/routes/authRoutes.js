const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { upload } = require('../middleware/upload');

// Function to setup routes with collections
const setupRoutes = (usersCollection) => {
  // Login routes
  router.post('/login', (req, res) => authController.login(req, res, usersCollection));
  router.post('/google-login', (req, res) => authController.googleLogin(req, res, usersCollection));
  router.post('/logout', (req, res) => authController.logout(req, res));
  
  // User registration
  router.post('/register', (req, res) => authController.register(req, res, usersCollection));
  
  // User profile routes
  router.get('/users/:username', (req, res) => authController.getUserProfile(req, res, usersCollection));
  router.put('/users/:username', (req, res) => authController.updateUserProfile(req, res, usersCollection));
  router.get('/api/current-user/:username', (req, res) => authController.getCurrentUser(req, res, usersCollection));
  router.post('/users/:username/upload-profile-image', upload.single('image'), (req, res) => 
    authController.uploadProfileImage(req, res, usersCollection));
  router.get('/api/users/:username/profile', (req, res) => authController.getUserProfileWithPhoto(req, res, usersCollection));
  
  return router;
};

module.exports = setupRoutes; 