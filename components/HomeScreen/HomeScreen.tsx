import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Animated, // Import Animated
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Easing, // Import Easing for animation curves
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
} from 'react-native';
// Use specific icons for clarity
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// --- Screen Imports ---
// NOTE: Verify these paths match your project structure!
import InventoryScreen from '../Reminder/InventoryScreen'; // Check: Is InventoryScreen really inside Reminder folder?
import HospitalScreen from './CounterfietDetection'; // Check: Ensure filename matches 'CounterfietDetection.js/ts'
import FindHospitals from './FindHospitals';
import ProfileScreenApp from '../Profile/ProfileScreen';
import ReminderScreen from '../Reminder/ReminderScreen'; // Check: Ensure this screen handles both single reminder view and list view if needed
import AI_ChatBot from './AI_ChatBot';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');
// Define API base URL - Move to config/env variables in a real app
const API_BASE_URL = 'http://20.193.156.237:5000';

// --- Banner Images ---
// NOTE: Verify these image paths are correct relative to this file
const bannerImages = [
  require('../../assets/images/banner1.png'),
  require('../../assets/images/bannerr2.png'),
  require('../../assets/images/bannerr3.png'),
 
];

// --- Banner Carousel ---
const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Ensure we have images before starting the interval
    if (bannerImages.length === 0) return;

    const interval = setInterval(() => {
      if (scrollViewRef.current) {
        // Calculate the next index, wrapping around
        const nextIndex = (currentIndex + 1) % bannerImages.length;
        setCurrentIndex(nextIndex); 
        // Scroll to the next slide
        scrollViewRef.current.scrollTo({ x: nextIndex * width, animated: true });
      }
    }, 3000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Handle case where there are no banner images
  if (bannerImages.length === 0) {
      return <View style={styles.bannerContainer}><Text>No banners available.</Text></View>;
  }

  return (
    <View style={styles.bannerContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false } // Scroll events require useNativeDriver: false
        )}
        scrollEventThrottle={16} // How often scroll events fire (milliseconds)
        decelerationRate="fast" // How quickly the scroll view slows down
      >
        {bannerImages.map((imageSource, index) => (
          <View key={index} style={[styles.bannerSlide, { width }]}>
            <Image
              // Handle both require() (number) and {uri: ...} (object) formats
              source={typeof imageSource === 'number' ? imageSource : imageSource}
              style={styles.bannerImage}
              resizeMode="cover"
              onError={(e) => console.log('Banner Image Error:', e.nativeEvent.error)}
            />
          </View>
        ))}
      </ScrollView>
      {/* Pagination Dots */}
      <View style={styles.paginationDots}>
        {bannerImages.map((_, index) => {
          // Define the scroll range for this dot to be active
          const inputRange = [
            (index - 1) * width, // Previous slide
            index * width,       // Current slide
            (index + 1) * width, // Next slide
          ];
          // Interpolate scale based on scroll position
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8], // Scale down, up, down
            extrapolate: 'clamp', // Don't extrapolate beyond the defined range
          });
          // Interpolate opacity based on scroll position
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4], // Fade out, in, out
            extrapolate: 'clamp',
          });
          // Return the animated dot view
          return (
            <Animated.View
              key={`dot-${index}`}
              style={[ styles.dot, { opacity, transform: [{ scale }] } ]}
            />
          );
        })}
      </View>
    </View>
  );
};


// --- Reminder Interface ---
interface Reminder {
  _id: string;
  name: string;
  description: string;
  days: string[]; // e.g., ['Mon', 'Wed', 'Fri']
  times: {
    time: string; // e.g., "09:00" (HH:mm format)
    dose: number;
    completed?: { [day: string]: boolean }; // Optional tracking
  }[];
  totalDoses?: number; // Optional
  createdAt?: string; // Optional
}

// --- Animated Reminder Card ---
const ReminderCard = ({ reminder, navigation }: { reminder: Reminder, navigation: any }) => {
  // Simplified state for pressed appearance
  const [isPressed, setIsPressed] = useState(false);

  // Helper to format 24-hour time string (HH:mm) to 12-hour AM/PM format
  const formatDisplayTime = (time24: string): string => {
      if (!time24 || !time24.includes(':')) return 'Invalid Time';
      const [hourStr, minuteStr] = time24.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (isNaN(hour) || isNaN(minute)) return 'Invalid Time';

      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12; // Convert 0/12 to 12
      return `${hour12}:${minute < 10 ? '0' : ''}${minute} ${ampm}`; // Add leading zero to minute if needed
  };

  // Function to calculate the next specific time this reminder should be taken
  const getNextReminderTimeInfo = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., 'Mon'
    const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:mm format

    // Validate reminder structure
    if (!reminder || !Array.isArray(reminder.days) || !Array.isArray(reminder.times)) {
      console.warn('Invalid reminder structure in getNextReminderTimeInfo:', reminder?._id);
      return null;
    }

    let nextReminderInfo: { day: string; time: string; dose: number; timestamp: number } | null = null;

    // Check the next 7 days (including today)
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + i);
      const checkDay = checkDate.toLocaleDateString('en-US', { weekday: 'short' });

      // If the reminder is scheduled for this day of the week
      if (reminder.days.includes(checkDay)) {
        // Get valid times for this day, sorted chronologically
        const sortedTimes = reminder.times
          .filter(t => typeof t === 'object' && t !== null && typeof t.time === 'string' && /^\d{2}:\d{2}$/.test(t.time))
          // If checking today (i=0), only consider times later than the current time
          .filter(t => i > 0 || t.time > currentTime)
          .sort((a, b) => a.time.localeCompare(b.time));

        // If there are valid upcoming times on this day
        if (sortedTimes.length > 0) {
          const nextTimeSlot = sortedTimes[0]; // The earliest upcoming time slot
          const [hour, minute] = nextTimeSlot.time.split(':').map(Number);
          // Create the full Date object for this specific reminder instance
          const reminderDateTime = new Date(checkDate);
          reminderDateTime.setHours(hour, minute, 0, 0);

          // Store the details of this upcoming instance
          nextReminderInfo = {
              day: checkDay,
              time: nextTimeSlot.time, // Store 24-hour time
              dose: nextTimeSlot.dose ?? 1, // Default dose to 1 if not provided
              timestamp: reminderDateTime.getTime() // Store timestamp for comparison/key
          };
          // Found the earliest time for *this* reminder, no need to check further days
          break; // Exit the outer day loop (for i)
        }
      }
    }
    // Return the details of the next occurrence, or null if none found in the next 7 days
    return nextReminderInfo;
  };

  // Calculate the next reminder time for this specific card
  const nextReminder = getNextReminderTimeInfo();

  // Don't render the card if this reminder has no upcoming times within the next week
  if (!nextReminder) return null;

  return (
    <TouchableOpacity
      style={[
        styles.reminderCard,
        isPressed && { backgroundColor: '#F8F8F8' } // Subtle background change on press
      ]}
      activeOpacity={0.9}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      // Navigate to the Reminder screen, passing the ID
      onPress={() => navigation.navigate('Reminder', { reminderId: reminder._id })}
    >
      {/* Card Header */}
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <View style={[styles.reminderIconContainer, { backgroundColor: '#5856D61A' }]}>
            <MaterialIcon name="medication" size={24} color="#1e948b" />
          </View>
          <View style={styles.reminderDetails}>
            <Text style={styles.reminderName}>{reminder.name || 'Unnamed Reminder'}</Text>
            {/* Show description if it exists */}
            {reminder.description && (
                <Text style={styles.reminderDescription} numberOfLines={2} ellipsizeMode="tail">
                    {reminder.description}
                </Text>
            )}
          </View>
        </View>
      </View>
      {/* Divider */}
      <View style={styles.reminderDivider} />
      {/* Card Footer */}
      <View style={styles.reminderFooter}>
        {/* Day */}
        <View style={styles.reminderTimeInfo}>
          <MaterialIcon name="event" size={20} color="#1e948b" />
          <Text style={styles.reminderTimeText}>{nextReminder.day}</Text>
        </View>
        {/* Time */}
        <View style={styles.reminderTimeInfo}>
          <MaterialIcon name="access-time" size={20} color="#1e948b" />
          {/* Display formatted time */}
          <Text style={styles.reminderTimeText}>{formatDisplayTime(nextReminder.time)}</Text>
        </View>
        {/* Dose */}
        <View style={styles.reminderTimeInfo}>
          <MaterialIcon name="medication" size={20} color="#1e948b" />
          <Text style={styles.reminderTimeText}>{nextReminder.dose} dose(s)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Animated Search Results ---
const SearchResults = ({ searchResults, navigation }: { searchResults: { services: any[], reminders: Reminder[] }, navigation: any }) => {
  // Animation for overall container fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Use a Map to store animation values for each result item (service or reminder)
  const itemAnims = useRef(new Map<string, Animated.Value>()).current;

  // Function to get or create an animation value for a given item key
  const getItemAnimationValue = useCallback((key: string, itemAnims: Map<string, Animated.Value>) => {
    if (!itemAnims.has(key)) {
      // If animation doesn't exist for this key, create it (initially 0)
      itemAnims.set(key, new Animated.Value(0));
    }
    return itemAnims.get(key)!; // Return the existing or new Animated.Value
  }, []);

  // Effect to run animations when searchResults change
  useEffect(() => {
      // 1. Animate the container fade-in
      fadeAnim.setValue(0); // Reset animation value
      Animated.timing(fadeAnim, {
          toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true,
      }).start();

      // 2. Prepare items for staggered animation
      const allItems = [
          ...(searchResults?.services?.map(s => ({ ...s, type: 'service', key: `service-${s.route}` })) || []),
          ...(searchResults?.reminders?.map(r => ({ ...r, type: 'reminder', key: `reminder-${r._id}` })) || [])
      ];

      // Optional: Clean up animations for items no longer in the results
      const currentKeys = new Set(allItems.map(item => item.key));
      itemAnims.forEach((_, key) => {
          if (!currentKeys.has(key)) {
              itemAnims.delete(key); // Remove animation value if item is gone
          }
      });

      // 3. Create individual item animations (fade-in + slide-up)
      const animations = allItems.map(item => {
          const animValue = getItemAnimationValue(item.key, itemAnims);
          animValue.setValue(0); // Reset item animation
          return Animated.timing(animValue, {
              toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true, // Opacity+Transform safe for native driver
          });
      });

      // 4. Start the item animations with a stagger delay
      Animated.stagger(80, animations).start(); // 80ms delay between each item animation

  }, [searchResults, fadeAnim, getItemAnimationValue, itemAnims]); // Added missing dependencies

  // Function to get the style object for an animated item
  const getItemAnimationStyle = useCallback((key: string) => {
      const animValue = getItemAnimationValue(key, itemAnims);
      return {
          opacity: animValue, // Apply opacity directly
          transform: [
              { // Apply translateY transformation
                  translateY: animValue.interpolate({
                      inputRange: [0, 1], outputRange: [15, 0], // Slide up from 15px below
                      extrapolate: 'clamp',
                  }),
              },
          ],
      };
  }, [getItemAnimationValue, itemAnims]);

  // Check if there are any results
  const hasServices = searchResults?.services?.length > 0;
  const hasReminders = searchResults?.reminders?.length > 0;
  const hasResults = hasServices || hasReminders;

  // Return the Animated.View directly, no ScrollView here
  return (
    // Apply fade-in animation to the whole results container
    <Animated.View style={[styles.searchResultsContainer, { opacity: fadeAnim }]}>
        {/* Show title only if there are results */}
        {hasResults && <Text style={styles.searchResultsTitle}>Search Results</Text>}

        {/* Services Section */}
        {hasServices && (
            <>
                <Text style={styles.searchResultsSubtitle}>Services</Text>
                {searchResults.services.map((service) => {
                    const key = `service-${service.route}`;
                    return (
                        <Animated.View key={key} style={getItemAnimationStyle(key)}>
                            <TouchableOpacity
                                style={styles.searchResultItem}
                                onPress={() => navigation.navigate(service.route)}
                                activeOpacity={0.7}
                            >
                                {/* Icon */}
                                <View style={[styles.searchResultIconContainer, { backgroundColor: `${service.color}1A` }]}>
                                    <MaterialIcon name={service.icon} size={22} color={service.color} />
                                </View>
                                {/* Text Info */}
                                <View style={styles.searchResultInfo}>
                                    <Text style={styles.searchResultName}>{service.name}</Text>
                                    <Text style={styles.searchResultDescription}>{service.description}</Text>
                                </View>
                                {/* Chevron Icon */}
                                <MaterialIcon name="chevron-right" size={24} color="#1e948b" />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </>
        )}

        {/* Reminders Section */}
        {hasReminders && (
            <>
                <Text style={styles.searchResultsSubtitle}>Medications</Text>
                {searchResults.reminders.map((reminder) => {
                     const key = `reminder-${reminder._id}`;
                    return (
                        <Animated.View key={key} style={getItemAnimationStyle(key)}>
                            <TouchableOpacity
                                style={styles.searchResultItem}
                                onPress={() => navigation.navigate('Reminder', { reminderId: reminder._id })}
                                activeOpacity={0.7}
                            >
                                {/* Icon */}
                                <View style={[styles.searchResultIconContainer, { backgroundColor: '#1e948b1A' }]}>
                                    <MaterialIcon name="medication" size={22} color="#1e948b" />
                                </View>
                                {/* Text Info */}
                                <View style={styles.searchResultInfo}>
                                    <Text style={styles.searchResultName}>{reminder.name || 'Unnamed Medication'}</Text>
                                    {reminder.description && (
                                        <Text style={styles.searchResultDescription} numberOfLines={1}>{reminder.description}</Text>
                                    )}
                                </View>
                                {/* Chevron Icon */}
                                <MaterialIcon name="chevron-right" size={24} color="#1e948b" />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </>
        )}

        {/* No Results Message */}
        {!hasResults && (
            <View style={styles.noResultsContainer}>
                <MaterialIcon name="search-off" size={48} color="#AEAEB2" />
                <Text style={styles.noResultsText}>No results found.</Text>
            </View>
        )}
    </Animated.View>
  );
};


// --- Animated Service Card ---
const AnimatedServiceCard = ({ service, index: _index, navigation }: { service: any, index: number, navigation: any }) => {
  // Background color animation
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View style={styles.serviceCardContainer}>
      <TouchableOpacity
        style={[
          styles.serviceCardTouchable,
          isPressed && { backgroundColor: '#F8F8F8' } // Subtle background change on press
        ]}
        onPress={() => navigation.navigate(service.route)}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={0.9}
      >
        {/* Icon */}
        <View style={[styles.serviceIconContainer, { backgroundColor: `${service.color}1A` }]}>
          <MaterialIcon name={service.icon} size={28} color={service.color} />
        </View>
        {/* Text */}
        <Text style={styles.serviceText}>{service.name}</Text>
        <Text style={styles.serviceDescription}>{service.description}</Text>
      </TouchableOpacity>
    </View>
  );
};


// --- Main Home Screen Component ---
const HomeMainScreen = ({ navigation }: { navigation: any }) => {
  // State variables
  const [userData, setUserData] = useState<{ username: string; profilePhoto?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ services: any[], reminders: Reminder[] }>({ services: [], reminders: [] });
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Animation values for different sections
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const servicesAnim = useRef(new Animated.Value(0)).current;
  const reminderAnim = useRef(new Animated.Value(0)).current;

  // Static data for services - wrap in useMemo to prevent recreation on each render
  const services = useMemo(() => [
    { name: 'Inventory', icon: 'inventory-2', color: '#5856D6', route: 'Medicines', description: 'Track your medications' },
    { name: 'Counterfeit', icon: 'verified-user', color: '#FF7D6B', route: 'Hospital', description: 'Verify your medicine' },
    { name: 'Find Hospitals', icon: 'local-hospital', color: '#7C4DFF', route: 'FindHospitals', description: 'Find nearby hospitals' },
    { name: 'AI ChatBot', icon: 'chat', color: '#4ECDC4', route: 'AI_ChatBot', description: 'Get AI assistance' },
  ], []);

  // --- Search Logic ---
  // Ref to store the debounce timer
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Item animations map - create at top level
  const itemAnims = useRef(new Map<string, Animated.Value>()).current;
  
  // Function to get or create an animation value for a given item key
  const getItemAnimationValue = useCallback((key: string) => {
    if (!itemAnims.has(key)) {
      // If animation doesn't exist for this key, create it (initially 0)
      itemAnims.set(key, new Animated.Value(0));
    }
    return itemAnims.get(key)!; // Return the existing or new Animated.Value
  }, [itemAnims]);

  // Function to start animations for home screen sections
  const startSectionAnimations = useCallback(() => {
    // Start the sequence of animations
    Animated.sequence([
      // 1. Fade in Header
      Animated.timing(headerFadeAnim, {
        toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
      }),
      // 2. Stagger animation for content sections
      Animated.stagger(120, [ // 120ms delay between each section
        // Animate Banner (Opacity + TranslateY)
        Animated.parallel([
          Animated.timing(bannerAnim, {
            toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
          }),
        ]),
        // Animate Services (Opacity + TranslateY)
        Animated.parallel([
          Animated.timing(servicesAnim, {
            toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
          }),
        ]),
        // Animate Reminder Section only if user is logged in
        (userData?.username !== 'Guest') ? Animated.parallel([
          Animated.timing(reminderAnim, {
            toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
          }),
        ]) : Animated.delay(0), // If guest, just add a zero delay placeholder
      ]),
    ]).start(); // Start the animation sequence
  }, [bannerAnim, headerFadeAnim, reminderAnim, servicesAnim, userData?.username]);

  // Function to reset animations before refreshing content
  const resetAnimations = useCallback(() => {
    headerFadeAnim.setValue(0);
    bannerAnim.setValue(0);
    servicesAnim.setValue(0);
    reminderAnim.setValue(0);
  }, [bannerAnim, headerFadeAnim, reminderAnim, servicesAnim]);

  // Function to fetch user data and reminders
  const fetchUserDataAndReminders = useCallback(async () => {
    try {
      // Attempt to get username from AsyncStorage
      const storedUser = await AsyncStorage.getItem('username');
      let username = 'Guest'; // Default to Guest

      if (storedUser) {
        // If user found, set state and fetch reminders
        username = storedUser;
        
        try {
          // Fetch user profile data including profile photo
          const profileResponse = await axios.get(`${API_BASE_URL}/api/users/${username}/profile`);
          
          if (profileResponse.data.success) {
            setUserData({ 
              username: username,
              profilePhoto: profileResponse.data.profilePhoto || null 
            });
          } else {
            console.warn('Failed to fetch profile data:', profileResponse.data.message);
            setUserData({ username: username });
          }
        } catch (profileError) {
          console.error('Error fetching profile data:', profileError);
          setUserData({ username: username });
        }

        try {
          console.log(`Fetching reminders for user: ${username}`); // Log username
          const response = await axios.get(`${API_BASE_URL}/api/remind/${username}`);
          if (response.data.success && Array.isArray(response.data.reminders)) {
            console.log(`Fetched ${response.data.reminders.length} reminders.`);
            setReminders(response.data.reminders);
          } else {
            // Log failure reason if provided by API
            console.warn('Failed to fetch reminders:', response.data.message || 'API success false or reminders not array');
            setReminders([]);
          }
        } catch (apiError) {
          console.error('Error fetching reminders API:', apiError);
          if (axios.isAxiosError(apiError)) {
            // Log detailed Axios error
            console.error('API error status:', apiError.response?.status);
            console.error('API error data:', apiError.response?.data);
          }
          setReminders([]); // Ensure reminders are empty on error
        }
      } else {
        // If no user found, set state to Guest
        console.log('No user identifier found, defaulting to Guest.');
        setUserData({ username: username });
        setReminders([]); // No reminders for Guest
      }
    } catch (error) {
      // Catch errors during AsyncStorage access or other setup
      console.error('Error fetching initial data:', error);
      setUserData({ username: 'Guest' }); // Fallback to Guest state
      setReminders([]);
    }
  }, []);

  // Function to handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    resetAnimations();
    
    try {
      await fetchUserDataAndReminders();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      startSectionAnimations();
      setRefreshing(false);
    }
  }, [fetchUserDataAndReminders, resetAnimations, startSectionAnimations]);

  // Creates the style object for opacity and translateY animation
  const getSectionAnimationStyle = useCallback((animValue: Animated.Value) => {
    return {
      opacity: animValue, // Bind opacity to animation value
      transform: [{ // Bind transform to animation value
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0], // Slide up from 20px below to 0
          extrapolate: 'clamp',
        })
      }]
    };
  }, []);

  // --- Render Profile Button ---
  const renderProfileButton = useCallback(() => {
    if (userData?.profilePhoto) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image 
            source={{ uri: userData.profilePhoto }} 
            style={styles.profilePhoto} 
            onError={() => {
              // If image fails to load, fall back to the icon
              console.warn('Profile photo failed to load, using default icon');
              // You could update state here to use the default icon instead
            }}
          />
        </TouchableOpacity>
      );
    }

    // Fallback to default icon if no profile photo
    return (
      <TouchableOpacity
        activeOpacity={0.2}
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Ionicons name="person-circle-outline" size={40} color="#1e948b" />
      </TouchableOpacity>
    );
  }, [navigation, userData]);

  // Function to perform the actual search based on the query
  const performSearch = useCallback((query: string) => {
    // If query is empty or whitespace, clear search results
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults({ services: [], reminders: [] });
      return;
    }
    // Normalize query for case-insensitive matching
    const normalizedQuery = query.toLowerCase().trim();
    // Filter services based on name or description
    const filteredServices = services.filter(s =>
      s.name.toLowerCase().includes(normalizedQuery) || s.description.toLowerCase().includes(normalizedQuery)
    );
    // Filter reminders based on name or description
    const filteredReminders = reminders.filter(r =>
      r?.name?.toLowerCase().includes(normalizedQuery) || (r?.description && r.description.toLowerCase().includes(normalizedQuery))
    );
    // Update search results state
    setSearchResults({ services: filteredServices, reminders: filteredReminders });
    // Set searching flag to true to display results
    setIsSearching(true);
  }, [reminders, services]);

  // Handler for text input changes (debounced)
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text); // Update input value immediately
    // Clear existing debounce timer if any
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Set a new timer to perform search after a short delay (e.g., 150ms)
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 150);
  }, [performSearch]);

  // Handle scroll to show/hide tab bar - wrapped in useCallback to avoid recreation on each render
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // Determine if the content is actually scrollable by more than a few pixels
    const canScroll = contentHeight > layoutHeight + 5; // 5px threshold for scrollability
    // Determine if effectively at the bottom of scrollable content
    const isEffectivelyAtBottom = canScroll && (layoutHeight + currentScrollY >= contentHeight - 20); // 20px threshold from bottom

    if (isEffectivelyAtBottom) {
      // Rule 1: At the bottom of scrollable content, tab bar should be hidden
      if (isTabBarVisible) {
        setIsTabBarVisible(false);
      }
    } else {
      // Rule 2: Not at the bottom (or content isn't significantly scrollable)
      // Apply original scroll direction logic, or ensure visible if not scrollable/at top.
      if (canScroll && currentScrollY > lastScrollY.current && currentScrollY > 20) {
        // Scrolling down on scrollable content (and not at the very top)
        if (isTabBarVisible) {
          setIsTabBarVisible(false);
        }
      } else {
        // Scrolling up, or at the top of scrollable content, or content isn't scrollable
        if (!isTabBarVisible) {
          setIsTabBarVisible(true);
        }
      }
    }
    
    // Update last scroll position
    lastScrollY.current = currentScrollY;
  }, [isTabBarVisible]);

  // Update tab bar visibility
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarVisible: isTabBarVisible,
    });
  }, [isTabBarVisible, navigation]);

  // --- Reminder Logic ---
  // Function to find the *single closest* upcoming reminder across all items
  // Returns the full info object { timestamp, reminder } or null
  const findClosestReminderInfo = useCallback(() => {
    // Return null if no reminders loaded
    if (!reminders || reminders.length === 0) return null;

    let closestInfo: { timestamp: number; reminder: Reminder } | null = null;
    const now = new Date();
    const currentTime = now.getTime(); // Current time as timestamp

    // Iterate through each reminder
    reminders.forEach(reminder => {
      // Validate structure
      if (!reminder || !Array.isArray(reminder.days) || !Array.isArray(reminder.times)) {
        console.warn(`Skipping invalid reminder structure in findClosestReminderInfo: ${reminder?._id}`);
        return; // Skip to next reminder
      }

      // Check next 7 days for this reminder
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        const checkDay = checkDate.toLocaleDateString('en-US', { weekday: 'short' });

        // If reminder is scheduled for this day
        if (reminder.days.includes(checkDay)) {
          // Get sorted, valid times for this day
          const sortedTimes = reminder.times
            .filter(t => typeof t === 'object' && t !== null && typeof t.time === 'string' && /^\d{2}:\d{2}$/.test(t.time))
            .sort((a, b) => a.time.localeCompare(b.time));

          // Check each time slot on this day
          for (const timeSlot of sortedTimes) {
            const [hour, minute] = timeSlot.time.split(':').map(Number);
            const reminderDateTime = new Date(checkDate);
            reminderDateTime.setHours(hour, minute, 0, 0);
            const reminderTimestamp = reminderDateTime.getTime();

            // If this time is in the future
            if (reminderTimestamp > currentTime) {
              // Check if it's the closest one found *so far* across all reminders
              if (closestInfo === null || reminderTimestamp < closestInfo.timestamp) {
                // Update the overall closest reminder found
                closestInfo = { timestamp: reminderTimestamp, reminder: reminder };
              }
              // Optimization: Since times are sorted for *this day*, we could break the inner `timeSlot` loop here
              // if we only cared about the first time on this day for this reminder.
              // However, we need the absolute minimum across all reminders and days, so we must continue checking
              // all potential future times. The previous `goto` was incorrect here.
            }
          } // End timeSlot loop
        } // End day check
      } // End day loop (0-6)
    }); // End reminders.forEach

    // Return the closest info found (or null)
    return closestInfo;
  }, [reminders]);

  // Calculate closest reminder - memoize the result to avoid recalculating on every render
  const closestReminderInfo = useMemo(() => findClosestReminderInfo(), [findClosestReminderInfo]);

  // --- Data Fetching and Initial Animation ---
  useEffect(() => {
    const fetchDataAndAnimate = async () => {
      try {
        setLoading(true);
        resetAnimations();
        
        // Split data fetching and animation to improve perceived performance
        const fetchPromise = fetchUserDataAndReminders();
        
        // Start animations early for a faster perceived load
        // Wait a small delay to ensure some content is ready
        setTimeout(() => {
          setLoading(false);
          startSectionAnimations();
        }, 300);
        
        // Still await the full data load
        await fetchPromise;
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setUserData({ username: 'Guest' });
        setReminders([]);
        setLoading(false);
        startSectionAnimations();
      }
    };

    fetchDataAndAnimate();

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [fetchUserDataAndReminders, resetAnimations, startSectionAnimations]);

  // --- Navigation Focus Listener ---
  useEffect(() => {
    // Add listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset search state when screen is focused
      setSearchQuery('');
      setIsSearching(false);
      setSearchResults({ services: [], reminders: [] });
      // Clear any pending debounce timer
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Refresh data when returning to this screen
      const refreshData = async () => {
        resetAnimations();
        await fetchUserDataAndReminders();
        startSectionAnimations();
      };
      
      refreshData();
    });
    
    // Return the unsubscribe function to clean up the listener on unmount
    return unsubscribe;
  }, [fetchUserDataAndReminders, navigation, resetAnimations, startSectionAnimations]);

  // --- Loading State ---
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e948b" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Function to get the style object for an animated item
  const getItemAnimationStyle = (key: string) => {
    const animValue = getItemAnimationValue(key);
    return {
      opacity: animValue, // Apply opacity directly
      transform: [{ // Apply translateY transformation
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [15, 0], // Slide up from 15px below
          extrapolate: 'clamp',
        }),
      }],
    };
  };

  // --- Render Main Screen UI ---
  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        // Show loading indicator only while initially loading
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e948b" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : isSearching ? (
        // Show Search Results ScrollView
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="never"
            contentContainerStyle={styles.scrollContentContainer}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#1e948b']}
                tintColor="#1e948b"
              />
            }
        >
            {/* Header */}
            <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
                <View>
                <Text style={styles.greeting}>Hello,</Text>
                <Text style={styles.userName}>{userData?.username || 'Guest'} 👋</Text>
                </View>
                {renderProfileButton()}
            </Animated.View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                <MaterialIcon name="search" size={22} color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search services or medications..."
                    placeholderTextColor="#8E8E93"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && Platform.OS === 'android' && (
                    <TouchableOpacity
                    onPress={() => { handleSearchChange(''); }}
                    style={styles.clearButton}
                    >
                    <MaterialIcon name="cancel" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                )}
                </View>
            </View>

            {/* Search Results Component */}
            <SearchResults
                searchResults={searchResults}
                navigation={navigation}
            />
        </ScrollView>
      ) : (
        // Show Main Content ScrollView
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={styles.scrollContentContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1e948b']}
              tintColor="#1e948b"
            />
          }
        >
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>{userData?.username || 'Guest'} 👋</Text>
            </View>
            {renderProfileButton()}
          </Animated.View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <MaterialIcon name="search" size={22} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                placeholder="Search services or medications..."
                placeholderTextColor="#8E8E93"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearchChange}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && Platform.OS === 'android' && (
                <TouchableOpacity
                  onPress={() => { handleSearchChange(''); }}
                  style={styles.clearButton}
                >
                  <MaterialIcon name="cancel" size={20} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Animated Banner Section */}
          <Animated.View style={getSectionAnimationStyle(bannerAnim)}>
            <BannerCarousel />
          </Animated.View>

          {/* Animated Services Section */}
          <Animated.View style={getSectionAnimationStyle(servicesAnim)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Our Services</Text>
            </View>
            <View style={styles.servicesGrid}>
              {services.map((service, index) => (
                <AnimatedServiceCard
                  key={service.route}
                  service={service}
                  index={index}
                  navigation={navigation}
                />
              ))}
            </View>
          </Animated.View>

          {/* Animated Upcoming Reminder Section */}
          {userData?.username !== 'Guest' && (
              <Animated.View style={getSectionAnimationStyle(reminderAnim)}>
                  <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Upcoming Reminder</Text>
                      <TouchableOpacity
                          onPress={() => navigation.navigate('Reminders')}
                          style={styles.seeAllButton}
                      >
                          <Text style={styles.sectionLink}>See All</Text>
                      </TouchableOpacity>
                  </View>
                  {closestReminderInfo ? (
                      <ReminderCard
                          key={`${closestReminderInfo.reminder?._id}-${closestReminderInfo.timestamp}`}
                          reminder={closestReminderInfo.reminder}
                          navigation={navigation}
                      />
                  ) : (
                      <View style={styles.emptyReminders}>
                          <MaterialIcon name="notifications-off" size={48} color="#AEAEB2" />
                          <Text style={styles.emptyRemindersText}>No upcoming reminders</Text>
                      </View>
                  )}
              </Animated.View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// --- Stack Navigator Setup ---
const HomeOptionsNavigator = () => (
  <Stack.Navigator
    screenOptions={{
        headerShown: false, // Hide default header for all screens in this stack
        // animationEnabled: true, // Removed due to linter error, not a standard option here
    }}
  >
    {/* Define screens in the stack */}
    <Stack.Screen name="HomeMain" component={HomeMainScreen} />
    <Stack.Screen name="Medicines" component={InventoryScreen} />
    <Stack.Screen 
      name="Hospital" 
      component={HospitalScreen} 
    />
    <Stack.Screen name="AI_ChatBot" component={AI_ChatBot} />
    <Stack.Screen name="FindHospitals" component={FindHospitals} />
    <Stack.Screen name="Profile" component={ProfileScreenApp} />
    {/* Ensure ReminderScreen can handle both viewing a single reminder (with param) and the list */}
    <Stack.Screen name="Reminder" component={ReminderScreen} />
    <Stack.Screen name="Reminders" component={ReminderScreen} />
  </Stack.Navigator>
);

// --- Main Export ---
// This component likely renders the stack navigator within a NavigationContainer
// (assuming NavigationContainer is set up higher in the component tree)
const HomeScreen = () => {
  return <HomeOptionsNavigator />;
};

// --- Styles ---
// NOTE: Ensure 'Poppins' fonts (if used uncommented) are correctly linked in native projects
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA', // Light grey background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Handle Android status bar
  },
  container: { // Style for the main ScrollView (used for both content and search)
    flex: 1,
    // Remove background color here if SearchResults has its own
    // backgroundColor: '#F7F8FA', // Keep overall screen background in safeArea
  },
  scrollContentContainer: { // Padding for content inside the ScrollView
    paddingHorizontal: 16,
    paddingBottom: 5, // Keep reduced bottom padding
  },
  loadingContainer: { // Centered loading indicator
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },
  loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: '#666',
      fontFamily: 'Poppins-Regular',
  },
  header: { // Moved inside ScrollView, adjust margins if needed
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    // paddingHorizontal: 16, // Padding now handled by scrollContentContainer
  },
  greeting: {
    fontSize: 14,
    color: '#6C6C70',
    fontFamily: 'Poppins-Regular',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: 'Poppins-Bold',
  },
  profileButton: {
    padding: 5,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e948b',
  },
  searchContainer: { // Moved inside ScrollView
    marginTop: 10,
    // paddingHorizontal: 16, // Padding now handled by scrollContentContainer
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 54, // Increased from 48 to 54 for more vertical space
    borderWidth: 1,
    borderColor: '#EFEFF4',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
      marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    height: '100%',
    paddingVertical: 12, // Added vertical padding
    fontFamily: 'Poppins-Regular',
  },
  clearButton: {
      padding: 5,
      marginLeft: 5,
  },
  // Styles for SearchResults component (adjusted)
  // searchResultsScrollView: { // REMOVED - ScrollView is now outside
  //     flex: 1,
  //     backgroundColor: '#FFFFFF', // Keep distinct background if desired
  // },
  searchResultsContainer: { // Now the main container for results, padding handled outside
    // paddingHorizontal: 16, // Handled by scrollContentContainer
    // paddingTop: 5, // Adjust as needed
    paddingBottom: 20, // Space at the bottom of results
    backgroundColor: '#FFFFFF', // Keep distinct background for the results area
    borderRadius: 12, // Optional: Give results area rounded corners
    marginTop: 5, // Add some space below search bar
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    // Add a subtle shadow on iOS that doesn't cause artifacts
    ...(Platform.OS === 'ios' ? {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    } : {}),
    padding: 16, // Add internal padding
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 10,
    // marginTop: 5, // Removed, padding handled by container
    fontFamily: 'Poppins-Bold',
  },
  searchResultsSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C3C43',
    opacity: 0.8,
    marginTop: 15,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF4',
  },
  searchResultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
    marginRight: 8,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  searchResultDescription: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'Poppins-Regular',
  },
  noResultsContainer: {
      flex: 1, // Take space within the results container
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 50,
      minHeight: 200,
  },
  noResultsText: {
      marginTop: 15,
      fontSize: 14,
      color: '#AEAEB2',
      textAlign: 'center',
      fontFamily: 'Poppins-Regular',
  },
  // Banner Styles (Unchanged)
  bannerContainer: {
    height: 180,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EFEFF4',
  },
  bannerSlide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  // Section Styles (Unchanged)
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: 'Poppins-Bold',
    letterSpacing: -0.5,
  },
  seeAllButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
  },
  sectionLink: {
    fontSize: 13,
    color: '#1e948b',
    fontWeight: '500',
    fontFamily: 'Poppins-Bold',
  },
  // Services Grid Styles
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  serviceCardContainer: {
    width: '47%',
    marginBottom: 18,
  },
  serviceCardTouchable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    // Add a subtle shadow on iOS that doesn't cause artifacts
    ...(Platform.OS === 'ios' ? {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    } : {}),
    height: 160,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  serviceDescription: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    minHeight: 30,
    fontFamily: 'Poppins-Regular',
  },
  // Reminder Card Styles (Unchanged)
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    // Add a subtle shadow on iOS that doesn't cause artifacts
    ...(Platform.OS === 'ios' ? {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    } : {}),
  },
  reminderHeader: {
    padding: 16,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reminderIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  reminderDescription: {
    fontSize: 12,
    color: '#6C6C70',
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  reminderDivider: {
    height: 1,
    backgroundColor: '#EFEFF4',
    marginHorizontal: 16,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  reminderTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTimeText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#1e948b',
    fontWeight: '500',
    fontFamily: 'Poppins-Bold',
  },
  emptyReminders: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFF4',
    marginBottom: 15,
  },
  emptyRemindersText: {
    marginTop: 15,
    fontSize: 14,
    color: '#AEAEB2',
    fontFamily: 'Poppins-Regular',
  },
});

export default HomeScreen;
