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
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import InventoryScreen from '../Reminder/InventoryScreen';
import HospitalScreen from './CounterfietDetection';
import SymptomCheckerScreen from './SymptomCheckerScreen';
import PrescriptionsScreen from '../Profile/PrescriptionsScreen';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

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

const ReminderCard: React.FC<{ reminder: Reminder }> = ({ reminder }) => {
  const getNextReminderTime = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const todayTimes = reminder.times
      .filter(t => !t.completed[currentDay])
      .filter(t => t.time > currentTime);

    if (todayTimes.length > 0) {
      return {
        day: currentDay,
        time: todayTimes[0].time,
        dose: todayTimes[0].dose
      };
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayIndex = days.indexOf(currentDay);
    
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = days[nextDayIndex];
      
      if (reminder.days.includes(nextDay)) {
        return {
          day: nextDay,
          time: reminder.times[0].time,
          dose: reminder.times[0].dose
        };
      }
    }

    return null;
  };

  const nextReminder = getNextReminderTime();

  if (!nextReminder) return null;

  return (
    <TouchableOpacity style={styles.reminderCard} activeOpacity={0.7}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <View style={[styles.reminderIcon, { backgroundColor: '#5856D615' }]}>
            <Icon name="medication" size={24} color="#5856D6" />
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
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-vert" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.reminderDivider} />
      
      <View style={styles.reminderFooter}>
        <View style={styles.reminderTimeInfo}>
          <Icon name="event" size={20} color="#5856D6" />
          <Text style={styles.reminderTimeText}>{nextReminder.day}</Text>
        </View>
        <View style={styles.reminderTimeInfo}>
          <Icon name="access-time" size={20} color="#5856D6" />
          <Text style={styles.reminderTimeText}>{nextReminder.time}</Text>
        </View>
        <View style={styles.reminderTimeInfo}>
          <Icon name="medication" size={20} color="#5856D6" />
          <Text style={styles.reminderTimeText}>{nextReminder.dose} dose(s)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeMainScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);

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
      color: '#5856D6', 
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


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5856D6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{userData?.username || 'Guest'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={require('../../assets/images/sande.jpg')}
              style={styles.profileImage}
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={24} color="#8E8E93" />
            <TextInput
              placeholder="Search medical services..."
              placeholderTextColor="#8E8E93"
              style={styles.searchInput}
            />
          </View>
        </View>

        <BannerCarousel />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Services</Text>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.serviceCard,
                { transform: [{ scale: 1 }] }
              ]}
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
            onPress={() => navigation.navigate('Medicines')}
            style={styles.seeAllButton}
          >
            <Text style={styles.sectionLink}>See All</Text>
          </TouchableOpacity>
        </View>

        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <ReminderCard key={reminder._id} reminder={reminder} />
          ))
        ) : (
          <View style={styles.emptyReminders}>
            <Icon name="notifications-none" size={48} color="#8E8E93" />
            <Text style={styles.emptyRemindersText}>No upcoming reminders</Text>
          </View>
        )}
      </ScrollView>
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
  </Stack.Navigator>
);

const HomeScreen: React.FC = () => {
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
    backgroundColor: '#FF3B30',
  },
  searchContainer: {
    marginTop: 20,
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
    backgroundColor: '#5856D6',
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
    color: '#5856D6',
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
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
  },
  reminderInfo: {
    flexDirection: 'row',
    flex: 1, // Added flex: 1
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
    flex: 1, // Added flex: 1
    marginRight: 10, // Added margin to prevent text from touching the more button
  },
  reminderName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4, // Added margin bottom for spacing
  },
  reminderDescription: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'Poppins-Normal',
    lineHeight: 16, // Added line height for better readability
  },
  moreButton: {
    padding: 5,
    marginLeft: 'auto', // Added to ensure proper alignment
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
});

export default HomeScreen;
