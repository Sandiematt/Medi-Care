const fs = require('fs');
const axios = require('axios');

// Detect counterfeit medicines
const detectCounterfeit = async (req, res) => {
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
};

module.exports = {
  detectCounterfeit
}; 