const { ObjectId } = require('mongodb');

// Create prescription
const createPrescription = async (req, res, prescriptionsCollection) => {
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

    const result = await prescriptionsCollection.insertOne(prescription);
    res.status(200).json({
      message: 'Prescription saved successfully',
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Error saving prescription:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get prescriptions by username
const getUserPrescriptions = async (req, res, prescriptionsCollection) => {
  try {
    const prescriptions = await prescriptionsCollection
      .find({ username: req.params.username })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete prescription
const deletePrescription = async (req, res, prescriptionsCollection) => {
  try {
    const result = await prescriptionsCollection
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single prescription
const getPrescription = async (req, res, prescriptionsCollection) => {
  try {
    const prescription = await prescriptionsCollection
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPrescription,
  getUserPrescriptions,
  deletePrescription,
  getPrescription
}; 