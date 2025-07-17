// Search medicines
const searchMedicines = async (req, res, medicineCollection) => {
  const { query } = req.query;  // Expecting 'query' parameter from the request

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required.' });
  }

  try {
    // Search the database for medicines matching the query
    const medicines = await medicineCollection.find({
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
};

// Get single medicine
const getMedicine = async (req, res, medicineCollection) => {
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
    const medicine = await medicineCollection.findOne({
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
};

module.exports = {
  searchMedicines,
  getMedicine
}; 