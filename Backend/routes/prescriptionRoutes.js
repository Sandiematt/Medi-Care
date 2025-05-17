const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

// Function to setup routes with collections
const setupRoutes = (prescriptionsCollection) => {
  // Create prescription
  router.post('/prescriptions', (req, res) => 
    prescriptionController.createPrescription(req, res, prescriptionsCollection));
  
  // Get prescriptions by username
  router.get('/prescriptions/:username', (req, res) => 
    prescriptionController.getUserPrescriptions(req, res, prescriptionsCollection));
  
  // Delete prescription
  router.delete('/prescriptions/:id', (req, res) => 
    prescriptionController.deletePrescription(req, res, prescriptionsCollection));
  
  // Get single prescription
  router.get('/prescriptions/detail/:id', (req, res) => 
    prescriptionController.getPrescription(req, res, prescriptionsCollection));
  
  return router;
};

module.exports = setupRoutes; 