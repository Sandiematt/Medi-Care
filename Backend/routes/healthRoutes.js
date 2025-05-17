const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// Function to setup routes with collections
const setupRoutes = (healthCollection) => {
  // Health vitals routes
  router.get('/healthvitals/:username', (req, res) => 
    healthController.getHealthVitals(req, res, healthCollection));
  
  router.post('/healthvitals/:username', (req, res) => 
    healthController.saveHealthVitals(req, res, healthCollection));
  
  return router;
};

module.exports = setupRoutes; 