import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';

// Directly import screens
import EditProfileScreen from './EditProfileScreen';
import FavoriteScreen from './FavoriteScreen';
import AboutScreen from './AboutScreen';
import HealthVitalsScreen from './HealthVitalsScreen';
import PrescriptionsScreen from './PrescriptionsScreen';


// Stack Navigator
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

const ProfileMainScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg?semt=ais_hybrid' }} // Replace with doctor image URL
          style={styles.profileImage}
        />
        <Text style={styles.name}>Jhalok Deb</Text>
        <Text style={styles.email}>jhalokde@gmail.com</Text>
      </View>

      {/* Options Section */}
      <ScrollView>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('EditProfile')}>
          <Icon name="person-outline" size={20} color="#6C63FF" />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Favorite')}>
          <Icon name="star-outline" size={20} color="#6C63FF" />
          <Text style={styles.optionText}>Wellness Score</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('HealthVitals')}>
          <Icon name="pulse-outline" size={20} color="#6C63FF" />
          <Text style={styles.optionText}>Health Vitals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Prescriptions')}>
          <Icon name="medical-outline" size={20} color="#6C63FF" />
          <Text style={styles.optionText}>My Prescriptions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('About')}>
          <Icon name="information-circle-outline" size={20} color="#6C63FF" />
          <Text style={styles.optionText}>About DocSwift</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => {}}>
          <Icon name="log-out-outline" size={16} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const ProfileScreen: React.FC = () => {
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
