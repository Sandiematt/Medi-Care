import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  NativeScrollEvent, // Added
  NativeSyntheticEvent, // Added
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary, launchCamera, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker'; // Import image picker
import { NavigationProp } from '@react-navigation/native';

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

// Define interface for menu item props
interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  index: number;
}

// Define interface for ProfileMainScreen props
interface ProfileMainScreenProps {
  navigation: NavigationProp<any> & { replace: (name: string) => void };
}

// Define interface for user data
interface UserData {
  username?: string;
  email?: string;
  image?: string;
  [key: string]: any;
}

// --- Animated Menu Item Component ---
const AnimatedMenuItem = ({ icon, label, onPress, index }: MenuItemProps) => {
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
const ProfileMainScreen = ({ navigation }: ProfileMainScreenProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(50); // Default minimum completion

  // --- Tab Bar Visibility Logic ---
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  // --- End Tab Bar Visibility Logic ---

  // Animation values for the profile card
  const cardScaleAnim = useRef(new Animated.Value(0.95)).current; // Start slightly smaller
  const cardOpacityAnim = useRef(new Animated.Value(0)).current; // Start transparent

  // Calculate profile completion percentage
  const calculateProfileCompletion = (data: UserData | null) => {
    if (!data) return 50; // Default minimum if no data
    
    // Fields to check for completion
    const requiredFields = ['username', 'email', 'contact', 'gender', 'age', 'image'];
    let filledFields = 0;
    
    requiredFields.forEach(field => {
      if (data[field] && String(data[field]).trim() !== '') {
        filledFields++;
      }
    });
    
    // Calculate percentage (minimum 50%, maximum 100%)
    const percentage = Math.max(50, Math.min(100, Math.round((filledFields / requiredFields.length) * 100)));
    return percentage;
  };

  // Function to fetch user data from the backend
  const fetchUserData = useCallback(async () => {
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
          
          // Calculate and set profile completion
          setProfileCompletion(calculateProfileCompletion(data));
     
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
  }, []);  // Empty dependency array as it doesn't depend on any props or state

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // Add fetchUserData as dependency

  // --- Tab Bar Scroll Handler ---
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    const canScroll = contentHeight > layoutHeight + 5;
    const isEffectivelyAtBottom = canScroll && (layoutHeight + currentScrollY >= contentHeight - 20);

    if (isEffectivelyAtBottom) {
      if (isTabBarVisible) {
        setIsTabBarVisible(false);
      }
    } else {
      if (canScroll && currentScrollY > lastScrollY.current && currentScrollY > 20) {
        if (isTabBarVisible) {
          setIsTabBarVisible(false);
        }
      } else {
        if (!isTabBarVisible) {
          setIsTabBarVisible(true);
        }
      }
    }
    lastScrollY.current = currentScrollY;
  }, [isTabBarVisible]);
  // --- End Tab Bar Scroll Handler ---

  // --- Tab Bar Visibility Effects ---
  useEffect(() => {
    // This effect ensures the parent navigator (TabNavigator) is updated
    // whenever our local isTabBarVisible state changes.
    navigation.getParent()?.getParent()?.setOptions({
      tabBarVisible: isTabBarVisible,
    });
  }, [isTabBarVisible, navigation]); // Runs when isTabBarVisible or navigation changes

  // Add a focus listener to refresh user data when returning from EditProfileScreen
  useEffect(() => {
    const refreshOnFocus = navigation.addListener('focus', () => {
      // Refresh user data when returning to this screen
      fetchUserData();
    });

    return refreshOnFocus; // Clean up the listener on unmount
  }, [navigation, fetchUserData]);

  useEffect(() => {
    // This effect handles screen focus and blur events.
    const unsubscribeFocus = navigation.addListener('focus', () => {
      // When the screen comes into focus, we want the tab bar to be initially visible.
      // The scroll handler will then adjust visibility based on scrolling.
      if (!isTabBarVisible) { // Only set if it's currently false, to avoid unnecessary re-renders/effect runs
        setIsTabBarVisible(true);
      } else {
        // If it's already true, still ensure the parent is synced, 
        // in case this screen gained focus without isTabBarVisible changing from true.
        navigation.getParent()?.getParent()?.setOptions({
          tabBarVisible: true,
        });
      }
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      // When the screen loses focus, ensure the tab bar is visible for the next screen.
      navigation.getParent()?.getParent()?.setOptions({ tabBarVisible: true });
    });

    return () => {
      // Cleanup listeners when the component unmounts.
      unsubscribeFocus();
      unsubscribeBlur();
      // Also ensure tab bar is visible if component unmounts while it was hidden.
      navigation.getParent()?.getParent()?.setOptions({ tabBarVisible: true });
    };
  }, [navigation, isTabBarVisible]); // Added isTabBarVisible to dependencies of focus/blur effect
  // --- End Tab Bar Visibility Effects ---

  // Function to handle image selection
  const handleImagePicker = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Take Photo',
          onPress: () => captureImage(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => selectImage(),
        },
      ],
      { cancelable: true }
    );
  };

  // Function to capture a photo with the camera
  const captureImage = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      quality: 0.7,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
        return;
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Something went wrong');
        return;
      }
      
      if (response.assets && response.assets[0]) {
        // Upload image
        uploadImage(response.assets[0]);
      }
    });
  };

  // Function to select an image from the gallery
  const selectImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      quality: 0.7,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Something went wrong');
        return;
      }
      
      if (response.assets && response.assets[0]) {
        // Upload image
        uploadImage(response.assets[0]);
      }
    });
  };

  // Function to upload the selected image to the server
  const uploadImage = async (imageAsset: any) => {
    if (!username) {
      Alert.alert('Error', 'Username not found');
      return;
    }

    setUploading(true);
    console.log('Starting image upload for user:', username);

    try {
      // Create FormData object
      const formData = new FormData();
      
      // Properly format image data for FormData to avoid type issues
      const imageFile = {
        uri: Platform.OS === 'android' ? imageAsset.uri : imageAsset.uri.replace('file://', ''),
        type: imageAsset.type || 'image/jpeg',
        name: imageAsset.fileName || `photo_${Date.now()}.jpg`,
      };
      
      // Append with correct structure for multer
      formData.append('image', imageFile as any);
      
      console.log('Image URI:', imageAsset.uri);
      console.log('Image type:', imageFile.type);
      console.log('Image name:', imageFile.name);
      console.log('Server URL:', `http://20.193.156.237:5000/users/${username}/upload-profile-image`);

      // Make POST request to upload the image
      const response = await axios.post(
        `http://20.193.156.237:5000/users/${username}/upload-profile-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          // Important: Don't let Axios transform the FormData
          transformRequest: (_data, _headers) => formData,
          timeout: 15000, // 15 second timeout
        }
      );

      console.log('Upload response:', response.data);

      if (response.data && response.data.success) {
        // Refresh user data to get the updated image
        try {
          const userResponse = await axios.get(`http://20.193.156.237:5000/users/${username}`);
          setUserData(userResponse.data);
          Alert.alert('Success', 'Profile picture updated successfully');
        } catch (refreshError) {
          console.error('Error refreshing user data:', refreshError);
          Alert.alert('Note', 'Image uploaded but profile may need to be refreshed manually');
        }
      } else {
        Alert.alert('Error', response.data?.error || 'Failed to update profile picture');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      
      if (error.message?.includes('Network Error')) {
        Alert.alert(
          'Network Error', 
          'Cannot connect to the server. Please check your internet connection and make sure the server is running.'
        );
      } else if (error.response) {
        console.error('Server response error:', error.response.status, error.response.data);
        Alert.alert('Server Error', `Status: ${error.response.status}. ${error.response.data?.error || 'Unknown error'}`);
      } else {
        Alert.alert('Error', error.message || 'Failed to upload image');
      }
    } finally {
      setUploading(false);
    }
  };

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
        <TouchableOpacity onPress={handleLogoutPress} activeOpacity={0.7}>
          <Icon name="log-out-outline" size={28} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
      >
      
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
                uri: userData?.image || 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg',
              }}
              style={styles.profileImage}
            />
            
            {/* Image upload button overlay */}
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={handleImagePicker}
              disabled={uploading}
            >
              <View style={styles.editImageIconContainer}>
                <Icon name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            {/* Upload indicator */}
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{username || 'Username'}</Text>
          <Text style={styles.profileEmail}>{email || 'Email Address'}</Text> 
          
          {/* Profile Completion Tracker */}
          <View style={[styles.completionContainer, profileCompletion === 100 ? styles.completionContainerComplete : null]}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionText}>
                Profile Completion: {profileCompletion}%
              </Text>
              {profileCompletion < 100 ? (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('EditProfile')}
                  style={styles.completeButton}
                >
                  <Text style={styles.completeButtonText}>Complete</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.completedText}>Completed</Text>
              )}
            </View>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${profileCompletion}%` },
                  profileCompletion === 100 ? styles.progressBarComplete : null
                ]} 
              />
            </View>
            
            {profileCompletion < 100 ? (
              <View style={styles.warningContainer}>
                <Icon name="alert-circle-outline" size={14} color="#F59E0B" />
                <Text style={styles.completionWarning}>
                  Please complete your profile for a better experience
                </Text>
              </View>
            ) : (
              <View style={styles.warningContainer}>
                <Icon name="checkmark-circle-outline" size={14} color="#10B981" />
                <Text style={[styles.completionWarning, styles.completionSuccess]}>
                  Your profile is complete! Thank you.
                </Text>
              </View>
            )}
          </View>
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
    fontFamily: 'Poppins-Bold',
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
  // New style for the edit image button
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#199A8E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  editImageIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Overlay for when image is uploading
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: 'Poppins-SemiBold',
  },
  profileEmail: {
    fontSize: 15, // Slightly larger email
    color: '#64748B', // Muted color
    marginBottom: 8, // Add some space below email
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  profileInfo: { // Style for additional info if added
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Medium',
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
    fontFamily: 'Poppins-Regular',
  },
  completionContainer: {
    marginTop: 16,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FAFBFC',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Poppins-SemiBold',
  },
  completeButton: {
    backgroundColor: '#199A8E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  completeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0F2F7',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#199A8E',
    borderRadius: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionWarning: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    marginLeft: 6,
    flex: 1,
  },
  completionContainerComplete: {
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    fontFamily: 'Poppins-SemiBold',
  },
  progressBarComplete: {
    backgroundColor: '#10B981',
  },
  completionSuccess: {
    color: '#10B981',
  },
});

export default ProfileScreenApp; // Export the navigator stack
