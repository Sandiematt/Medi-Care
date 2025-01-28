import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createStackNavigator } from '@react-navigation/stack';
import InventoryScreen from '../Reminder/InventoryScreen';
import HospitalScreen from './HospitalScreen';
import SymptomCheckerScreen from './SymptomCheckerScreen';
import PrescriptionsScreen from './PrescriptionsScreen';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

const HomeOptionsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeMain" component={HomeMainScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Medicines" component={InventoryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Hospital" component={HospitalScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Symptom" component={SymptomCheckerScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const HomeMainScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const services = [
    { name: 'Medicines', icon: 'medical-services', color: '#5856D6', route: 'Medicines' },
    { name: 'Hospital', icon: 'local-hospital', color: '#FF2D55', route: 'Hospital' },
    { name: 'Prescriptions', icon: 'description', color: '#5856D6', route: 'Prescriptions' },
    { name: 'Symptom\nChecker', icon: 'healing', color: '#FF9500', route: 'Symptom' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>John Doe 👋</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={require('../../assets/images/sandeep.png')}
            style={styles.profileImage}
          />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={24} color="#8E8E93" />
          <TextInput
            placeholder="Search medical services..."
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="tune" size={24} color="#5856D6" />
        </TouchableOpacity>
      </View>

      {/* Banner Section */}
      <View style={styles.bannerContainer}>
        <Image
          source={require('../../assets/images/heart.png')}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Medical Checkup</Text>
          <Text style={styles.bannerSubtitle}>Get a checkup now and{'\n'}stay healthy!</Text>
          <TouchableOpacity style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Services Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.servicesGrid}>
        {services.map((service, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.serviceCard}
            onPress={() => navigation.navigate(service.route)}
          >
            <View style={[styles.serviceIcon, { backgroundColor: `${service.color}15` }]}>
              <Icon name={service.icon} size={28} color={service.color} />
            </View>
            <Text style={styles.serviceText}>{service.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
        <TouchableOpacity>
          <Text style={styles.sectionLink}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.doctorInfo}>
            <Image
              source={require('../../assets/images/liver.png')}
              style={styles.doctorImage}
            />
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>Dr. Sarah Connor</Text>
              <Text style={styles.doctorSpecialty}>Cardiologist</Text>
            </View>
          </View>
          <Icon name="more-vert" size={24} color="#8E8E93" />
        </View>
        
        <View style={styles.appointmentDivider} />
        
        <View style={styles.appointmentFooter}>
          <View style={styles.appointmentInfo}>
            <Icon name="event" size={20} color="#5856D6" />
            <Text style={styles.appointmentText}>Monday, June 12</Text>
          </View>
          <View style={styles.appointmentInfo}>
            <Icon name="access-time" size={20} color="#5856D6" />
            <Text style={styles.appointmentText}>10:00 AM</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const HomeScreen: React.FC = () => {
  return <HomeOptionsNavigator />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  profileButton: {
    position: 'relative',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1C1C1E',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    marginHorizontal: 24,
    height: 160,
    backgroundColor: '#5856D6',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerContent: {
    padding: 24,
    height: '100%',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#5856D6',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  sectionLink: {
    fontSize: 14,
    color: '#5856D6',
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  serviceCard: {
    width: (width - 80) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  doctorDetails: {
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#8E8E93',
  },
  appointmentDivider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 16,
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
  },
});

export default HomeScreen;