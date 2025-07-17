const express = require('express');
const router = express.Router();
const detectController = require('../controllers/detectController');
const { upload } = require('../middleware/upload');

// Function to setup routes
const setupRoutes = () => {
  // Counterfeit detection route
  router.post('/detect-counterfeit', upload.single('image'), detectController.detectCounterfeit);
  
  return router;
};

module.exports = setupRoutes; 