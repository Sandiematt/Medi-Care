const { ObjectId } = require('mongodb');

// Add Reminder
const addReminder = async (req, res, remindersCollection) => {
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
};

// Get reminders for a user
const getUserReminders = async (req, res, remindersCollection) => {
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
};

// Delete reminder
const deleteReminder = async (req, res, remindersCollection) => {
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
};

// Get all reminders (admin function)
const getAllReminders = async (req, res, remindersCollection) => {
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
};

// Update Reminder (Mark as completed)
const updateReminder = async (req, res, remindersCollection) => {
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
};

// Get API remind endpoint
const getApiRemind = async (req, res, remindersCollection) => {
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
};

module.exports = {
  addReminder,
  getUserReminders,
  deleteReminder,
  getAllReminders,
  updateReminder,
  getApiRemind
}; 