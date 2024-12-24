import React from 'react'; 
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native'; // Import NavigationContainer for stack navigation
import MedicinesScreen from './MedicinesScreen';
import HospitalScreen from './HospitalScreen';
import PrescriptionsScreen from './PrescriptionsScreen';
import SymptomCheckerScreen from './SymptomCheckerScreen';

const Stack = createStackNavigator();

// Home screen options navigator
const HomeOptionsNavigator = () => (
  <Stack.Navigator> 
    <Stack.Screen name="HomeMain" component={HomeMainScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Medicines" component={MedicinesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Hospital" component={HospitalScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Symptom" component={SymptomCheckerScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// Main home screen component
const HomeMainScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.nameContainer}>
          <View>
            <Text style={styles.helloText}>Hello</Text>
            <Text style={styles.userName}>User,</Text>
          </View>
        </View>
        <Icon name="account-circle" size={50} color="#000" style={styles.profileImage} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#A0A0A0" />
        <TextInput
          placeholder="Search Medical"
          placeholderTextColor="#A0A0A0"
          style={styles.searchInput}
        />
      </View>

      {/* Promotional Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={require('../../assets/images/home.png')} // Replace with the correct path to your image
          style={styles.bannerImage}
        />
      </View>

      {/* Services Section */}
      <Text style={styles.sectionTitle}>Services</Text>
      <View style={styles.servicesContainer}>
        {/* Medicines Service */}
        <TouchableOpacity style={styles.serviceItemContainer} onPress={() => navigation.navigate('Medicines')}>
          <View style={styles.serviceItem}>
            <Icon name="medical-services" size={30} color="#4CAF50" />
          </View>
          <Text style={styles.serviceLabel}>Medicines</Text>
        </TouchableOpacity>

        {/* Hospital Service */}
        <TouchableOpacity style={styles.serviceItemContainer} onPress={() => navigation.navigate('Hospital')}>
          <View style={styles.serviceItem}>
            <Icon name="local-hospital" size={30} color="#FF9800" />
          </View>
          <Text style={styles.serviceLabel}>Hospital</Text>
        </TouchableOpacity>

        {/* Prescriptions Service */}
        <TouchableOpacity style={styles.serviceItemContainer} onPress={() => navigation.navigate('Prescriptions')}>
          <View style={styles.serviceItem}>
            <Icon name="note" size={30} color="#03A9F4" />
          </View>
          <Text style={styles.serviceLabel}>Prescriptions</Text>
        </TouchableOpacity>

        {/* Symptom Checker Service */}
        <TouchableOpacity style={styles.serviceItemContainer} onPress={() => navigation.navigate('Symptom')}>
          <View style={styles.serviceItem}>
            <Icon name="healing" size={30} color="#E91E63" />
          </View>
          <Text style={styles.serviceLabel}>Symptom Checker</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Appointments */}
      <Text style={styles.sectionTitle}>Upcoming Medicines</Text>
      <View style={styles.appointmentCard}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>12</Text>
          <Text style={styles.dayText}>Tue</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.appointmentDoctor}>Dr. Mim Ankht</Text>
          <Text style={styles.appointmentDetails}>Depression</Text>
          <Text style={styles.appointmentTime}>09:30 AM</Text>
        </View>
        <Icon name="more-vert" size={24} color="#000" />
      </View>
    </ScrollView>
  );
};

// Main home screen navigation setup
const HomeScreen: React.FC = () => {
  return <HomeOptionsNavigator />;
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 80, // Ensures space for the bottom tabs, adjust as necessary
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helloText: {
    fontSize: 16,
    color: '#000',
  },
  userName: {
    fontSize: 25,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
  },
  profileImage: {
    borderRadius: 25, // Keeps the icon round
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 5,
    marginVertical: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    marginVertical: 0,
    textAlign: 'left',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  serviceItemContainer: {
    alignItems: 'center',
    width: '23%',
    marginBottom: 10,
  },
  serviceLabel: {
    fontSize: 12,
    marginTop: 5,
    color: '#000',
    fontFamily: 'Poppins-Normal',
    textAlign: 'center',
  },
  serviceItem: {
    width: 60,
    height: 60,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  bannerImage: {
    width: 370,
    height: 150,
    borderRadius: 10,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#24BAAC',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  dateContainer: {
    backgroundColor: '#199A8E',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
  },
  dayText: {
    fontSize: 12,
    color: '#FFF',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 10,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFF',
  },
  appointmentDetails: {
    fontSize: 14,
    color: '#FFF',
  },
  appointmentTime: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 5,
  },
});

export default HomeScreen;
