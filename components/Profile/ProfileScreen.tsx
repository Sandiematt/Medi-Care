import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Make sure axios is installed

// Directly import screens
import EditProfileScreen from './EditProfileScreen';
import FavoriteScreen from './FavoriteScreen';
import AboutScreen from './AboutScreen';
import HealthVitalsScreen from './HealthVitalsScreen';
import PrescriptionsScreen from './PrescriptionsScreen';
import Login from '../Login/Login';

const ProfileScreen = ({ handleLogout, navigation }: { handleLogout: () => void, navigation: any }) => {
  const [userData, setUserData] = useState(null);
  const [editableFields, setEditableFields] = useState({
    username: false,
    email: false,
    contact: false,
    gender: false,
  });

  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          const response = await axios.get(`http://10.0.2.2:5000/users/${storedUsername}`);
          setUserData(response.data);
          setName(response.data.username);
          setEmail(response.data.email);
          setContact(response.data.contact);
          setGender(response.data.gender);
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        const response = await axios.put(`http://10.0.2.2:5000/users/${storedUsername}`, {
          username,
          email,
          contact,
          gender,
        });
        if (response.status === 200) {
          setEditableFields({
            username: false,
            email: false,
            contact: false,
            gender: false,
          });
          Alert.alert('Success', 'Profile updated successfully');
        }
      }
    } catch (error) {
      console.log('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      "Logout Confirmation",
      "Do you want to logout?",
      [
        {
          text: "No",
          onPress: () => console.log("Logout cancelled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              console.log("Logged out successfully");
              navigation.replace("Login"); 
            } catch (error) {
              console.log("Error logging out:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  

  const Stack = createStackNavigator();
  const ProfileOptionsNavigator = () => (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="ProfileMain" component={ProfileMainScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Favorite" component={FavoriteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HealthVitals" component={HealthVitalsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );

  const ProfileMainScreen = ({ navigation }: { navigation: any }) => {
    return (
      <View style={styles.container}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg?semt=ais_hybrid' }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{username}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Options Section */}
        <ScrollView>
          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('EditProfile')}>
            <Icon name="person-outline" size={20} color="#199A8E" />
            <Text style={styles.optionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Favorite')}>
            <Icon name="star-outline" size={20} color="#199A8E" />
            <Text style={styles.optionText}>Wellness Score</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('HealthVitals')}>
            <Icon name="pulse-outline" size={20} color="#199A8E" />
            <Text style={styles.optionText}>Health Vitals</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Prescriptions')}>
            <Icon name="medical-outline" size={20} color="#199A8E" />
            <Text style={styles.optionText}>My Prescriptions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('About')}>
            <Icon name="information-circle-outline" size={20} color="#199A8E" />
            <Text style={styles.optionText}>About MediCare</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton}  onPress={handleLogoutPress}>
            <Icon name="log-out-outline" size={16} color="#fff" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  return <ProfileOptionsNavigator />;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileSection: { alignItems: 'center', marginVertical: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  name: { marginTop: 10, fontSize: 18, fontWeight: 'bold' },
  email: { fontSize: 14, color: 'gray' },
  option: { flexDirection: 'row', alignItems: 'center', padding: 20,marginTop:1, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  optionText: { marginLeft: 10, fontSize: 16 },
  screenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screenText: { fontSize: 20, fontWeight: 'bold' },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    margin: 90,
    borderRadius: 10,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8, 
  },
});

export default ProfileScreen;