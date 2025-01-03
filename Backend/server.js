require('dotenv').config({ path: 'E:/Medi_Care/.env' }); 
const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const app = express();


app.use(express.json());

// MongoDB connection function
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);  // Use URI from .env
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
  const remindersCollection = db.collection('reminders');  // Specify collection name

  // Default route
  app.get('/', (req, res) => {
    res.send('API is running...');
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

  // Start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {  // Explicitly bind to 0.0.0.0
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

// Start the main function
main().catch((err) => console.error(err));
