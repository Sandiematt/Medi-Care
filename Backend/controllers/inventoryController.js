const { ObjectId } = require('mongodb');

// Get inventory items
const getInventory = async (req, res, inventoryCollection) => {
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
};

// Get single inventory item
const getInventoryItem = async (req, res, inventoryCollection) => {
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
};

// Update inventory item
const updateInventoryItem = async (req, res, inventoryCollection) => {
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
};

// Delete inventory item
const deleteInventoryItem = async (req, res, inventoryCollection) => {
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
};

// Create inventory item
const createInventoryItem = async (req, res, inventoryCollection) => {
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
};

// Get inventory statistics
const getInventoryStats = async (req, res, inventoryCollection) => {
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
};

module.exports = {
  getInventory,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createInventoryItem,
  getInventoryStats
}; 