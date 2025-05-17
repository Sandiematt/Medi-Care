const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Function to setup routes with collections
const setupRoutes = (inventoryCollection) => {
  // Get all inventory items for a user
  router.get('/inventory', (req, res) => 
    inventoryController.getInventory(req, res, inventoryCollection));
  
  // Get single inventory item
  router.get('/inventory/:id', (req, res) => 
    inventoryController.getInventoryItem(req, res, inventoryCollection));
  
  // Update inventory item
  router.put('/inventory/:id', (req, res) => 
    inventoryController.updateInventoryItem(req, res, inventoryCollection));
  
  // Delete inventory item
  router.delete('/inventory/:id', (req, res) => 
    inventoryController.deleteInventoryItem(req, res, inventoryCollection));
  
  // Create inventory item
  router.post('/inventory', (req, res) => 
    inventoryController.createInventoryItem(req, res, inventoryCollection));
  
  // Get inventory statistics
  router.get('/stats', (req, res) => 
    inventoryController.getInventoryStats(req, res, inventoryCollection));
  
  return router;
};

module.exports = setupRoutes; 