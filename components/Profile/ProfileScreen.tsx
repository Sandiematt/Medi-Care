import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Animated, // Import Animated
  Easing, // Import Easing for animation curves
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// --- Import your actual screens ---
// Ensure these files exist in your project relative to this file,
// or adjust the paths accordingly.
import EditProfileScreen from './EditProfileScreen';
import FavoriteScreen from './FavoriteScreen';
import AboutScreen from './AboutScreen';
import HealthVitalsScreen from './HealthVitalsScreen';
import PrescriptionsScreen from './PrescriptionsScreen';
// --- End Screen Imports ---

const Stack = createStackNavigator();

// --- Animated Menu Item Component ---
const AnimatedMenuItem = ({ icon, label, onPress, index }) => {
  // Animation value for slide/fade-in effect
  const slideAnim = useRef(new Animated.Value(50)).current; // Start slightly below
  const opacityAnim = useRef(new Animated.Value(0)).current; // Start transparent
  // Animation value for press effect
  const scaleAnim = useRef(new Animated.Value(1)).current; // Start at normal scale

  useEffect(() => {
    // Staggered entrance animation
    Animated.timing(slideAnim, {
      toValue: 0, // Slide to original position
      duration: 300,
      easing: Easing.out(Easing.ease),
      delay: index * 100, // Stagger based on index
      useNativeDriver: true, // Use native driver for performance
    }).start();

    Animated.timing(opacityAnim, {
      toValue: 1, // Fade in
      duration: 300,
      easing: Easing.out(Easing.ease),
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, opacityAnim, index]);

  // Press In Animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97, // Scale down slightly
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // Press Out Animation
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1, // Scale back to normal
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }], // Apply animations
      }}
    >
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8} // Adjust active opacity for better feedback
      >
        <View style={styles.menuIconContainer}>
          <Icon name={icon} size={22} color="#199A8E" />
        </View>
        <Text style={styles.menuText}>{label}</Text>
        <Icon name="chevron-forward" size={20} color="#CBD5E1" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Main Profile Screen Component ---
const ProfileMainScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Animation values for the profile card
  const cardScaleAnim = useRef(new Animated.Value(0.95)).current; // Start slightly smaller
  const cardOpacityAnim = useRef(new Animated.Value(0)).current; // Start transparent

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true); // Ensure loading is true at the start
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          try {
            // Replace with your actual API endpoint
            const response = await axios.get(`http://20.193.156.237:5000/users/${storedUsername}`);
            const data = response.data;
            setUserData(data);
            setUsername(data.username || storedUsername); // Fallback username
            setEmail(data.email || 'N/A');
       
          } catch (networkError) {
            console.log('Network error fetching user data:', networkError);
            // Set fallback data on network error
            setUsername(storedUsername);
            setEmail('Could not load email');
          
            // Optionally show a user-friendly message here
          }
        } else {
          // Handle case where username is not found in storage
          console.log('Username not found in AsyncStorage.');
          // Maybe navigate to Login or show an error
          // Ensure you have a 'Login' screen defined in your navigator
          // navigation.replace('Login');
        }
      } catch (error) {
        console.log('Error fetching username from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigation]); // Add navigation as dependency if used for redirection

  // Trigger card animation when loading is finished
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.spring(cardScaleAnim, {
          toValue: 1, // Scale to normal size
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 1, // Fade in
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, cardScaleAnim, cardOpacityAnim]);

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              // Replace 'Login' with your actual login screen route name
              // Ensure you have a 'Login' screen defined in your navigator
              navigation.replace('Login');
            } catch (error) {
              console.log('Error logging out:', error);
              Alert.alert('Error', 'Could not log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Menu items data
  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile' },
    { icon: 'star-outline', label: 'Wellness Score', screen: 'Favorite' }, // Assuming Favorite is Wellness Score
    { icon: 'pulse-outline', label: 'Health Vitals', screen: 'HealthVitals' },
    { icon: 'medical-outline', label: 'My Prescriptions', screen: 'Prescriptions' },
    { icon: 'information-circle-outline', label: 'About MediCare', screen: 'About' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#199A8E" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogoutPress}>
          <Icon name="log-out-outline" size={28} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      
        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: cardOpacityAnim,
              transform: [{ scale: cardScaleAnim }], // Apply scale and opacity animations
            },
          ]}
        >
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                // Consider using a user-specific avatar URL if available from userData
                uri: userData?.avatarUrl || 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg',
              }}
              style={styles.profileImage}
            />
           
          </View>
          <Text style={styles.profileName}>{username || 'Username'}</Text>
          <Text style={styles.profileEmail}>{email || 'Email Address'}</Text> 
         
        </Animated.View>

      
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <AnimatedMenuItem
              key={item.screen} // Use a unique key
              icon={item.icon}
              label={item.label}
              onPress={() => navigation.navigate(item.screen)}
              index={index} // Pass index for staggered animation
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Root Navigator Component ---
const ProfileScreenApp = () => {
  return (
    // Assuming NavigationContainer is set up in your main App.js
    // <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerShown: false, // Hide default header, using custom header in ProfileMainScreen
      }}
    >
     
      <Stack.Screen name="ProfileMain" component={ProfileMainScreen} />

   
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Favorite" component={FavoriteScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="HealthVitals" component={HealthVitalsScreen} />
      <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} />

    </Stack.Navigator>
    // </NavigationContainer>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slightly off-white background
  },
  scrollContent: {
    paddingBottom: 30, // Add padding at the bottom
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF', // White header background
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0', // Lighter border color
  },
  headerTitle: {
    fontSize: 22, // Slightly smaller title
    fontWeight: 'bold', // Use bold instead of 700
    color: '#1E293B',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // More rounded corners
    padding: 24,
    marginHorizontal: 16, // Adjust margin
    marginTop: 24, // Adjust margin
    alignItems: 'center',
    shadowColor: '#94A3B8', // Softer shadow color
    shadowOffset: { width: 0, height: 4 }, // Adjust shadow offset
    shadowOpacity: 0.1, // Adjust shadow opacity
    shadowRadius: 12, // Adjust shadow radius
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 110, // Slightly larger image
    height: 110,
    borderRadius: 55, // Keep it circular
    borderWidth: 3, // Add a subtle border
    borderColor: '#E0F2F1', // Border color matching theme
  },
  badgeContainer: { // Style for the optional checkmark badge
    position: 'absolute',
    bottom: 5, // Adjust position
    right: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 15, // Make it circular
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  profileName: {
    fontSize: 22, // Larger name
    fontWeight: '600',
    color: '#0F172A', // Darker text
    marginBottom: 6,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 15, // Slightly larger email
    color: '#64748B', // Muted color
    marginBottom: 8, // Add some space below email
    textAlign: 'center',
  },
  profileInfo: { // Style for additional info if added
      fontSize: 14,
      color: '#475569',
      marginTop: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Match card radius
    marginHorizontal: 16, // Match card margin
    marginTop: 24,
    paddingVertical: 8,
    shadowColor: '#94A3B8', // Softer shadow color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden', // Hide overflowing content during animation
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18, // Increase padding for better touch area
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9', // Lighter separator
  },
  // To remove border from the last item, you might need logic in the map function
  // or apply styling differently, e.g., adding borders only between items.
  menuIconContainer: {
    width: 44, // Slightly larger icon container
    height: 44,
    borderRadius: 22, // Circular icon background
    backgroundColor: '#E0F2F7', // Lighter, softer blue background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // Increase spacing
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#64748B',
  },
});

export default ProfileScreenApp; // Export the navigator stack
