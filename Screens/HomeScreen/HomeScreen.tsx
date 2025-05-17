import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
require('dotenv').config();
import { API_BASE_URL } from '@env';


// Screen Imports (ensure paths are correct)
import InventoryScreen from '../Reminder/InventoryScreen';
import HospitalScreen from './CounterfietDetection';
import FindHospitals from './FindHospitals';
import ProfileScreenApp from '../Profile/ProfileScreen';
import ReminderScreen from '../Reminder/ReminderScreen';
import AI_ChatBot from './AI_ChatBot';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');
 // Consider moving to a config file

// Banner Images (ensure paths are correct)
const bannerImages = [
  require('../../assets/images/banner1.png'),
  require('../../assets/images/bannerr2.png'),
  require('../../assets/images/bannerr3.png'),
];

// --- Modernized Color Palette ---
const AppColors = {
  primary: '#1e948b', // Main teal
  primaryDark: '#157A70', // Darker teal for depth
  accent: '#FF8A75', // Softer coral accent
  background: '#F8F9FA', // Cleaner off-white background
  cardBackground: '#FFFFFF',
  textPrimary: '#1A202C', // Darker, modern text
  textSecondary: '#4A5568', // Softer grey for secondary text
  textDisabled: '#A0AEC0', // For disabled or placeholder text
  lightGrey: '#E2E8F0', // For subtle borders
  shadowColor: 'rgba(0, 0, 0, 0.08)', // Softer shadow
  iconDefault: '#6B7280', // Default icon color
};

// --- Banner Carousel ---
const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (bannerImages.length === 0) return;
    const interval = setInterval(() => {
      if (scrollViewRef.current) {
        const nextIndex = (currentIndex + 1) % bannerImages.length;
        setCurrentIndex(nextIndex);
        scrollViewRef.current.scrollTo({ x: nextIndex * width, animated: true });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  if (bannerImages.length === 0) {
      return <View style={styles.bannerContainer}><Text style={{color: AppColors.textSecondary}}>No banners available.</Text></View>;
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
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {bannerImages.map((imageSource, index) => (
          <View key={index} style={[styles.bannerSlide, { width }]}>
            <Image
              source={typeof imageSource === 'number' ? imageSource : imageSource}
              style={styles.bannerImage}
              resizeMode="cover"
              onError={(e) => console.log('Banner Image Error:', e.nativeEvent.error)}
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.paginationDots}>
        {bannerImages.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.3, 0.8], // Emphasize active dot more
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });
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
  days: string[];
  times: {
    time: string;
    dose: number;
    completed?: { [day: string]: boolean };
  }[];
  totalDoses?: number;
  createdAt?: string;
}

// --- Modernized Reminder Card ---
const ReminderCard = ({ reminder, navigation }: { reminder: Reminder, navigation: any }) => {
  const [isPressed, setIsPressed] = useState(false);

  const formatDisplayTime = (time24: string): string => {
      if (!time24 || !time24.includes(':')) return 'Invalid Time';
      const [hourStr, minuteStr] = time24.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (isNaN(hour) || isNaN(minute)) return 'Invalid Time';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minute < 10 ? '0' : ''}${minute} ${ampm}`;
  };

  const getNextReminderTimeInfo = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
    const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    if (!reminder || !Array.isArray(reminder.days) || !Array.isArray(reminder.times)) {
      console.warn('Invalid reminder structure in getNextReminderTimeInfo:', reminder?._id);
      return null;
    }

    let nextReminderInfo: { day: string; time: string; dose: number; timestamp: number } | null = null;

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + i);
      const checkDay = checkDate.toLocaleDateString('en-US', { weekday: 'short' });

      if (reminder.days.includes(checkDay)) {
        const sortedTimes = reminder.times
          .filter(t => typeof t === 'object' && t !== null && typeof t.time === 'string' && /^\d{2}:\d{2}$/.test(t.time))
          .filter(t => i > 0 || t.time > currentTime)
          .sort((a, b) => a.time.localeCompare(b.time));

        if (sortedTimes.length > 0) {
          const nextTimeSlot = sortedTimes[0];
          const [hour, minute] = nextTimeSlot.time.split(':').map(Number);
          const reminderDateTime = new Date(checkDate);
          reminderDateTime.setHours(hour, minute, 0, 0);
          nextReminderInfo = {
              day: checkDay,
              time: nextTimeSlot.time,
              dose: nextTimeSlot.dose ?? 1,
              timestamp: reminderDateTime.getTime()
          };
          break;
        }
      }
    }
    return nextReminderInfo;
  };

  const nextReminder = getNextReminderTimeInfo();
  if (!nextReminder) return null;

  return (
    <TouchableOpacity
      style={[
        styles.reminderCard,
        isPressed && styles.cardPressed // Modernized pressed state
      ]}
      activeOpacity={0.85} // Slightly higher activeOpacity for better feel
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={() => navigation.navigate('Reminder', { reminderId: reminder._id })}
    >
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <View style={[styles.reminderIconContainer, { backgroundColor: `${AppColors.primary}20` }]}> 
            <MaterialIcon name="medication" size={26} color={AppColors.primary} /> 
          </View>
          <View style={styles.reminderDetails}>
            <Text style={styles.reminderName}>{reminder.name || 'Unnamed Reminder'}</Text>
            {reminder.description && (
                <Text style={styles.reminderDescription} numberOfLines={2} ellipsizeMode="tail">
                    {reminder.description}
                </Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.reminderDivider} />
      <View style={styles.reminderFooter}>
        <View style={styles.reminderTimeInfo}>
          <MaterialIcon name="event" size={20} color={AppColors.primaryDark} />
          <Text style={styles.reminderTimeText}>{nextReminder.day}</Text>
        </View>
        <View style={styles.reminderTimeInfo}>
          <MaterialIcon name="access-time" size={20} color={AppColors.primaryDark} />
          <Text style={styles.reminderTimeText}>{formatDisplayTime(nextReminder.time)}</Text>
        </View>
        <View style={styles.reminderTimeInfo}>
          <MaterialIcon name="medication" size={20} color={AppColors.primaryDark} /> 
          <Text style={styles.reminderTimeText}>{nextReminder.dose} dose(s)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Modernized Search Results ---
const SearchResults = ({ searchResults, navigation }: { searchResults: { services: any[], reminders: Reminder[] }, navigation: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(new Map<string, Animated.Value>()).current;

  const getItemAnimationValue = useCallback((key: string, itemAnimsMap: Map<string, Animated.Value>) => {
    if (!itemAnimsMap.has(key)) {
      itemAnimsMap.set(key, new Animated.Value(0));
    }
    return itemAnimsMap.get(key)!;
  }, []);

  useEffect(() => {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
          toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true,
      }).start();

      const allItems = [
          ...(searchResults?.services?.map(s => ({ ...s, type: 'service', key: `service-${s.route}` })) || []),
          ...(searchResults?.reminders?.map(r => ({ ...r, type: 'reminder', key: `reminder-${r._id}` })) || [])
      ];

      const currentKeys = new Set(allItems.map(item => item.key));
      itemAnims.forEach((_, key) => {
          if (!currentKeys.has(key)) {
              itemAnims.delete(key);
          }
      });

      const animations = allItems.map(item => {
          const animValue = getItemAnimationValue(item.key, itemAnims);
          animValue.setValue(0);
          return Animated.timing(animValue, {
              toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
          });
      });
      Animated.stagger(70, animations).start(); // Slightly faster stagger
  }, [searchResults, fadeAnim, getItemAnimationValue, itemAnims]);

  const getItemAnimationStyle = useCallback((key: string) => {
      const animValue = getItemAnimationValue(key, itemAnims);
      return {
          opacity: animValue,
          transform: [
              {
                  translateY: animValue.interpolate({
                      inputRange: [0, 1], outputRange: [20, 0], // Slightly more slide
                      extrapolate: 'clamp',
                  }),
              },
          ],
      };
  }, [getItemAnimationValue, itemAnims]);

  const hasServices = searchResults?.services?.length > 0;
  const hasReminders = searchResults?.reminders?.length > 0;
  const hasResults = hasServices || hasReminders;

  return (
    <Animated.View style={[styles.searchResultsContainer, { opacity: fadeAnim }]}>
        {hasResults && <Text style={styles.searchResultsTitle}>Search Results</Text>}

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
                                <View style={[styles.searchResultIconContainer, { backgroundColor: `${service.color}20` }]}>
                                    <MaterialIcon name={service.icon} size={24} color={service.color} />
                                </View>
                                <View style={styles.searchResultInfo}>
                                    <Text style={styles.searchResultName}>{service.name}</Text>
                                    <Text style={styles.searchResultDescription}>{service.description}</Text>
                                </View>
                                <MaterialIcon name="chevron-right" size={26} color={AppColors.primary} />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </>
        )}

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
                                <View style={[styles.searchResultIconContainer, { backgroundColor: `${AppColors.primary}20` }]}>
                                    <MaterialIcon name="medication" size={24} color={AppColors.primary} />
                                </View>
                                <View style={styles.searchResultInfo}>
                                    <Text style={styles.searchResultName}>{reminder.name || 'Unnamed Medication'}</Text>
                                    {reminder.description && (
                                        <Text style={styles.searchResultDescription} numberOfLines={1}>{reminder.description}</Text>
                                    )}
                                </View>
                                <MaterialIcon name="chevron-right" size={26} color={AppColors.primary} />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </>
        )}

        {!hasResults && (
            <View style={styles.noResultsContainer}>
                <MaterialIcon name="search-off" size={56} color={AppColors.textDisabled} />
                <Text style={styles.noResultsText}>No results found.</Text>
                <Text style={styles.noResultsSubText}>Try a different search term.</Text>
            </View>
        )}
    </Animated.View>
  );
};

// --- Modernized Animated Service Card ---
const AnimatedServiceCard = ({ service, navigation }: { service: any, navigation: any }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current; // For press animation

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 20 }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  };

  return (
    <View style={styles.serviceCardContainer}>
      <TouchableOpacity
        style={[styles.serviceCardTouchable, isPressed && styles.cardPressed]}
        onPress={() => navigation.navigate(service.route)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1} // Handled by animation
      >
        <Animated.View style={[styles.serviceCardContent, { transform: [{ scale: scaleAnim }] }]}>
            <View style={[styles.serviceIconContainer, { backgroundColor: `${service.color}20` }]}> 
              <MaterialIcon name={service.icon} size={30} color={service.color} /> 
            </View>
            <Text style={styles.serviceText} numberOfLines={1} ellipsizeMode="tail">{service.name}</Text>
            <Text style={styles.serviceDescription} numberOfLines={1} ellipsizeMode="tail">{service.description}</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// --- Main Home Screen Component ---
const HomeMainScreen = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<{ username: string; profilePhoto?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ services: any[], reminders: Reminder[] }>({ services: [], reminders: [] });
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const servicesAnim = useRef(new Animated.Value(0)).current;
  const reminderAnim = useRef(new Animated.Value(0)).current;
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemAnims = useRef(new Map<string, Animated.Value>()).current;

  const services = useMemo(() => [
    { name: 'Inventory', icon: 'inventory-2', color: AppColors.primary, route: 'Medicines', description: 'Track your medications' },
    { name: 'Counterfeit', icon: 'verified-user', color: AppColors.accent, route: 'Hospital', description: 'Verify your medicine' },
    { name: 'Find Hospitals', icon: 'local-hospital', color: '#7C4DFF', route: 'FindHospitals', description: 'Find nearby hospitals' }, // Keeping unique color
    { name: 'AI ChatBot', icon: 'chat-bubble-outline', color: '#4ECDC4', route: 'AI_ChatBot', description: 'Get AI assistance' }, // Changed icon
  ], []);
  
  const getItemAnimationValue = useCallback((key: string) => {
    if (!itemAnims.has(key)) {
      itemAnims.set(key, new Animated.Value(0));
    }
    return itemAnims.get(key)!;
  }, [itemAnims]);

  const startSectionAnimations = useCallback(() => {
    Animated.sequence([
      Animated.timing(headerFadeAnim, {
        toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
      }),
      Animated.stagger(100, [ // Slightly faster stagger
        Animated.parallel([
          Animated.timing(searchBarAnim, {
            toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bannerAnim, {
            toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(servicesAnim, {
            toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
          }),
        ]),
        (userData?.username !== 'Guest') ? Animated.parallel([
          Animated.timing(reminderAnim, {
            toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
          }),
        ]) : Animated.delay(0),
      ]),
    ]).start();
  }, [bannerAnim, headerFadeAnim, reminderAnim, servicesAnim, searchBarAnim, userData?.username]);

  const resetAnimations = useCallback(() => {
    headerFadeAnim.setValue(0);
    searchBarAnim.setValue(0);
    bannerAnim.setValue(0);
    servicesAnim.setValue(0);
    reminderAnim.setValue(0);
  }, [bannerAnim, headerFadeAnim, reminderAnim, servicesAnim, searchBarAnim]);

  const fetchUserDataAndReminders = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem('username');
      let username = 'Guest';

      if (storedUser) {
        username = storedUser;
        try {
          const profileResponse = await axios.get(`${API_BASE_URL}/api/users/${username}/profile`);
          if (profileResponse.data.success) {
            setUserData({ 
              username: username,
              profilePhoto: profileResponse.data.profilePhoto || null 
            });
          } else {
            setUserData({ username: username });
          }
        } catch (profileError) {
          console.error('Error fetching profile data:', profileError);
          setUserData({ username: username });
        }

        try {
          const response = await axios.get(`${API_BASE_URL}/api/remind/${username}`);
          if (response.data.success && Array.isArray(response.data.reminders)) {
            setReminders(response.data.reminders);
          } else {
            setReminders([]);
          }
        } catch (apiError) {
          console.error('Error fetching reminders API:', apiError);
          setReminders([]);
        }
      } else {
        setUserData({ username: username });
        setReminders([]);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setUserData({ username: 'Guest' });
      setReminders([]);
    }
  }, []);

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

  const getSectionAnimationStyle = useCallback((animValue: Animated.Value) => {
    return {
      opacity: animValue,
      transform: [{
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [25, 0], // Slightly more pronounced slide-up
          extrapolate: 'clamp',
        })
      }]
    };
  }, []);

  const renderProfileButton = useCallback(() => {
    if (userData?.profilePhoto) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image 
            source={{ uri: userData.profilePhoto }} 
            style={styles.profilePhoto} 
            onError={() => console.warn('Profile photo failed to load, using default icon')}
          />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Ionicons name="person-circle-outline" size={42} color={AppColors.primary} /> 
      </TouchableOpacity>
    );
  }, [navigation, userData]);

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults({ services: [], reminders: [] });
      return;
    }
    const normalizedQuery = query.toLowerCase().trim();
    const filteredServices = services.filter(s =>
      s.name.toLowerCase().includes(normalizedQuery) || s.description.toLowerCase().includes(normalizedQuery)
    );
    const filteredReminders = reminders.filter(r =>
      r?.name?.toLowerCase().includes(normalizedQuery) || (r?.description && r.description.toLowerCase().includes(normalizedQuery))
    );
    setSearchResults({ services: filteredServices, reminders: filteredReminders });
    setIsSearching(true);
  }, [reminders, services]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 200); // Slightly longer debounce
  }, [performSearch]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    const canScroll = contentHeight > layoutHeight + 10;
    const isEffectivelyAtBottom = canScroll && (layoutHeight + currentScrollY >= contentHeight - 30);

    if (isEffectivelyAtBottom) {
      if (isTabBarVisible) setIsTabBarVisible(false);
    } else {
      if (canScroll && currentScrollY > lastScrollY.current && currentScrollY > 50) { // Increased threshold for hiding
        if (isTabBarVisible) setIsTabBarVisible(false);
      } else if (currentScrollY < lastScrollY.current || currentScrollY < 50) { // Show if scrolling up or near top
        if (!isTabBarVisible) setIsTabBarVisible(true);
      }
    }
    lastScrollY.current = currentScrollY < 0 ? 0 : currentScrollY; // Prevent negative scroll values
  }, [isTabBarVisible]);

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarVisible: isTabBarVisible, // This might be deprecated. Use `tabBarStyle: { display: isTabBarVisible ? 'flex' : 'none' }`
      // For React Navigation 6+, it's better to control tab bar visibility via:
      // tabBarStyle: { display: isTabBarVisible ? 'flex' : 'none' }
      // Or for older versions, you might need a custom tab bar.
      // This example assumes a compatible setup.
    });
  }, [isTabBarVisible, navigation]);

  const findClosestReminderInfo = useCallback(() => {
    if (!reminders || reminders.length === 0) return null;
    let closestInfo: { timestamp: number; reminder: Reminder } | null = null;
    const now = new Date();
    const currentTime = now.getTime();

    reminders.forEach(reminder => {
      if (!reminder || !Array.isArray(reminder.days) || !Array.isArray(reminder.times)) {
        return;
      }
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        const checkDay = checkDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (reminder.days.includes(checkDay)) {
          const sortedTimes = reminder.times
            .filter(t => typeof t === 'object' && t !== null && typeof t.time === 'string' && /^\d{2}:\d{2}$/.test(t.time))
            .sort((a, b) => a.time.localeCompare(b.time));
          for (const timeSlot of sortedTimes) {
            const [hour, minute] = timeSlot.time.split(':').map(Number);
            const reminderDateTime = new Date(checkDate);
            reminderDateTime.setHours(hour, minute, 0, 0);
            const reminderTimestamp = reminderDateTime.getTime();
            if (reminderTimestamp > currentTime) {
              if (closestInfo === null || reminderTimestamp < closestInfo.timestamp) {
                closestInfo = { timestamp: reminderTimestamp, reminder: reminder };
              }
            }
          }
        }
      }
    });
    return closestInfo;
  }, [reminders]);

  const closestReminderInfo = useMemo(() => findClosestReminderInfo(), [findClosestReminderInfo]);

  useEffect(() => {
    const fetchDataAndAnimate = async () => {
      try {
        setLoading(true);
        resetAnimations();
        const fetchPromise = fetchUserDataAndReminders();
        setTimeout(() => {
          setLoading(false);
          startSectionAnimations();
        }, 400); // Slightly longer delay for smoother perceived load
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchQuery('');
      setIsSearching(false);
      setSearchResults({ services: [], reminders: [] });
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      const refreshData = async () => {
        resetAnimations();
        await fetchUserDataAndReminders();
        startSectionAnimations();
      };
      refreshData();
    });
    return unsubscribe;
  }, [fetchUserDataAndReminders, navigation, resetAnimations, startSectionAnimations]);

  if (loading && !refreshing) { // Show full screen loader only on initial load
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
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
                colors={[AppColors.primary]}
                tintColor={AppColors.primary}
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
            <Animated.View style={getSectionAnimationStyle(searchBarAnim)}>
              <View style={styles.searchContainer}>
                  <View style={styles.searchInputContainer}>
                    <MaterialIcon name="search" size={24} color={AppColors.textDisabled} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search services, medications..."
                        placeholderTextColor={AppColors.textDisabled}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                        clearButtonMode="while-editing" // iOS only
                        onFocus={() => setIsTabBarVisible(false)} // Hide tab bar on search focus
                        onBlur={() => setIsTabBarVisible(true)}   // Show tab bar on search blur
                    />
                    {searchQuery.length > 0 && Platform.OS === 'android' && (
                        <TouchableOpacity
                          onPress={() => { handleSearchChange(''); }}
                          style={styles.clearButton}
                        >
                          <MaterialIcon name="cancel" size={22} color={AppColors.textDisabled} />
                        </TouchableOpacity>
                    )}
                  </View>
              </View>
            </Animated.View>

            {isSearching ? (
                <SearchResults
                    searchResults={searchResults}
                    navigation={navigation}
                />
            ) : (
              <>
                
                <Animated.View style={getSectionAnimationStyle(bannerAnim)}>
                  <BannerCarousel />
                </Animated.View>

                
                <Animated.View style={getSectionAnimationStyle(servicesAnim)}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Our Services</Text>
                  </View>
                  <View style={styles.servicesGrid}>
                    {services.map((service, index) => (
                      <AnimatedServiceCard
                        key={service.route}
                        service={service}
                        navigation={navigation}
                      />
                    ))}
                  </View>
                </Animated.View>

                
                {userData?.username !== 'Guest' && (
                    <Animated.View style={getSectionAnimationStyle(reminderAnim)}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Upcoming Reminder</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Reminders')} // Assuming 'Reminders' lists all
                                style={styles.seeAllButton}
                            >
                                <Text style={styles.sectionLink}>See All</Text>
                                <MaterialIcon name="arrow-forward" size={18} color={AppColors.primary} style={{marginLeft: 4}}/>
                            </TouchableOpacity>
                        </View>
                        {closestReminderInfo ? (
                            <ReminderCard
                                key={`${closestReminderInfo.reminder?._id}-${closestReminderInfo.timestamp}`}
                                reminder={closestReminderInfo.reminder}
                                navigation={navigation}
                            />
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <View style={styles.emptyStateIconContainer}>
                                    <MaterialIcon name="notifications-none" size={40} color={AppColors.primary} />
                                </View>
                                <Text style={styles.emptyStateText}>No upcoming reminders.</Text>
                                <Text style={styles.emptyStateSubText}>Set a new reminder to see it here.</Text>
                            </View>
                        )}
                    </Animated.View>
                )}
              </>
            )}
        </ScrollView>
    </SafeAreaView>
  );
};

// --- Stack Navigator Setup ---
const HomeOptionsNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeMainScreen} />
    <Stack.Screen name="Medicines" component={InventoryScreen} />
    <Stack.Screen name="Hospital" component={HospitalScreen} />
    <Stack.Screen name="AI_ChatBot" component={AI_ChatBot} />
    <Stack.Screen name="FindHospitals" component={FindHospitals} />
    <Stack.Screen name="Profile" component={ProfileScreenApp} />
    <Stack.Screen name="Reminder" component={ReminderScreen} />
    <Stack.Screen name="Reminders" component={ReminderScreen} />
  </Stack.Navigator>
);

const HomeScreen = () => {
  return <HomeOptionsNavigator />;
};

// --- Styles ---
// Using 'Poppins' fonts. Ensure they are correctly linked in your native project.
// Example: fontFamily: 'Poppins-Regular', 'Poppins-Medium', 'Poppins-SemiBold', 'Poppins-Bold'
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: 0, // Remove default padding completely
  },
  container: {
    flex: 1,
    paddingTop: 5, // Ensure no padding here
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20, // Remove top padding completely
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  loadingText: {
      marginTop: 1,
      fontSize: 16,
      color: AppColors.textSecondary,
      fontFamily: 'Poppins-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 0,
    marginTop: 0, // Ensure no margin at top
    marginBottom: 15,
  },
  greeting: {
    fontSize: 16,
    color: AppColors.textSecondary,
    fontFamily: 'Poppins-Regular',
    marginTop: 0, // Ensure no margin at top
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
    fontFamily: 'Poppins-Bold',
    marginTop: 0, // Ensure no margin at top
  },
  profileButton: {
    padding: 4, // Reduced padding as icon/image is larger
    borderRadius: 25, // Ensure it's circular if image is
    overflow: 'hidden', // Clip image if it's not perfectly circular
  },
  profilePhoto: {
    width: 44, // Modernized: Slightly larger
    height: 44, // Modernized
    borderRadius: 22, // Modernized
    borderWidth: 2, // Modernized: Thicker border for emphasis
    borderColor: AppColors.primary,
  },
  searchContainer: {
    marginBottom: 20, // Modernized: More space after search
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: 16, // Modernized: More rounded corners
    paddingHorizontal: 15, // Modernized
    height: 56, // Modernized: Taller search bar
    // Modernized: Softer, more layered shadow
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, // Softer opacity
    shadowRadius: 10,   // More blur
    elevation: 3,       // Android shadow
    borderWidth: Platform.OS === 'android' ? 1 : 0, // Subtle border for Android
    borderColor: AppColors.lightGrey, // Subtle border color
  },
  searchIcon: {
      marginRight: 10, // Modernized
  },
  searchInput: {
    flex: 1,
    fontSize: 15, // Modernized
    color: AppColors.textPrimary,
    height: '100%',
    fontFamily: 'Poppins-Regular',
    paddingVertical: 0, // Remove default padding if any
  },
  clearButton: {
      padding: 8, // Larger touch target
      marginLeft: 5,
  },
  // --- Search Results Styles ---
  searchResultsContainer: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: 16, // Modernized
    padding: 16, // Modernized
    marginBottom: 20,
    // Modernized: Consistent shadow style
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchResultsTitle: {
    fontSize: 18, // Modernized
    fontFamily: 'Poppins-SemiBold', // Bolder
    color: AppColors.textPrimary,
    marginBottom: 16, // More space
  },
  searchResultsSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: AppColors.textSecondary,
    opacity: 0.9,
    marginTop: 10, // Reduced from 15
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8, // More spacing
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16, // More padding
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGrey, // Softer border
  },
  searchResultItemLast: { // Style to remove border for the last item
    borderBottomWidth: 0,
  },
  searchResultIconContainer: {
    width: 44, // Modernized
    height: 44, // Modernized
    borderRadius: 12, // More rounded
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // More space
  },
  searchResultInfo: {
    flex: 1,
    marginRight: 10,
  },
  searchResultName: {
    fontSize: 15, // Modernized
    fontFamily: 'Poppins-Medium',
    color: AppColors.textPrimary,
    marginBottom: 3,
  },
  searchResultDescription: {
    fontSize: 13, // Modernized
    color: AppColors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  noResultsContainer: { // Modernized Empty State
      alignItems: 'center',
      paddingVertical: 40, // More padding
      minHeight: 250, // Ensure it takes some space
  },
  noResultsText: {
      marginTop: 20,
      fontSize: 17, // Larger
      fontFamily: 'Poppins-SemiBold',
      color: AppColors.textPrimary,
      textAlign: 'center',
  },
  noResultsSubText: { // Added subtext for guidance
      marginTop: 8,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: AppColors.textSecondary,
      textAlign: 'center',
      maxWidth: '80%',
  },
  // --- Banner Styles ---
  bannerContainer: {
    height: 190, // Modernized: Slightly taller
    marginBottom: 25, // Modernized
    borderRadius: 18, // Modernized: More rounded
    overflow: 'hidden',
    backgroundColor: AppColors.lightGrey, // Placeholder background
    // Modernized: Subtle shadow for banner
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
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
    bottom: 12, // Modernized
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: { // Modernized dot style
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly less opaque
    marginHorizontal: 5,
    // Modernized: Softer shadow for dots
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1.5,
    elevation: 2,
  },
  // --- Section Styles ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25, // Modernized
    marginBottom: 18, // Modernized
  },
  sectionTitle: {
    fontSize: 22, // Kept size, but ensure font weight is distinct
    fontFamily: 'Poppins-Bold', // Emphasize with bold
    color: AppColors.textPrimary,
    letterSpacing: -0.2, // Subtle letter spacing
  },
  seeAllButton: { // Modernized "See All"
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: `${AppColors.primary}15`, // Very light primary background
  },
  sectionLink: {
    fontSize: 14, // Modernized
    color: AppColors.primaryDark, // Darker primary for better contrast
    fontFamily: 'Poppins-Medium',
  },
  // --- Services Grid Styles ---
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    // No margin top here, handled by sectionHeader marginBottom
  },
  serviceCardContainer: {
    width: '48%', // Adjusted for slightly more space between cards
    marginBottom: 18, // Consistent margin
  },
  serviceCardTouchable: { // Modernized Service Card
    backgroundColor: AppColors.cardBackground,
    borderRadius: 16, // More rounded
    padding: 16, // Increased padding
    minHeight: 170, // Ensure consistent height
    // Modernized: Consistent shadow style
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: AppColors.lightGrey,
  },
  serviceCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  serviceIconContainer: {
    width: 56, // Larger icon container
    height: 56,
    borderRadius: 16, // Rounded square
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14, // More space
  },
  serviceText: {
    fontSize: 15, // Slightly larger
    fontFamily: 'Poppins-SemiBold', // Bolder
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 12, // Slightly smaller for better hierarchy
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    lineHeight: 18, // Improved line height
    width: '95%', // Constrain width to ensure proper centering and prevent wrapping
  },
  // --- Reminder Card Styles ---
  reminderCard: { // Modernized Reminder Card
    backgroundColor: AppColors.cardBackground,
    borderRadius: 16,
    marginBottom: 20,
    // Modernized: Consistent shadow style
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: AppColors.lightGrey,
  },
  cardPressed: { // Reusable pressed state for cards
    backgroundColor: '#F0F0F0', // Slightly darker on press
    transform: [{scale: 0.98}] // Subtle scale down on press
  },
  reminderHeader: {
    paddingTop: 18, // More padding
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center', // Align items center
  },
  reminderIconContainer: {
    width: 48, // Larger
    height: 48,
    borderRadius: 14, // Rounded square
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderName: {
    fontSize: 16, // Larger
    fontFamily: 'Poppins-SemiBold',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 19,
    fontFamily: 'Poppins-Regular',
  },
  reminderDivider: {
    height: 1,
    backgroundColor: AppColors.lightGrey, // Softer divider
    marginHorizontal: 18, // Match padding
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Space around for better distribution
    alignItems: 'center',
    paddingVertical: 14, // More padding
    paddingHorizontal: 12, // Less horizontal to bring items closer
  },
  reminderTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTimeText: {
    marginLeft: 8,
    fontSize: 13, // Slightly larger
    color: AppColors.primaryDark,
    fontFamily: 'Poppins-Medium',
  },
  // --- Empty State (No Reminders / Generic) ---
  emptyStateContainer: { // Modernized for no reminders
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: AppColors.cardBackground, // Use card background
    borderRadius: 16, // Consistent rounding
    marginVertical: 15, // Margin top/bottom
    // Modernized: Consistent shadow style
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateIconContainer: { // Specific container for icon
    width: 70,
    height: 70,
    borderRadius: 35, // Circular
    backgroundColor: `${AppColors.primary}20`, // Light primary background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: AppColors.textSecondary,
    textAlign: 'center',
    maxWidth: '85%',
  },
});

export default HomeScreen;
