const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');

const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const app = express();


app.use(express.json());

// MongoDB connection function
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);  
    await client.connect();
    console.log('MongoDB connected successfully');
    return client;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);  // Exit process with failure on connection failure
  }
};

// API Routes
const main = async () => {
  const client = await connectDB();
  const db = client.db();  
  const remindersCollection = db.collection('reminders');
  const usersCollection = db.collection('users');  // Specify collection name
  const healthCollection = db.collection('healthvitals');  // Specify collection name
  const prescriptionsCollection = db.collection('prescriptions');  // Specify collection name
  const inventoryCollection=db.collection('inventory');
  const medicationCollecton=db.collection('medicines')

  // Default route
  app.get('/', (req, res) => {
    res.send('API is running...');
  });

// User login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await usersCollection.findOne({ username });
    
    if (!user) {return res.status(404).json({ error: 'User not found' });}
    
    // You should ideally use bcrypt to compare the password securely
    if (user.password !== password) {
      return res.status(404).json({ error: 'Incorrect Password' });
    }

    // Include the username in the response
    res.status(200).json({ 
      message: 'Login successful',
      isAdmin: user.isadmin,
      username: user.username, // Include username
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google Sign-In endpoint
app.post('/google-login', async (req, res) => {
  try {
    const { email, googleId, displayName } = req.body;
    
    console.log('Google login request received:', { email, googleId, displayName });
    
    // Check if user exists with this email
    let user = await usersCollection.findOne({ email });
    
    if (!user) {
      // Create a new user following the schema pattern from the existing users
      const newUser = {
        username: displayName || email.split('@')[0], // Use display name or extract from email
        email,
        contact: "", // Empty string as placeholder
        age: "", // Empty string as placeholder
        gender: "", // Empty string as placeholder
        googleId, // Store Google ID for future reference
        password: "", // Empty since Google Auth doesn't use password
        image: null // Profile image set to null initially
      };
      
      const result = await usersCollection.insertOne(newUser);
      user = newUser;
      console.log('New Google user created:', result.insertedId);
    } else {
      // Update existing user's Google ID if needed
      if (!user.googleId) {
        await usersCollection.updateOne(
          { email },
          { $set: { googleId } }
        );
      }
    }
    
    // Return user information matching your regular login response pattern
    res.status(200).json({ 
      message: 'Login successful',
      isAdmin: user.isadmin || false,
      username: user.username, // Include username
    });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, email, contact, age, gender, password } = req.body;
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    
    // Insert new user
    const result = await usersCollection.insertOne({
      username, 
      email, 
      contact, 
      age, 
      gender, 
      password, 
      image: null, // Set image field to null by default
    });
    res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await usersCollection.findOne({ username });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Update user profile endpoint
// BACKEND - server.js or routes/users.js
app.put('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const updates = req.body;
    
    // Remove any undefined fields, but KEEP empty strings
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    // Only update if there are valid fields to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updatedUser = await usersCollection.findOneAndUpdate(
      { username: username },
      { $set: updates },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Fetch health vitals for a user
app.get('/healthvitals/:username', async (req, res) => {
  try {
    const username = req.params.username;
    // Fetch health vitals for the user from the healthvitals collection
    const healthVitals = await healthCollection.findOne({ username });

    if (healthVitals) {
      res.status(200).json(healthVitals);
    } else {
      // Return empty default values instead of 404 error
      res.status(200).json({ 
        username: username,
        bloodpressure: '',
        heartrate: '',
        bloodgroup: '',
        height: '',
        weight: ''
      });
    }
  } catch (error) {
    console.error('Error fetching health vitals:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/healthvitals/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const healthVitals = req.body;

    // Use findOneAndUpdate to update or insert the health vitals
    const updatedVitals = await healthCollection.findOneAndUpdate(
      { username }, // Find by username
      { $set: healthVitals }, // Update with new health vitals
      { returnDocument: 'after', upsert: true } // Return the updated document and create if it doesn't exist
    );

    res.status(200).send({ 
      message: 'Health vitals saved successfully!', 
      data: updatedVitals.value // Return the updated or inserted document
    });
  } catch (error) {
    console.error('Error saving health vitals:', error);
    res.status(500).json({ error: 'Failed to save health vitals' });
  }
});


  // Add Reminder API
app.post('/addReminder', async (req, res) => {
  try {
    const { username, name, description, days, times, totalDoses } = req.body;
    
    // Add username to required fields validation
    if (!username || !name || !description || !days || !times || totalDoses === undefined) {
      return res.status(400).json({ 
        message: 'All fields are required including username' 
      });
    }
    
    const updatedTimes = times.map(time => {
      const completedForDays = {};
      days.forEach(day => {
        completedForDays[day] = false;
      });
      return { ...time, completed: completedForDays };
    });
    
    const completed = {};
    days.forEach(day => {
      completed[day] = false;
    });
    
    const newReminder = {
      username, // Store the username with the reminder
      name,
      description,
      days,
      times: updatedTimes,
      totalDoses,
      completed,
      createdAt: new Date(),
    };
    
    const result = await remindersCollection.insertOne(newReminder);
    
    res.status(201).json({
      message: 'Reminder added successfully',
      reminderId: result.insertedId,
    });
  } catch (error) {
    console.error('Error adding reminder:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a new endpoint to get reminders for a specific user
app.get('/reminders/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    const reminders = await remindersCollection.find({ username }).toArray();
    
    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete Reminder API
app.delete('/reminders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.query; // Get username from query parameters for authorization
    
    if (!id) {
      return res.status(400).json({ message: 'Reminder ID is required' });
    }
    
    // Find the reminder first to check if it belongs to the user
    const reminder = await remindersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    
    // Optional: Verify the user owns this reminder (if you want to enforce this security)
    if (username && reminder.username !== username) {
      return res.status(403).json({ message: 'You do not have permission to delete this reminder' });
    }
    
    // Delete the reminder
    const result = await remindersCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(400).json({ message: 'Failed to delete the reminder' });
    }
    
    res.status(200).json({
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reminder:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

  // Get Reminders API
  app.get('/reminders', async (req, res) => {
    try {
      const reminders = await remindersCollection.find().toArray();
      const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' });

      const updatedReminders = reminders.map((reminder) => {
        reminder.times = reminder.times.map(timeObj => {
          if (timeObj.completed && timeObj.completed[currentDay]) {
            timeObj.completed[currentDay] = true;  
          }
          return timeObj;
        });

        const allTimesCompletedForDay = reminder.times.every(timeObj => timeObj.completed[currentDay] === true);
        reminder.completed = allTimesCompletedForDay ? { [currentDay]: true } : reminder.completed;

        return reminder;
      });

      res.status(200).json(updatedReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update Reminder API
  app.patch('/reminders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { time, days } = req.body;  

      const day = Array.isArray(days) ? days[0] : days;  
      
      const reminder = await remindersCollection.findOne({ _id: new ObjectId(id) });
      
      if (!reminder) {
        return res.status(404).json({ message: 'Reminder not found' });
      }

      const timeObjIndex = reminder.times.findIndex(t => t.time === time);
      if (timeObjIndex === -1) {
        return res.status(404).json({ message: 'Time not found' });
      }

      reminder.times[timeObjIndex].completed[day] = true;

      const allTimesCompletedForDay = reminder.times.every(t => t.completed[day] === true);

      const result = await remindersCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            [`times.${timeObjIndex}.completed.${day}`]: true,
            [`completed.${day}`]: allTimesCompletedForDay ? true : reminder.completed[day],
          }
        }
      );

      if (result.modifiedCount > 0) {
        res.status(200).json({
          message: `Reminder marked as completed for the day (${day}).`,
          reminder,
          allTimesCompletedForDay
        });
      } else {
        res.status(404).json({ message: 'Failed to update reminder. No modification occurred.' });
      }
    } catch (error) {
      console.error('Error updating reminder:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  // Inventory API
  // API to fetch inventory items
  app.get('/inventory', async (req, res) => {
    try {
      const { username } = req.query;
      
      if (!username) {
        return res.status(400).json({ message: 'Username is required' });
      }
      
      // Find only inventory items created by this user
      const items = await inventoryCollection.find({ createdBy: username }).toArray();
      
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching inventory items:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // API to get single inventory item by ID
  app.get('/inventory/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: 'Item ID is required' });
      }
      
      const item = await inventoryCollection.findOne({ _id: new ObjectId(id) });
      
      if (!item) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      
      res.status(200).json(item);
    } catch (error) {
      console.error('Error fetching inventory item:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // API to update inventory item
  app.put('/inventory/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, inStock, type, username } = req.body;
      
      // Validate required fields
      if (!name || price === undefined || inStock === undefined || !type) {
        return res.status(400).json({
          message: 'All fields are required (name, price, inStock, type)'
        });
      }
      
      // Validate user is logged in
      if (!username) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }
      
      // Find the existing item to verify ownership
      const existingItem = await inventoryCollection.findOne({ _id: new ObjectId(id) });
      
      if (!existingItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      
      // Verify the user owns this item
      if (existingItem.createdBy !== username) {
        return res.status(403).json({ message: 'You do not have permission to update this item' });
      }
      
      // Update the item
      const result = await inventoryCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            name,
            price: parseFloat(price),
            inStock: parseInt(inStock),
            type,
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(400).json({ message: 'No changes were made to the item' });
      }
      
      res.status(200).json({
        message: 'Inventory item updated successfully',
        itemId: id
      });
    } catch (error) {
      console.error('Error updating inventory item:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // API to delete inventory item
  app.delete('/inventory/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { username } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Item ID is required' });
      }
      
      // Validate user is logged in
      if (!username) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }
      
      // Find the existing item to verify ownership
      const existingItem = await inventoryCollection.findOne({ _id: new ObjectId(id) });
      
      if (!existingItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      
      // Verify the user owns this item
      if (existingItem.createdBy !== username) {
        return res.status(403).json({ message: 'You do not have permission to delete this item' });
      }
      
      // Delete the item
      const result = await inventoryCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return res.status(400).json({ message: 'Failed to delete the item' });
      }
      
      res.status(200).json({
        message: 'Inventory item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.post('/inventory', async (req, res) => {
  try {
    const { name, price, stock, type, username } = req.body;
    
    // Validate required fields
    if (!name || !price || !stock || !type) {
      return res.status(400).json({
        message: 'All fields are required (name, price, stock, type)'
      });
    }
    
    // Validate user is logged in
    if (!username) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }
    
    // Create new inventory item with username
    const newItem = {
      name,
      price: parseFloat(price),
      inStock: parseInt(stock),
      type,
      createdBy: username,
      createdAt: new Date()
    };
    
    const result = await inventoryCollection.insertOne(newItem);
    
    res.status(201).json({
      message: 'Inventory item added successfully',
      itemId: result.insertedId,
      item: newItem
    });
  } catch (error) {
    console.error('Error adding inventory item:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/stats', async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    // Add filter by username (createdBy field)
    const filter = { createdBy: username };
    
    // Fetch total items for this user
    const totalItems = await inventoryCollection.countDocuments(filter);

    // Count items with low stock (inStock < 5 but > 0) for this user
    const lowStock = await inventoryCollection.countDocuments({ 
      ...filter, 
      inStock: { $gt: 0, $lte: 10 } 
    });

    // Count items that are out of stock (inStock === 0) for this user
    const outOfStock = await inventoryCollection.countDocuments({ 
      ...filter, 
      inStock: 0 
    });

    // Return statistics as an object
    res.status(200).json({
      totalItems,
      lowStock,
      outOfStock,
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ message: 'Error fetching inventory stats', error });
  }
});

// If you're sending base64 image data
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({
  extended: true,
  limit: '50mb',
  parameterLimit: 100000
}));

app.post('/prescriptions', async (req, res) => {
  try {
    const prescription = {
      username: req.body.username,
      name: req.body.name,
      medication: req.body.medication,
      doctor: req.body.doctor,
      hospital: req.body.hospital,
      description: req.body.description,
      date: req.body.date,
      image: req.body.image,
      createdAt: new Date()
    };

    const result = await db.collection('prescriptions').insertOne(prescription);
    res.status(200).json({
      message: 'Prescription saved successfully',
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Error saving prescription:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET prescriptions by username
app.get('/prescriptions/:username', async (req, res) => {
  try {
    const prescriptions = await db
      .collection('prescriptions')
      .find({ username: req.params.username })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE prescription
app.delete('/prescriptions/:id', async (req, res) => {
  try {
    const result = await db
      .collection('prescriptions')
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single prescription
app.get('/prescriptions/detail/:id', async (req, res) => {
  try {
    const prescription = await db
      .collection('prescriptions')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ error: error.message });
  }
});




// Search endpoint
app.get('/search', async (req, res) => {
  const { query } = req.query;  // Expecting 'query' parameter from the request

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required.' });
  }

  try {
    // Search the database for medicines matching the query
    const medicines = await medicationCollecton.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Case-insensitive match for name
        { imprint: { $regex: query, $options: 'i' } }, // Case-insensitive match for imprint
      ]
    }).toArray(); // Use toArray() instead of lean()

    // Convert _id to string
    const formattedMedicines = medicines.map(medicine => ({
      ...medicine,
      _id: medicine._id.toString()
    }));

    // If no results found
    if (formattedMedicines.length === 0) {
      return res.status(404).json({ message: 'No medicines found.' });
    }

    // Return the list of matching medicines
    res.json(formattedMedicines);
  } catch (error) {
    console.error('Error searching for medicine:', error);
    res.status(500).json({ message: 'Server error while searching for medicine.' });
  }
});

app.get('/api/medicine', async (req, res) => {
  try {
      const { query } = req.query;

      // Basic input validation
      if (!query || typeof query !== 'string') {
          return res.status(400).json({ 
              message: 'Invalid query parameter. Query must be a non-empty string.' 
          });
      }

      const sanitizedQuery = query.trim();

      // Search in both name and imprint fields
      const medicine = await medicationCollecton.findOne({
          $or: [
              { name: { $regex: sanitizedQuery, $options: 'i' } },
              { imprint: { $regex: sanitizedQuery, $options: 'i' } }
          ]
      });

      if (!medicine) {
          return res.status(404).json({ 
              message: `No medicine found matching "${sanitizedQuery}"` 
          });
      }

      // Format the response
      const formattedMedicine = {
          ...medicine,
          _id: medicine._id.toString(),
          'image ': medicine['image '] ? medicine['image '].trim() : null
      };

      res.json(formattedMedicine);

  } catch (error) {
      console.error('Error fetching medicine:', error);
      res.status(500).json({ 
          message: 'Server error occurred while fetching medicine data'
      });
  }
});

 // Add this new endpoint to get current user data
 app.get('/api/current-user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const user = await usersCollection.findOne(
      { username },
      { projection: { password: 0 } } // Exclude password from the response
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        contact: user.contact,
        age: user.age,
        gender: user.gender,
        isAdmin: user.isadmin
      }
    });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
});

app.get('/api/remind/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const reminders = await remindersCollection.find({ username }).toArray();
    res.json({
      success: true,
      reminders: reminders
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reminders'
    });
  }
});

//main
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// Set up multer with the storage configuration
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Make sure upload directory exists
if (!fs.existsSync("uploads/")) {
  fs.mkdirSync("uploads/");
}

app.post("/detect-counterfeit", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    
    console.log("File received:", req.file);
    
    // Read the uploaded image file and convert it to base64
    const imageBase64 = fs.readFileSync(req.file.path, {
      encoding: "base64"
    });
    
    // Send request to Roboflow API
    const response = await axios({
      method: "POST",
      url: "https://detect.roboflow.com/fake-med/1",
      params: {
        api_key: "WRHcEkNdWcTa1wqzfGQs"
      },
      data: imageBase64,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    
    // Log the full API response for debugging
    console.log("Full API response:", JSON.stringify(response.data, null, 2));
    
    // Initialize result with default values - EXPLICITLY set isCounterfeit to false
    let result = {
      isCounterfeit: false,
      confidence: 0,
      currencyType: null,
      denomination: null,
      features: []
    };
    
    const predictions = response.data.predictions || [];
    
    if (predictions.length > 0) {
      // Get highest confidence prediction
      const topPrediction = predictions.reduce((prev, current) => 
        (prev.confidence > current.confidence) ? prev : current
      );
      
      console.log("Top prediction class:", topPrediction.class);
      console.log("Top prediction confidence:", topPrediction.confidence);
      
      // Store confidence regardless of class
      result.confidence = topPrediction.confidence;
      
      // SIMPLE LOGIC: Only mark as counterfeit if class is EXACTLY "counterfeit"
      // For any other class (including "authentic"), keep isCounterfeit as false
      if (topPrediction.class === "counterfeit") {
        result.isCounterfeit = true;
        console.log("DETECTED AS COUNTERFEIT");
      } else {
        result.isCounterfeit = false;
        console.log("NOT DETECTED AS COUNTERFEIT - class is:", topPrediction.class);
      }
      
      // Add any feature points if available
      if (topPrediction.points) {
        result.features = topPrediction.points.map(point => point.class);
      }
    }
    
    console.log("Final result being sent:", result);
    
    // Delete temp file
    fs.unlinkSync(req.file.path);
    
    // Send result
    return res.json(result);
    
  } catch (error) {
    console.error("Error in counterfeit detection:", error);
    
    if (error.response) {
      console.error("API error details:", {
        data: error.response.data,
        status: error.response.status
      });
    }
    
    return res.status(500).json({
      error: "Failed to process image",
      message: error.message
    });
  }
});


app.post('/logout', (req, res) => {
    // For token-based auth, you might blacklist the token (using a database or in-memory storage)
    res.status(200).json({ message: 'User logged out successfully' });
  });

    // User profile image upload endpoint
app.post('/users/:username/upload-profile-image', upload.single('image'), async (req, res) => {
  console.log('Received profile image upload request for user:', req.params.username);
  
  try {
    const { username } = req.params;
    
    // Log request details
    console.log('Request headers:', JSON.stringify(req.headers));
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Request file:', req.file ? 'File received' : 'No file received');
    
    if (!req.file) {
      console.error('No file was uploaded in the request');
      return res.status(400).json({ 
        success: false, 
        error: 'No image uploaded' 
      });
    }
    
    console.log('Received file details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
    
    try {
      // Read the uploaded image file and convert it to base64
      const imageBase64 = fs.readFileSync(req.file.path, {
        encoding: 'base64'
      });
      
      // Create the image data URL
      const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;
      console.log('Image converted to base64, length:', imageBase64.length);
      
      // Find the user first to verify they exist
      const userExists = await usersCollection.findOne({ username });
      if (!userExists) {
        console.error(`User not found: ${username}`);
        // Clean up the file if it exists
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
      
      // Update user document with the image
      const result = await usersCollection.findOneAndUpdate(
        { username },
        { $set: { image: imageData } },
        { returnDocument: 'after' }
      );
      
      // Delete temp file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (!result) {
        console.error(`User update failed: ${username}`);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to update user profile' 
        });
      }
      
      console.log(`Profile image updated successfully for: ${username}`);
      return res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully'
      });
    } catch (fileError) {
      console.error('Error processing file:', fileError);
      
      // Attempt to clean up the uploaded file if it exists
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Error processing the uploaded image'
      });
    }
  } catch (error) {
    console.error('Error in profile image upload:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while uploading profile image'
    });
  }
});


// GET user profile including profile photo
app.get('/api/users/:username/profile', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Query MongoDB for the user
    const user = await usersCollection.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Return profile data, mapping 'image' to 'profilePhoto' for the client
    return res.json({
      success: true,
      username: user.username,
      name: user.name,
      profilePhoto: user.image || null  // Map your existing 'image' field to 'profilePhoto'
    });
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});
  
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

// http://20.193.156.237:5000