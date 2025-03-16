import React, { useState, useEffect, useRef } from 'react';
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
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import InventoryScreen from '../Reminder/InventoryScreen';
import HospitalScreen from './CounterfietDetection';
import SymptomCheckerScreen from './SymptomCheckerScreen';
import PrescriptionsScreen from '../Profile/PrescriptionsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileScreenApp from '../Profile/ProfileScreen';
import ReminderScreen from '../Reminder/ReminderScreen';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

const BannerCarousel = () => {
  // Banner carousel code unchanged
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef();

  const bannerImages = [
    require('../../assets/images/banner1.png'),
    require('../../assets/images/bannerr2.png'),
    require('../../assets/images/bannerr3.png')
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < bannerImages.length - 1) {
        setCurrentIndex(currentIndex + 1);
        scrollViewRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
      } else {
        setCurrentIndex(0);
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

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
        {bannerImages.map((image, index) => (
          <View key={index} style={styles.bannerSlide}>
            <Image 
              source={image} 
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.paginationDots}>
        {bannerImages.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { 
                  opacity,
                  transform: [{ scale }]
                }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

interface Reminder {
  _id: string;
  name: string;
  description: string;
  days: string[];
  times: {
    time: string;
    dose: number;
    completed: {
      [key: string]: boolean;
    };
  }[];
  totalDoses: number;
  completed: {
    [key: string]: boolean;
  };
  createdAt: string;
}

const ReminderCard = ({ reminder, navigation }) => {
  const getNextReminderTime = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Check if there are any reminders scheduled for later today
    if (reminder.days.includes(currentDay)) {
      const todayTimes = reminder.times
        .filter(t => !t.completed[currentDay])
        .filter(t => t.time > currentTime);
  
      if (todayTimes.length > 0) {
        // Sort times to get the earliest next time
        const nextTime = todayTimes.sort((a, b) => a.time.localeCompare(b.time))[0];
        return {
          day: currentDay,
          time: nextTime.time,
          // Calculate total doses for this time slot
          dose: nextTime.dose
        };
      }
    }
  
    // If no reminders today or all are in the past, find the next day with a reminder
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayIndex = days.indexOf(currentDay);
    
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = days[nextDayIndex];
      
      if (reminder.days.includes(nextDay)) {
        // Found the next day with a reminder
        // Get the earliest time for that day
        const sortedTimes = [...reminder.times].sort((a, b) => 
          a.time.localeCompare(b.time)
        );
        
        if (sortedTimes.length > 0) {
          return {
            day: nextDay,
            time: sortedTimes[0].time,
            dose: sortedTimes[0].dose
          };
        }
      }
    }
  
    return null;
  };

  const nextReminder = getNextReminderTime();

  if (!nextReminder) return null;

  return (
    <TouchableOpacity 
      style={styles.reminderCard} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Reminder', { reminder })}
    >
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <View style={[styles.reminderIcon, { backgroundColor: '#5856D615' }]}>
            <Icon name="medication" size={24} color="#1e948b" />
          </View>
          <View style={styles.reminderDetails}>
            <Text style={styles.reminderName}>{reminder.name}</Text>
            <Text
              style={styles.reminderDescription}
              numberOfLines={4}
              ellipsizeMode="tail"
            >
              {reminder.description}
            </Text>
          </View>
        </View>
        
      </View>
      
      <View style={styles.reminderDivider} />
      
      <View style={styles.reminderFooter}>
        <View style={styles.reminderTimeInfo}>
          <Icon name="event" size={20} color="#1e948b" />
          <Text style={styles.reminderTimeText}>{nextReminder.day}</Text>
        </View>
        <View style={styles.reminderTimeInfo}>
          <Icon name="access-time" size={20} color="#1e948b" />
          <Text style={styles.reminderTimeText}>{nextReminder.time}</Text>
        </View>
        <View style={styles.reminderTimeInfo}>
          <Icon name="medication" size={20} color="#1e948b" />
          <Text style={styles.reminderTimeText}>{nextReminder.dose} dose(s)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// New component for search results
const SearchResults = ({ searchResults, navigation }) => {
  return (
    <View style={styles.searchResultsContainer}>
      <Text style={styles.searchResultsTitle}>Search Results</Text>
      
      {searchResults.services.length > 0 && (
        <>
          <Text style={styles.searchResultsSubtitle}>Services</Text>
          {searchResults.services.map((service, index) => (
            <TouchableOpacity 
              key={`service-${index}`}
              style={styles.searchResultItem}
              onPress={() => navigation.navigate(service.route)}
            >
              <View style={[styles.searchResultIcon, { backgroundColor: `${service.color}15` }]}>
                <Icon name={service.icon} size={22} color={service.color} />
              </View>
              <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultName}>{service.name}</Text>
                <Text style={styles.searchResultDescription}>{service.description}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="##1e948b" />
            </TouchableOpacity>
          ))}
        </>
      )}
      
      {searchResults.reminders.length > 0 && (
        <>
          <Text style={styles.searchResultsSubtitle}>Medications</Text>
          {searchResults.reminders.map((reminder) => (
            <TouchableOpacity 
              key={`reminder-${reminder._id}`}
              style={styles.searchResultItem}
              onPress={() => navigation.navigate('Reminder', { reminder })}
            >
              <View style={[styles.searchResultIcon, { backgroundColor: '#1e948b' }]}>
                <Icon name="medication" size={22} color="#1e948b" />
              </View>
              <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultName}>{reminder.name}</Text>
                <Text style={styles.searchResultDescription} numberOfLines={1}>{reminder.description}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#1e948b" />
            </TouchableOpacity>
          ))}
        </>
      )}
      
      {searchResults.services.length === 0 && searchResults.reminders.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Icon name="search-off" size={40} color="#1e948b" />
          <Text style={styles.noResultsText}>No results found</Text>
        </View>
      )}
    </View>
  );
};

const HomeMainScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({ services: [], reminders: [] });

  const services = [
    { 
      name: 'Inventory', 
      icon: 'medical-services', 
      color: '#5856D6', 
      route: 'Medicines',
      description: 'Track your medications'
    },
    { 
      name: 'Counterfiet Detector',
      icon: 'verified',
      color: '#FF2D55', 
      route: 'Hospital',
      description: 'Check your medicine is fake or not'
    },
    { 
      name: 'Prescriptions', 
      icon: 'description', 
      color: '#8a00ff', 
      route: 'Prescriptions',
      description: 'View your prescriptions'
    },
    { 
      name: 'Symptom\nChecker', 
      icon: 'healing', 
      color: '#FF9500', 
      route: 'Symptom',
      description: 'Check your symptoms'
    },
  ];

  const performSearch = (query) => {
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Filter services
    const filteredServices = services.filter((service) => 
      service.name.toLowerCase().includes(normalizedQuery) || 
      service.description.toLowerCase().includes(normalizedQuery)
    );
    
    // Filter reminders
    const filteredReminders = reminders.filter((reminder) => 
      reminder.name.toLowerCase().includes(normalizedQuery) || 
      (reminder.description && reminder.description.toLowerCase().includes(normalizedQuery))
    );
    
    setSearchResults({
      services: filteredServices,
      reminders: filteredReminders
    });
    
    setIsSearching(true);
  };

  // Function to find the closest upcoming reminder
  // Function to find the closest upcoming reminder
const findClosestReminder = () => {
  if (reminders.length === 0) return null;
  
  // Create a function to get the next reminder time for each reminder
  const getNextTime = (reminder) => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Check today's reminders
    if (reminder.days.includes(currentDay)) {
      const todayTimes = reminder.times
        .filter(t => !t.completed[currentDay])
        .filter(t => t.time > currentTime);
      
      if (todayTimes.length > 0) {
        const earliest = todayTimes.sort((a, b) => a.time.localeCompare(b.time))[0];
        return { 
          timestamp: now.setHours(parseInt(earliest.time.split(':')[0]), parseInt(earliest.time.split(':')[1])),
          reminder,
          timeSlot: earliest // Store the specific time slot
        };
      }
    }
    
    // Find next day
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayIndex = days.indexOf(currentDay);
    
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = days[nextDayIndex];
      
      if (reminder.days.includes(nextDay)) {
        // Found the next day with a reminder
        const sortedTimes = [...reminder.times].sort((a, b) => a.time.localeCompare(b.time));
        
        if (sortedTimes.length > 0) {
          const futureDate = new Date(now);
          futureDate.setDate(now.getDate() + i);
          futureDate.setHours(parseInt(sortedTimes[0].time.split(':')[0]), parseInt(sortedTimes[0].time.split(':')[1]));
          
          return { 
            timestamp: futureDate.getTime(), 
            reminder,
            timeSlot: sortedTimes[0] // Store the specific time slot
          };
        }
      }
    }
    
    return { timestamp: Infinity, reminder, timeSlot: null };
  };
  
  // Find the reminder with the earliest upcoming time
  const reminderTimes = reminders.map(getNextTime);
  const sortedReminderTimes = reminderTimes
    .filter(item => item.timestamp !== Infinity)
    .sort((a, b) => a.timestamp - b.timestamp);
  
  return sortedReminderTimes.length > 0 ? sortedReminderTimes[0].reminder : null;
};

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        // Get the current user from AsyncStorage
        const storedUser = await AsyncStorage.getItem('username');
        
        if (!storedUser) {
          console.log('No user found in AsyncStorage');
          setLoading(false);
          return;
        }
        
        // Check if the stored value is already an object (not a JSON string)
        let user;
        try {
          // Try to parse as JSON
          user = JSON.parse(storedUser);
        } catch (parseError) {
          // If it fails, it might be just a string username
          user = { username: storedUser };
        }
        
        setUserData(user);
        
        // Fetch reminders for this specific user
        const username = user.username;
        const response = await axios.get(`http://20.193.156.237:5000/api/remind/${username}`);
        
        if (response.data.success) {
          setReminders(response.data.reminders);
        } else {
          console.log('Failed to fetch reminders:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReminders();
  }, []);

  // Clear search when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchQuery('');
      setIsSearching(false);
    });

    return unsubscribe;
  }, [navigation]);

  // Get the closest upcoming reminder
  const closestReminder = findClosestReminder();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e948b" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{userData?.username || 'Guest'} 👋</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle" size={40} color="#1e948b" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={24} color="#1e948b" />
          <TextInput
            placeholder="Search medical services..."
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              performSearch(text);
            }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setIsSearching(false);
              }}
            >
              <Icon name="cancel" size={20} color="#1e948b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSearching ? (
        <SearchResults 
          searchResults={searchResults} 
          navigation={navigation} 
        />
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <BannerCarousel />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
          </View>

          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.serviceCard}
                onPress={() => navigation.navigate(service.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.serviceIcon, { backgroundColor: `${service.color}15` }]}>
                  <Icon name={service.icon} size={28} color={service.color} />
                </View>
                <Text style={styles.serviceText}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Reminder</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Reminders')}
              style={styles.seeAllButton}
            >
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {closestReminder ? (
            <ReminderCard 
              key={closestReminder._id} 
              reminder={closestReminder} 
              navigation={navigation}
            />
          ) : (
            <View style={styles.emptyReminders}>
              <Icon name="notifications-none" size={48} color="#1e948b" />
              <Text style={styles.emptyRemindersText}>No upcoming reminders</Text>
            </View>
          )}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const HomeOptionsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeMainScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Medicines" 
      component={InventoryScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Hospital" 
      component={HospitalScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Symptom" 
      component={SymptomCheckerScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Prescriptions" 
      component={PrescriptionsScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreenApp} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen
      name="Reminder"
      component={ReminderScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const HomeScreen = () => {
  return <HomeOptionsNavigator />;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: 'Poppins-Normal',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins-Bold',
  },
  profileButton: {
    position: 'relative',
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1e948b',
  },
  searchContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    fontFamily: 'Poppins-Bold',
  },
  searchResultsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#484848',
    marginTop: 10,
    marginBottom: 5,
    fontFamily: 'Poppins-Bold',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Poppins-Bold',
  },
  searchResultDescription: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Poppins-Normal',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  noResultsText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 10,
    fontFamily: 'Poppins-Normal',
  },
  bannerContainer: {
    marginTop: 20,
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bannerSlide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  paginationDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1e948b',
    marginHorizontal: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins-Bold',
  },
  seeAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionLink: {
    fontSize: 14,
    color: '#1e948b',
    fontWeight: 'bold',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  serviceDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#8E8E93',
    fontFamily: 'Poppins-Normal',
  },
  reminderCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reminderInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderDetails: {
    marginLeft: 10,
    flex: 1,
    marginRight: 10,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'Poppins-Normal',
    lineHeight: 16,
  },
  moreButton: {
    padding: 5,
    marginLeft: 'auto',
  },
  reminderDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 10,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reminderTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTimeText: {
    fontSize: 14,
    marginLeft: 5,
    fontFamily: 'Poppins-Normal',
  },
  emptyReminders: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyRemindersText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 10,
    fontFamily: 'Poppins-Normal',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 20,
  }
});

export default HomeScreen;
