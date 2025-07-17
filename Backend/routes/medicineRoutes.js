const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

// Function to setup routes with collections
const setupRoutes = (medicineCollection) => {
  // Search medicines
  router.get('/search', (req, res) => 
    medicineController.searchMedicines(req, res, medicineCollection));
  
  // Get single medicine
  router.get('/api/medicine', (req, res) => 
    medicineController.getMedicine(req, res, medicineCollection));
  
  return router;
};

module.exports = setupRoutes; 