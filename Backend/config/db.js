const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

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

module.exports = { connectDB }; 