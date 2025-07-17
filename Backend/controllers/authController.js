const fs = require('fs');
const { ObjectId } = require('mongodb');

// User login endpoint
const login = async (req, res, usersCollection) => {
  try {
    const { username, password } = req.body;
    const user = await usersCollection.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
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
};

// Google Sign-In endpoint
const googleLogin = async (req, res, usersCollection) => {
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
};

// User registration endpoint
const register = async (req, res, usersCollection) => {
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
};

// Get user profile
const getUserProfile = async (req, res, usersCollection) => {
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
};

// Update user profile
const updateUserProfile = async (req, res, usersCollection) => {
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
};

// Get current user data
const getCurrentUser = async (req, res, usersCollection) => {
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
};

// Upload profile image
const uploadProfileImage = async (req, res, usersCollection) => {
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
};

// Get user profile with profile photo
const getUserProfileWithPhoto = async (req, res, usersCollection) => {
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
};

// Logout user
const logout = (req, res) => {
  // For token-based auth, you might blacklist the token (using a database or in-memory storage)
  res.status(200).json({ message: 'User logged out successfully' });
};

module.exports = {
  login,
  googleLogin,
  register,
  getUserProfile,
  updateUserProfile,
  getCurrentUser,
  uploadProfileImage,
  getUserProfileWithPhoto,
  logout
}; 