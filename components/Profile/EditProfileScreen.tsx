import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();

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
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          const response = await axios.get(`http://10.0.2.2:5000/users/${storedUsername}`);
          setFormData(response.data); // Assuming response.data is an object with user data
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
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
        Alert.alert('Error', 'No fields to update');
        return;
      }

      const response = await axios.put(
        `http://10.0.2.2:5000/users/${storedUsername}`,
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
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  };

  const enableEditing = (field: string) => {
    setEditableFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.backIconContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="chevron-back" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Edit Profile</Text>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />
      </View>

      {Object.keys(formData)
  .filter((key) => key !== '_id') // Filter out the '_id' field
  .map((key) => (
    <View style={styles.inputContainer} key={key}>
      <Icon
        name={
          key === 'username'
            ? 'person-outline'
            : key === 'email'
            ? 'mail-outline'
            : key === 'contact'
            ? 'call-outline'
            : key === 'gender'
            ? 'female-outline'
            : key === 'age'
            ? 'calendar-outline'
            : 'lock-closed-outline'
        }
        size={20}
        color="#199A8E"
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={formData[key]}
        onChangeText={(value) =>
          setFormData((prev) => ({ ...prev, [key]: value }))
        }
        editable={editableFields[key]}
        secureTextEntry={key === 'password'}
      />
      <TouchableOpacity onPress={() => enableEditing(key)}>
        <Icon name="create-outline" size={20} color="gray" />
      </TouchableOpacity>
    </View>
  ))}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.curvedButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'flex-start',
  },
  backIconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginRight: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  curvedButton: {
    backgroundColor: '#199A8E',
    paddingVertical: 10,
    borderRadius: 12,
    width: '50%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
