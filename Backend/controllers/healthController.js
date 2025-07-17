// Get health vitals for a user
const getHealthVitals = async (req, res, healthCollection) => {
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
};

// Save health vitals for a user
const saveHealthVitals = async (req, res, healthCollection) => {
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
};

module.exports = {
  getHealthVitals,
  saveHealthVitals
}; 