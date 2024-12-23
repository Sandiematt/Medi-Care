import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation(); // Initialize navigation
  const [name, setName] = useState<string>('John Doe');
  const [age, setAge] = useState<string>('30');
  const [email, setEmail] = useState<string>('johndoe@example.com');
  const [mobile, setMobile] = useState<string>('1234567890');
  const [password, setPassword] = useState<string>('••••••••••'); 
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [editableFields, setEditableFields] = useState({
    name: false,
    age: false,
    email: false,
    mobile: false,
    password: false,
  });

  const handleSave = () => {
    console.log('Profile updated:', { name, age, email, mobile, imageUri });
    setEditableFields({ name: false, age: false, email: false, mobile: false, password: false });
  };

  const enableEditing = (field: string) => {
    setEditableFields((prev) => ({ ...prev, [field]: true }));
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      {/* Back Icon */}
      <View style={styles.backIconContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="arrow-back" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Edit Profile</Text>

      {/* Profile Image Section */}
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: imageUri || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <Icon
            name="create-outline"
            size={25}
            color="white"
            style={styles.editIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Input Fields with Edit Icon */}
      <View style={styles.inputContainer}>
        <Icon name="person-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          editable={editableFields.name}
        />
        <TouchableOpacity onPress={() => enableEditing('name')}>
          <Icon name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="calendar-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={age}
          keyboardType="numeric"
          onChangeText={setAge}
          editable={editableFields.age}
        />
        <TouchableOpacity onPress={() => enableEditing('age')}>
          <Icon name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="mail-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
          editable={editableFields.email}
        />
        <TouchableOpacity onPress={() => enableEditing('email')}>
          <Icon name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock-closed-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          editable={editableFields.password}
          secureTextEntry={true}
        />
        <TouchableOpacity onPress={() => enableEditing('password')}>
          <Icon name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Icon name="call-outline" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={mobile}
          keyboardType="phone-pad"
          onChangeText={setMobile}
          editable={editableFields.mobile}
        />
        <TouchableOpacity onPress={() => enableEditing('mobile')}>
          <Icon name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Save Button */}
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
  editIcon: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    padding: 10,
    alignItems: 'center',
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
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 10,
    width: '50%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
