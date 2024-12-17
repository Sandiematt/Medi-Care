import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Icon from react-native-vector-icons/Ionicons
import { launchImageLibrary } from 'react-native-image-picker'; // Import Image Picker

const EditProfileScreen: React.FC = () => {
  // Initial saved values (you can replace these with actual values from a database or API)
  const [name, setName] = useState<string>('John Doe');
  const [age, setAge] = useState<string>('30');
  const [email, setEmail] = useState<string>('johndoe@example.com');
  const [mobile, setMobile] = useState<string>('1234567890');
  const [imageUri, setImageUri] = useState<string | null>(null); // State for the profile image

  const [editing, setEditing] = useState<boolean>(false); // State to track if we are in edit mode

  const handleSave = () => {
    // Save the profile updates here
    console.log('Profile updated:', { name, age, email, mobile, imageUri });
    setEditing(false); // Exit edit mode after saving
  };

  const handleEdit = () => {
    setEditing(true); // Enable editing mode
  };

  // Function to launch the image picker
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        setImageUri(response.assets?.[0].uri || null); // Update image URI
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      {/* Profile Image Section */}
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={imageUri ? { uri: imageUri } : require('../../assets/images/img.png')} // Default image if none selected
            style={styles.profileImage}
          />
        </TouchableOpacity>
        {editing && (
          <Icon name="create-outline" size={25} color="#4CAF50" style={styles.editIcon} />
        )}
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <Icon name="person-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
          editable={editing}
        />
        <TouchableOpacity onPress={handleEdit}>
          <Icon name="create-outline" size={20} color="gray" style={styles.pencilIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="calendar-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter age"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          editable={editing}
        />
        <TouchableOpacity onPress={handleEdit}>
          <Icon name="create-outline" size={20} color="gray" style={styles.pencilIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="mail-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={editing}
        />
        <TouchableOpacity onPress={handleEdit}>
          <Icon name="create-outline" size={20} color="gray" style={styles.pencilIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="call-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter mobile number"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
          editable={editing}
        />
        <TouchableOpacity onPress={handleEdit}>
          <Icon name="create-outline" size={20} color="gray" style={styles.pencilIcon} />
        </TouchableOpacity>
      </View>

      {editing ? (
        <Button title="Save" onPress={handleSave} color="#4CAF50" />
      ) : (
        <Button title="Edit" onPress={() => setEditing(true)} color="#2196F3" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Circular image
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
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
  pencilIcon: {
    marginLeft: 10,
  },
});

export default EditProfileScreen;
