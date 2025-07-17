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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editableFields, setEditableFields] = useState({
    username: false,
    email: false,
    contact: false,
    gender: false,
    age: false,
    password: false,
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contact: '',
    gender: '',
    age: '',
    password: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        const response = await axios.get(`http://20.193.156.237:5000/users/${storedUsername}`);
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (!storedUsername) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const updateData = {};
      Object.keys(formData).forEach((key) => {
        if (editableFields[key] && formData[key] !== '') {
          updateData[key] = formData[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        Alert.alert('No Changes', 'No fields have been modified');
        return;
      }

      const response = await axios.put(
        `http://20.193.156.237:5000/users/${storedUsername}`,
        updateData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.success) {
        setEditableFields((prevFields) =>
          Object.keys(prevFields).reduce(
            (acc, key) => ({ ...acc, [key]: false }),
            {}
          )
        );
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        (error as any).response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const enableEditing = (field: string) => {
    setEditableFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getFieldLabel = (key: string): string => {
    const labels = {
      username: 'Username',
      email: 'Email Address',
      contact: 'Phone Number',
      gender: 'Gender',
      age: 'Age',
      password: 'Password',
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const getIconName = (key: string): string => {
    const icons = {
      username: 'person',
      email: 'mail',
      contact: 'call',
      gender: 'male-female',
      age: 'calendar',
      password: 'lock-closed',
    };
    return icons[key] || 'help-circle';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#199A8E" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg' }}
            style={styles.profileImage}
          />
          <View style={styles.editImageButton}>
            <Icon name="camera" size={18} color="#ffffff" />
          </View>
        </View>

        {/* Name Display */}
        <Text style={styles.nameDisplay}>{formData.username || 'User'}</Text>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {Object.keys(formData)
            .filter((key) => key !== '_id')
            .map((key) => (
              <View style={styles.fieldContainer} key={key}>
                <Text style={styles.fieldLabel}>{getFieldLabel(key)}</Text>
                <View style={styles.inputWrapper}>
                  <Icon
                    name={getIconName(key)}
                    size={20}
                    color="#199A8E"
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      editableFields[key] && styles.inputActive
                    ]}
                    value={formData[key]}
                    onChangeText={(value) =>
                      setFormData((prev) => ({ ...prev, [key]: value }))
                    }
                    editable={editableFields[key]}
                    secureTextEntry={key === 'password'}
                    placeholder={`Enter your ${key}`}
                    placeholderTextColor="#AAA"
                  />
                  <TouchableOpacity 
                    onPress={() => enableEditing(key)}
                    style={styles.editButton}
                  >
                    <Icon 
                      name={editableFields[key] ? "checkmark-circle" : "create"} 
                      size={20} 
                      color={editableFields[key] ? "#199A8E" : "#888"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Icon name="checkmark-circle" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    right: 5,
  },
  placeholder: {
    width: 28,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 24,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: '38%',
    backgroundColor: '#199A8E',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  nameDisplay: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  formContainer: {
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fieldIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  inputActive: {
    backgroundColor: '#fff',
    color: '#199A8E',
  },
  editButton: {
    padding: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  saveButton: {
    backgroundColor: '#199A8E',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#199A8E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;