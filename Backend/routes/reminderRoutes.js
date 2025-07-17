const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

// Function to setup routes with collections
const setupRoutes = (remindersCollection) => {
  // Add reminder
  router.post('/addReminder', (req, res) => 
    reminderController.addReminder(req, res, remindersCollection));
  
  // Get user reminders
  router.get('/reminders/:username', (req, res) => 
    reminderController.getUserReminders(req, res, remindersCollection));
  
  // Delete reminder
  router.delete('/reminders/:id', (req, res) => 
    reminderController.deleteReminder(req, res, remindersCollection));
  
  // Get all reminders (admin)
  router.get('/reminders', (req, res) => 
    reminderController.getAllReminders(req, res, remindersCollection));
  
  // Update reminder (mark as completed)
  router.patch('/reminders/:id', (req, res) => 
    reminderController.updateReminder(req, res, remindersCollection));
  
  // API reminder endpoint
  router.get('/api/remind/:username', (req, res) => 
    reminderController.getApiRemind(req, res, remindersCollection));
  
  return router;
};

module.exports = setupRoutes; 