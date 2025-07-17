const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { connectDB } = require('./config/db');
const { ObjectId } = require('mongodb');

// Import route setups
const setupAuthRoutes = require('./routes/authRoutes');
const setupHealthRoutes = require('./routes/healthRoutes');
const setupReminderRoutes = require('./routes/reminderRoutes');
const setupInventoryRoutes = require('./routes/inventoryRoutes');
const setupPrescriptionRoutes = require('./routes/prescriptionRoutes');
const setupMedicineRoutes = require('./routes/medicineRoutes');
const setupDetectRoutes = require('./routes/detectRoutes');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '50mb',
  parameterLimit: 100000
}));

// API Routes
const main = async () => {
  const client = await connectDB();
  const db = client.db();  

  // Initialize collections
  const remindersCollection = db.collection('reminders');
  const usersCollection = db.collection('users');
  const healthCollection = db.collection('healthvitals');
  const prescriptionsCollection = db.collection('prescriptions');
  const inventoryCollection = db.collection('inventory');
  const medicineCollection = db.collection('medicines');

  // Default route
  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  // Setup routes with their respective collections
  app.use(setupAuthRoutes(usersCollection));
  app.use(setupHealthRoutes(healthCollection));
  app.use(setupReminderRoutes(remindersCollection));
  app.use(setupInventoryRoutes(inventoryCollection));
  app.use(setupPrescriptionRoutes(prescriptionsCollection));
  app.use(setupMedicineRoutes(medicineCollection));
  app.use(setupDetectRoutes());
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on:`);
    console.log(`- http://localhost:${PORT}`);
    console.log(`- http://127.0.0.1:${PORT}`);
  });
};

// Start the main function
main().catch((err) => console.error(err));

// emualator ip address http://10.0.2.2:5000
// http://10.0.2.2:5000