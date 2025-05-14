import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import EditHealthVitalsScreen from './EditHealthVitalsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Define the color palette
const COLORS = {
  primary: '#1d948b', // Indigo as primary color
  secondary: '#FF9800', // Orange as secondary color
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  cardBackgroundAlt: '#F5F5F5',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textLight: '#FFFFFF',
  textAccent: '#3F51B5', // Indigo for accent text
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',
  shadowColor: '#000',
};

const Stack = createStackNavigator();
const HealthVitalsApp = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthVitalsDashboard" component={HealthVitalsScreen} />
      <Stack.Screen name="EditHealthVitals" component={EditHealthVitalsScreen} />
    </Stack.Navigator>
  );
};

const HealthVitalsScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [username, setName] = useState('');
  const [bloodpressure, setBloodPressure] = useState('');
  const [heartrate, setHeartRate] = useState('');
  const [bloodgroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthVitals = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (!storedUsername) {
          throw new Error('Username not found in storage.');
        }
  
        try {
          const response = await axios.get(`http://20.193.156.237:5000/healthvitals/${storedUsername}`);
          
          const data = response.data || {};
          setUserData(data);
          setName(data.username || 'N/A');
          setBloodPressure(data.bloodpressure || 'N/A');
          setHeartRate(data.heartrate || 'N/A');
          setBloodGroup(data.bloodgroup || 'N/A');
          setHeight(data.height || 'N/A');
          setWeight(data.weight || 'N/A');
          setError(null);
        } catch (axiosError) {
          // Handle 404 or other axios errors silently
          setUserData(null);
          setName('N/A');
          setBloodPressure('N/A');
          setHeartRate('N/A');
          setBloodGroup('N/A');
          setHeight('N/A');
          setWeight('N/A');
          // Do not set error to show the error message UI
          setError(null);
        }
      } catch (err) {
        // Handle AsyncStorage or other non-axios errors
        setUserData(null);
        setName('N/A');
        setBloodPressure('N/A');
        setHeartRate('N/A');
        setBloodGroup('N/A');
        setHeight('N/A');
        setWeight('N/A');
        setError(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchHealthVitals();
  }, []);
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your health data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setLoading(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Vitals</Text>
        <View style={{width: 36}} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Heart Health Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Icon name="heart-outline" size={22} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Cardiac Health</Text>
            </View>
          </View>

          <View style={styles.vitalRow}>
            <View style={styles.vitalCard}>
              <View style={[styles.vitalIconContainer, {backgroundColor: COLORS.primary}]}>
                <Icon name="pulse-outline" size={24} color={COLORS.textLight} />
              </View>
              <View style={styles.vitalTextContainer}>
                <Text style={styles.vitalLabel}>Blood Pressure</Text>
                <Text style={styles.vitalValue}>{bloodpressure} <Text style={styles.vitalUnit}>mmHg</Text></Text>
              </View>
            </View>

            <View style={styles.vitalCard}>
              <View style={[styles.vitalIconContainer, {backgroundColor: COLORS.info}]}>
                <Icon name="fitness-outline" size={24} color={COLORS.textLight} />
              </View>
              <View style={styles.vitalTextContainer}>
                <Text style={styles.vitalLabel}>Heart Rate</Text>
                <Text style={styles.vitalValue}>{heartrate} <Text style={styles.vitalUnit}>bpm</Text></Text>
              </View>
            </View>
          </View>
        </View>

        {/* Body Measurements Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Icon name="body-outline" size={22} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Body Measurements</Text>
            </View>
          </View>

          <View style={styles.vitalRow}>
            <View style={styles.vitalCard}>
              <View style={[styles.vitalIconContainer, {backgroundColor: COLORS.success}]}>
                <Icon name="resize-outline" size={24} color={COLORS.textLight} />
              </View>
              <View style={styles.vitalTextContainer}>
                <Text style={styles.vitalLabel}>Height</Text>
                <Text style={styles.vitalValue}>{height} <Text style={styles.vitalUnit}>cm</Text></Text>
              </View>
            </View>

            <View style={styles.vitalCard}>
              <View style={[styles.vitalIconContainer, {backgroundColor: COLORS.warning}]}>
                <Icon name="barbell-outline" size={24} color={COLORS.textLight} />
              </View>
              <View style={styles.vitalTextContainer}>
                <Text style={styles.vitalLabel}>Weight</Text>
                <Text style={styles.vitalValue}>{weight} <Text style={styles.vitalUnit}>kg</Text></Text>
              </View>
            </View>
          </View>
        </View>

        {/* Blood Group Card */}
        <View style={styles.bloodGroupCard}>
          <View style={styles.bloodGroupContent}>
            <View style={styles.bloodGroupLeft}>
              <View style={[styles.bloodGroupIcon, {backgroundColor: COLORS.secondary}]}>
                <Icon name="water-outline" size={28} color={COLORS.textLight} />
              </View>
              <View style={styles.bloodGroupTextContainer}>
                <Text style={styles.bloodGroupLabel}>Blood Group</Text>
                <Text style={styles.bloodGroupValue}>{bloodgroup}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('EditHealthVitals')}
        >
          <Text style={styles.actionButtonText}>Update Health Vitals</Text>
          <Icon name="arrow-forward" size={18} color={COLORS.textLight} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textAccent,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  vitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vitalCard: {
    width: '48%',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundAlt,
  },
  vitalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    marginRight: 10,
  },
  vitalTextContainer: {
    flex: 1,
  },
  vitalLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  vitalUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  bloodGroupCard: {
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: COLORS.cardBackground,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  bloodGroupContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bloodGroupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodGroupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodGroupTextContainer: {
    marginLeft: 12,
  },
  bloodGroupLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bloodGroupValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionButton: {
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    marginRight: 8,
  },
});

export default HealthVitalsApp;