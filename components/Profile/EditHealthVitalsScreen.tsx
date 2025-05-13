import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions // Import Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure this library is installed
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure this library is installed
import axios from 'axios'; // Ensure this library is installed

// Interface for navigation prop (adjust based on your navigation library if needed)
interface Props {
  navigation: any;
}

// Main component for editing health vitals
const EditHealthVitalsScreen: React.FC<Props> = ({ navigation }) => {
  // State variables for form inputs
  const [bloodpressure, setBloodPressure] = useState('');
  const [heartrate, setHeartrate] = useState('');
  const [bloodgroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // State variables for loading and saving status
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Fetch existing health vitals when the component mounts
  useEffect(() => {
    const fetchHealthVitals = async () => {
      setLoading(true); // Start loading indicator
      try {
        // Retrieve username from storage
        const storedUsername = await AsyncStorage.getItem('username');
        if (!storedUsername) {
          // Handle case where username is not found
          Alert.alert('Error', 'User session not found. Please log in again.');
          // Optionally navigate back to login screen: navigation.navigate('Login');
          setLoading(false);
          return; // Exit if no username
        }

        // Fetch health vitals from the API
        // *** IMPORTANT: Replace with your actual API endpoint ***
        const response = await axios.get(`http://20.193.156.237:500/healthvitals/${storedUsername}`);
        const data = response.data;

        // Update state with fetched data, providing empty strings as fallbacks
        setBloodPressure(data.bloodpressure || '');
        setHeartrate(data.heartrate || '');
        setBloodGroup(data.bloodgroup || '');
        setHeight(data.height || '');
        setWeight(data.weight || '');

      } catch (err: any) {
        // Handle errors during fetching
        console.error('Error fetching health vitals:', err);
        // Optionally show a user-friendly error message
        // Alert.alert('Error', 'Could not load health vitals. Please check your connection.');
        // Reset fields on error to avoid showing stale data
        setBloodPressure('');
        setHeartrate('');
        setBloodGroup('');
        setHeight('');
        setWeight('');
      } finally {
        // Stop loading indicator regardless of success or failure
        setLoading(false);
      }
    };

    fetchHealthVitals();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to save the updated health vitals
  const saveDetails = async () => {
    // Prevent multiple save attempts while one is in progress
    if (saving) return;

    setSaving(true); // Start saving indicator
    try {
      // Retrieve username from storage again
      const storedUsername = await AsyncStorage.getItem('username');
      if (!storedUsername) {
        throw new Error('Username not found in storage.');
      }

      // Prepare the data payload for the API
      const payload = { bloodpressure, heartrate, bloodgroup, height, weight };

      // Send POST request to the API to save/update data
      // *** IMPORTANT: Replace with your actual API endpoint ***
      const response = await axios.post(`http://20.193.156.237:500/healthvitals/${storedUsername}`, payload);

      // Check if the request was successful (status code 2xx)
      if (response.status >= 200 && response.status < 300) {
        Alert.alert('Success', 'Health vitals saved successfully!');
        navigation.goBack(); // Navigate back to the previous screen
      } else {
        // Handle unexpected server responses
        throw new Error(`Unexpected server response: ${response.status}`);
      }
    } catch (error: any) {
      // Handle errors during saving
      console.error('Error saving health vitals:', error);
      Alert.alert('Error', 'Failed to save health vitals. Please try again.');
    } finally {
      // Stop saving indicator regardless of success or failure
      setSaving(false);
    }
  };

  // Function to handle navigation back
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Display loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={styles.primaryColor.color} />
        <Text style={styles.loadingText}>Loading Vitals...</Text>
      </View>
    );
  }

  // Main component render
  return (
    // Use KeyboardAvoidingView to prevent keyboard from covering inputs
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust offset as needed
    >
      {/* Configure status bar appearance */}
      <StatusBar barStyle="dark-content" backgroundColor={styles.header.backgroundColor} />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase touch area
        >
          <Icon name="arrow-back-outline" size={26} color={styles.primaryColor.color} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Health Vitals</Text>
        {/* Placeholder view to balance the header using flexbox */}
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Scrollable content area */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // Dismiss keyboard when tapping outside inputs
      >
        {/* Form Section inside a Card */}
        <View style={styles.cardContainer}>
          {/* Reusable Input Field Component */}
          <VitalInputField
            label="Blood Pressure"
            value={bloodpressure}
            onChangeText={setBloodPressure}
            placeholder="e.g., 120/80 mmHg"
            icon="heart-outline" // Ionicons name
          />

          <VitalInputField
            label="Heart Rate"
            value={heartrate}
            onChangeText={setHeartrate}
            placeholder="e.g., 72 bpm"
            icon="pulse-outline" // Ionicons name
            keyboardType="numeric"
          />

          <VitalInputField
            label="Height"
            value={height}
            onChangeText={setHeight}
            // *** FIX: Use single quotes for the string containing a double quote ***
            placeholder='e.g., 175 cm or 5'
            icon="resize-outline" // Ionicons name
            // Consider allowing numeric or text for different units
          />

          <VitalInputField
            label="Weight"
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g., 70 kg or 154 lbs"
            icon="scale-outline" // Ionicons name
            keyboardType="numeric" // Or 'default' if allowing units like 'kg'
          />

          <VitalInputField
            label="Blood Group"
            value={bloodgroup}
            onChangeText={setBloodGroup}
            placeholder="e.g., A+, O-"
            icon="water-outline" // Ionicons name (using water drop as a metaphor)
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.savingButton]} // Apply different style when saving
          onPress={saveDetails}
          disabled={saving} // Disable button while saving
          activeOpacity={0.7} // Visual feedback on press
        >
          {saving ? (
            // Show activity indicator when saving
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            // Show icon and text when not saving
            <>
              <Icon name="save-outline" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Interface for the props of the reusable input field component
interface VitalInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: string; // Name of the Ionicons icon
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad'; // Optional keyboard type
}

// Reusable Input Field Component
const VitalInputField: React.FC<VitalInputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default' // Default keyboard type
}) => {
  return (
    <View style={styles.inputGroup}>
      {/* Label with Icon */}
      <View style={styles.labelContainer}>
        <Icon name={icon} size={20} color={styles.primaryColor.color} style={styles.labelIcon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      {/* Text Input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0" // Lighter placeholder text
        keyboardType={keyboardType}
        autoCapitalize="none" // Prevent auto-capitalization where not needed
        autoCorrect={false} // Disable auto-correct for specific fields if desired
      />
    </View>
  );
};

// Get screen width for potential responsive adjustments
const { width } = Dimensions.get('window');

// Stylesheet
const styles = StyleSheet.create({
  // Define primary color for easy reuse
  primaryColor: {
    color: '#1d948b', // Teal color
  },
  // Main container styling
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light grey background
  },
  // Loading state container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  // Header section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space out items
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjust top padding for iOS notch/status bar
    paddingBottom: 15,
    backgroundColor: '#FFFFFF', // White header background
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF', // Light border color
  },
  backButton: {
    padding: 8, // Add padding for easier touch
    borderRadius: 20,
    // backgroundColor: '#f0f0f0', // Optional subtle background
  },
  title: {
    fontSize: 20, // Slightly smaller title
    fontWeight: '600', // Semi-bold
    color: '#343A40', // Darker text color
    textAlign: 'center',
  },
  // Placeholder to balance the title in the center
  headerPlaceholder: {
    width: 30, // Match approximate width of the back button icon area
  },
  // ScrollView styling
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Ensure content can grow to fill space
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 84, // Increased from 40 to ensure button is visible above tab bar
  },
  // Card container for the form
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // Slightly softer corners
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10, // Adjust padding
    marginBottom: 25,
    // Softer shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, // Reduced opacity
    shadowRadius: 6,
    // Elevation for Android shadow
    elevation: 4,
  },
  // Grouping for label and input
  inputGroup: {
    marginBottom: 22, // Consistent spacing between fields
  },
  // Label container (icon + text)
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 15, // Slightly smaller label
    fontWeight: '500', // Medium weight
    color: '#495057', // Greyish text color
  },
  // Input field styling
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA', // Standard border color
    borderRadius: 8, // Consistent corner radius
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF', // White input background
    color: '#343A40', // Dark input text
    // Add focus styling if needed (requires state management)
  },
  // Save button styling
  saveButton: {
    backgroundColor: '#1d948b', // Use primary color
    paddingVertical: 15, // Slightly less vertical padding
    borderRadius: 10, // Consistent corner radius
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow for the button
    shadowColor: '#1d948b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginTop: 10, // Space above the button
  },
  // Style for the button when saving
  savingButton: {
    backgroundColor: '#177a72', // Slightly darker shade when saving/disabled
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17, // Slightly larger button text
    fontWeight: '600', // Semi-bold
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: 10, // Space between icon and text
  },
});

export default EditHealthVitalsScreen;
