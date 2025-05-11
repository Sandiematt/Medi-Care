import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform, // Import Platform
  KeyboardAvoidingView, // Import KeyboardAvoidingView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Using Ionicons
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Define the structure for editable fields state
interface EditableFields {
  username: boolean;
  email: boolean;
  contact: boolean;
  gender: boolean;
  age: boolean;
  password: boolean;
  [key: string]: boolean; // Index signature
}

// Define the structure for form data state
interface FormData {
  username: string;
  email: string;
  contact: string;
  gender: string;
  age: string;
  password: string;
  _id?: string; // Optional _id field from backend
  [key: string]: string | undefined; // Index signature
}

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true); // Start loading initially
  const [saving, setSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null); // State for profile photo

  // State for tracking which fields are currently editable
  const [editableFields, setEditableFields] = useState<EditableFields>({
    username: false, // Username will always be false/non-editable
    email: false,
    contact: false,
    gender: false,
    age: false,
    password: false,
  });

  // State for holding the form data
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    contact: '',
    gender: '',
    age: '',
    password: '', // Password field might be better handled separately or masked
  });

  // Fetch user data when the component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to fetch user data from the backend
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        // Make API call to get user data
        const response = await axios.get(`http://10.0.2.2:5000/users/${storedUsername}`);
        // Exclude password from being pre-filled for security, unless necessary
        const userData = { ...response.data, password: '' };
        setFormData(userData);
        
        // Fetch profile photo from separate endpoint
        try {
          const profileResponse = await axios.get(`http://10.0.2.2:5000/api/users/${storedUsername}/profile`);
          if (profileResponse.data.success && profileResponse.data.profilePhoto) {
            setProfilePhoto(profileResponse.data.profilePhoto);
          }
        } catch (profileError) {
          console.error('Error fetching profile photo:', profileError);
          // Continue with default photo if profile fetch fails
        }
      } else {
        // Handle case where username is not found in storage
         Alert.alert('Error', 'User session not found. Please log in again.');
         // navigation.navigate('Login'); // Optional: Redirect to login
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle saving the updated profile data
  const handleSave = async () => {
    setSaving(true);
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (!storedUsername) {
        Alert.alert('Error', 'User session expired. Please log in again.');
        setSaving(false);
        // navigation.navigate('Login'); // Optional: Redirect
        return;
      }

      // Prepare the data payload with only the changed fields
      const updateData: Partial<FormData> = {};
      let hasChanges = false;
      Object.keys(formData).forEach((key) => {
        // Only include fields that were marked editable and potentially changed
        // Note: This logic assumes the initial fetch sets the baseline.
        // A more robust check might compare against initially fetched data.
        if (editableFields[key] && formData[key] !== '') { // Also ensure non-empty value, adjust if empty is valid
           // Special handling for password: only send if it's actually entered
           if (key === 'password' && formData[key] === '') {
               return; // Don't send empty password
           }
          updateData[key] = formData[key];
          hasChanges = true;
        }
      });

      // Check if any changes were actually made
      if (!hasChanges || Object.keys(updateData).length === 0) {
        Alert.alert('No Changes', 'No fields were modified to save.');
        setSaving(false);
        // Reset editable fields visually
         setEditableFields((prevFields) =>
           Object.keys(prevFields).reduce(
             (acc, key) => ({ ...acc, [key]: false }),
             {} as EditableFields
           )
         );
        return;
      }

      // Make the API call to update the user profile
      const response = await axios.put(
        `http://10.0.2.2:5000/users/${storedUsername}`,
        updateData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Handle the response from the backend
      if (response.data.success) {
        // Reset editable fields state upon successful save
        setEditableFields((prevFields) =>
          Object.keys(prevFields).reduce(
            (acc, key) => ({ ...acc, [key]: false }),
            {} as EditableFields // Cast to EditableFields
          )
        );
        Alert.alert('Success', 'Profile updated successfully!');
        // Optionally refetch data or update local state precisely
        // fetchUserData(); // Or update formData state directly if API returns updated user
      } else {
        // Throw error if backend indicates failure
        throw new Error(response.data.message || 'Unknown error from server');
      }
    } catch (error: any) { // Catch block with type assertion
      console.error('Error updating profile:', error);
      // Display specific error message from backend if available, otherwise generic message
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false); // Ensure saving indicator stops
    }
  };

  // Function to enable editing for a specific field
  const enableEditing = (field: keyof EditableFields) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] })); // Toggle edit state
  };

  // Function to navigate back to the previous screen
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
        navigation.goBack();
    }
  };

  // Helper function to get display labels for form fields
  const getFieldLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      username: 'Username',
      email: 'Email Address',
      contact: 'Phone Number',
      gender: 'Gender',
      age: 'Age',
      password: 'Password',
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Helper function to get appropriate icons for form fields
  const getIconName = (key: string): string => {
    const icons: { [key: string]: string } = {
      username: 'person-outline',
      email: 'mail-outline',
      contact: 'call-outline',
      gender: 'male-female-outline',
      age: 'calendar-outline',
      password: 'lock-closed-outline',
    };
    return icons[key] || 'help-circle-outline'; // Default icon
  };

  // Display loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#199A8E" />
        <Text style={styles.loadingText}>Loading Your Profile...</Text>
      </View>
    );
  }

  // Main component render
  return (
    // Use KeyboardAvoidingView for better input handling with keyboard
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
    >
      {/* Status bar configuration */}
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Icon name="arrow-back-outline" size={26} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        {/* Invisible placeholder to balance the title */}
        <View style={styles.headerButton} />
      </View>

      {/* Scrollable content area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // Dismiss keyboard on tap outside inputs
      >
        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: profilePhoto || 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg?w=740' }}
            style={styles.profileImage}
          />
        </View>

        {/* User Name Display */}
        <Text style={styles.userNameDisplay}>{formData.username || 'User Name'}</Text>
        <Text style={styles.userEmailDisplay}>{formData.email || 'user@example.com'}</Text>


        {/* Form Fields Section */}
        <View style={styles.formContainer}>
          {/* Username field with special non-editable UI */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Username</Text>
            <View style={[styles.inputWrapper, styles.usernameWrapper]}>
              <Icon
                name="person-outline"
                size={22}
                color="#888888"
                style={styles.fieldIcon}
              />
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.username}
                editable={false}
                placeholder="Username"
                placeholderTextColor="#AAAAAA"
              />
              <View style={styles.lockedBadge}>
                <Icon name="lock-closed" size={16} color="#888888" />
              </View>
            </View>
          </View>

          {Object.keys(formData)
            // Filter out internal fields like _id and username (now handled separately)
            .filter((key) => key !== '_id' && key !== 'username' && key !== 'image')
            .map((key) => (
              <View style={styles.fieldContainer} key={key}>
                {/* Field Label */}
                <Text style={styles.fieldLabel}>{getFieldLabel(key)}</Text>
                {/* Input Wrapper */}
                <View style={[
                    styles.inputWrapper,
                    editableFields[key] && styles.inputWrapperActive // Highlight if active
                ]}>
                  {/* Input Icon */}
                  <Icon
                    name={getIconName(key)}
                    size={22}
                    color={editableFields[key] ? '#199A8E' : '#888888'} // Dynamic icon color
                    style={styles.fieldIcon}
                  />
                  {/* Text Input */}
                  <TextInput
                    style={[
                      styles.input,
                      !editableFields[key] && styles.inputDisabled // Style for disabled
                    ]}
                    value={formData[key]}
                    onChangeText={(value) =>
                      setFormData((prev) => ({ ...prev, [key]: value }))
                    }
                    editable={editableFields[key]}
                    secureTextEntry={key === 'password'} // Secure entry for password
                    placeholder={`Enter ${getFieldLabel(key)}`}
                    placeholderTextColor="#AAAAAA"
                    keyboardType={key === 'contact' || key === 'age' ? 'numeric' : 'default'} // Set keyboard type
                    autoCapitalize={key === 'email' || key === 'password' ? 'none' : 'words'} // Auto-capitalize settings
                    clearButtonMode="while-editing" // iOS clear button
                  />
                  {/* Edit/Confirm Toggle Button */}
                  <TouchableOpacity
                    onPress={() => enableEditing(key as keyof EditableFields)}
                    style={styles.editToggleButton}
                  >
                    <Icon
                      name={editableFields[key] ? "checkmark-circle" : "create-outline"}
                      size={24}
                      color={editableFields[key] ? "#199A8E" : "#555555"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Save Button Section - Fixed at the bottom */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} // Style disabled state
          onPress={handleSave}
          disabled={saving} // Disable button while saving
        >
          {saving ? (
            // Show activity indicator when saving
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            // Show icon and text normally
            <>
              <Icon name="save-outline" size={20} color="#FFFFFF" style={styles.saveButtonIcon} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// StyleSheet definition
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC', // Lighter background color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555555',
    fontWeight: '500',
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space out items
    paddingVertical: Platform.OS === 'ios' ? 15 : 12, // Platform-specific padding
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF', // White background for header
    borderBottomWidth: 1, // Subtle border bottom
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    padding: 5, // Hit area for the button
    minWidth: 30, // Ensure minimum width for balance
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600', // Semibold
    color: '#2C3E50', // Darker text color
  },
  // ScrollView Styles
  scrollContent: {
    paddingBottom: 120, // Ensure space for the fixed save button
    paddingHorizontal: 20,
  },
  // Profile Image Styles
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
    position: 'relative',
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55, // Perfect circle
    borderWidth: 4,
    borderColor: '#FFFFFF', // White border
    backgroundColor: '#E0E0E0', // Placeholder background
    // Subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  // User Info Display Styles
  userNameDisplay: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 10,
  },
   userEmailDisplay: {
    fontSize: 15,
    color: '#7F8C8D', // Softer color for email
    textAlign: 'center',
    marginBottom: 30,
  },
  // Form Styles
  formContainer: {
    // Removed background color and shadow from here, applying to input wrappers instead
    paddingBottom: 20, // Add some padding at the bottom of the form area
  },
  fieldContainer: {
    marginBottom: 20, // Space between fields
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495E', // Slightly darker label color
    marginBottom: 8,
    marginLeft: 5, // Align with input padding
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background for inputs
    borderRadius: 12, // More rounded corners
    borderWidth: 1,
    borderColor: '#DDE2E7', // Softer border color
    paddingHorizontal: 15,
    // Add subtle shadow to input fields
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputWrapperActive: {
    borderColor: '#199A8E', // Highlight border when active
    shadowColor: "#199A8E",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  fieldIcon: {
    marginRight: 12, // Space between icon and text input
  },
  input: {
    flex: 1, // Take remaining space
    height: 50, // Consistent height
    fontSize: 16,
    color: '#2C3E50', // Dark text color for input
  },
  inputDisabled: {
      color: '#7F8C8D', // Grey out text when not editable
      // backgroundColor: '#F0F2F5', // Slightly different background when disabled (optional)
  },
  editToggleButton: {
    paddingLeft: 10, // Space before the icon
    paddingVertical: 5, // Vertical padding for touch area
  },
  // Save Button Styles
  saveButtonContainer: {
    position: 'absolute', // Fix button at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15, // Adjust padding for safe area on iOS
    backgroundColor: '#FFFFFF', // White background to lift button
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0', // Separator line
  },
  saveButton: {
    backgroundColor: '#199A8E', // Primary color
    paddingVertical: 15,
    borderRadius: 12, // Rounded corners
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced shadow for prominence
    shadowColor: "#199A8E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
   saveButtonDisabled: {
    backgroundColor: '#A0D9D3', // Lighter shade when disabled/saving
    elevation: 0, // Remove shadow when disabled
  },
  saveButtonIcon: {
    marginRight: 10, // Space between icon and text
  },
  saveButtonText: {
    color: '#FFFFFF', // White text
    fontSize: 16,
    fontWeight: '600', // Semibold
  },
  usernameWrapper: {
    backgroundColor: '#F5F7FA', // Lighter background to indicate non-editable
    borderColor: '#E0E4E9',
  },
  lockedBadge: {
    paddingLeft: 10,
    paddingVertical: 5,
  },
});

export default EditProfileScreen;
