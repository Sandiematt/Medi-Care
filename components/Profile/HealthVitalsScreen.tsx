import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import EditHealthVitalsScreen from './EditHealthVitalsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const Stack = createStackNavigator<RootStackParamList>();
const HealthVitalsApp = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthVitalss" component={HealthVitalsScreen} />
      <Stack.Screen name="Edit" component={EditHealthVitalsScreen} />
    </Stack.Navigator>
  );
};

type RootStackParamList = {
  HealthVitalss: undefined;
  Edit: undefined;
};
const HealthVitalsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userData, setUserData] = useState<any>(null);
  const [editableFields, setEditableFields] = useState({
    username: false,
    bloodpressure: false,
    heartrate:false,
    bloodgroup: false,
    height: false,
    weight: false
  });
  const [username, setName] = useState('');
  const [bloodpressure, setBloodPressure] = useState('');
  const [heartrate, setheartrate] = useState('');
  const [bloodgroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthVitals = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (!storedUsername) {
          throw new Error('Username not found in storage.');
        }
  
        const response = await axios.get(`http://10.0.2.2:5000/healthvitals/${storedUsername}`);
  
        // Use response data if available, else fallback to defaults
        const data = response.data || {};
        setUserData(data);
        setName(data.username || 'N/A');
        setBloodPressure(data.bloodpressure || 'N/A');
        setheartrate(data.heartrate || 'N/A');
        setBloodGroup(data.bloodgroup || 'N/A');
        setHeight(data.height || 'N/A');
        setWeight(data.weight || 'N/A');
        setError(null);
      } catch (err) {
        setUserData(null); // Ensure UI still renders
        setName('N/A');
        setBloodPressure('N/A');
        setheartrate('N/A');
        setBloodGroup('N/A');
        setHeight('N/A');
        setWeight('N/A');
        setError(null); // Avoid error message, just fallback
      } finally {
        setLoading(false);
      }
    };
  
    fetchHealthVitals();
  }, []);
  

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hello, {username}!</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Edit')}>
          <Icon name="create-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Heart Health</Text>
        <View style={styles.infoSection}>
          <View style={styles.heartIconContainer}>
            <Icon name="pulse" size={60} color="#FF6F61" />
          </View>
          <View style={styles.details}>
            <Text style={styles.subTitle}>Health</Text>
            <Text style={styles.description}>
              Diagnosis of Heart Health
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Edit')}>
              <Text style={styles.buttonText}>Diagnose</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.vitals}>
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>Blood Pressure</Text>
            <Text style={styles.vitalValue}>
              {bloodpressure || 'N/A'} mmHg
            </Text>
          </View>
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>Heart Rate</Text>
            <Text style={styles.vitalValue}>
              {heartrate || 'N/A'} ms
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card1}>
        <Text style={styles.title}>Additional Health Data</Text>
        <View style={styles.vitals}>
          <View style={styles.vitalCard}>
            <Icon name="body-outline" size={30} color="#6A1B9A" />
            <Text style={styles.vitalLabel}>Height</Text>
            <Text style={styles.vitalValue}>
              {height || 'N/A'} cm
            </Text>
          </View>
          <View style={styles.vitalCard}>
            <Icon name="barbell-outline" size={30} color="#1E88E5" />
            <Text style={styles.vitalLabel}>Weight</Text>
            <Text style={styles.vitalValue}>
              {weight || 'N/A'} kg
            </Text>
          </View>
          <View style={styles.vitalCard}>
            <Icon name="water-outline" size={30} color="#D84315" />
            <Text style={styles.vitalLabel}>Blood Group</Text>
            <Text style={styles.vitalValue}>
              {bloodgroup || 'N/A'} ve
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  card1: {
    backgroundColor: '#F7E5EC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  heartIconContainer: {
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FF6F61',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  vitals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  vitalCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
  },
  vitalLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFECB3',
    borderRadius: 12,
    padding: 15,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactRole: {
    fontSize: 14,
    color: '#555',
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 80,
  },
});

export default HealthVitalsApp;
