require('dotenv').config({ path: 'E:\\Medi_Care\\.env' }); 
const express = require('express');
require('dotenv').config();
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

  // Default route
  app.get('/', (req, res) => {
    res.send('API is running...');
  });

// User login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await usersCollection.findOne({ username });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // You should ideally use bcrypt to compare the password securely
    if (user.password !== password) {
      return res.status(404).json({ error: 'Incorrect Password' });
    }

    // Include the username in the response
    res.status(200).json({ 
      message: 'Login successful', 
      isAdmin: user.isadmin, 
      username: user.username // Include username
    });
  } catch (error) {
    console.error('Error during login:', error);
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
      username, email, contact, age, gender, password
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
    
    // Remove any undefined or empty fields
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || updates[key] === '') {
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
      res.status(404).json({ error: 'Health vitals not found for this user' });
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
      const { name, description, days, times, totalDoses } = req.body;

      if (!name || !description || !days || !times || totalDoses === undefined) {
        return res.status(400).json({ message: 'All fields are required' });
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
    const inventoryItems = await inventoryCollection.find().toArray(); // Fetch all items
    res.status(200).json(inventoryItems);
  } catch (error) {
    console.error('Error fetching inventory:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/stats', async (req, res) => {
  try {
    // Fetch total items in the database
    const totalItems = await inventoryCollection.countDocuments();

    // Count items with low stock (inStock < 5 but > 0)
    const lowStock = await inventoryCollection.countDocuments({ inStock: { $lt: 5, $gt: 0 } });

    // Count items that are out of stock (inStock === 0)
    const outOfStock = await inventoryCollection.countDocuments({ inStock: 0 });

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


app.post('/inventory', async (req, res) => {
  try {
    const { name, price, stock, type } = req.body;

    // Validate required fields
    if (!name || !price || !stock || !type) {
      return res.status(400).json({ 
        message: 'All fields are required (name, price, stock, type)' 
      });
    }

    // Create new inventory item
    const newItem = {
      name,
      price: parseFloat(price),
      inStock: parseInt(stock),
      type,
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


app.post('/logout', (req, res) => {
    // For token-based auth, you might blacklist the token (using a database or in-memory storage)
    res.status(200).json({ message: 'User logged out successfully' });
  });
  
  // Start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {  // Explicitly bind to 0.0.0.0
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

// Start the main function
main().catch((err) => console.error(err));
