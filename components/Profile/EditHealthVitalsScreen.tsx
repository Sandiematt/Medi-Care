import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Props {
  navigation: any;
}

const EditHealthVitalsScreen: React.FC<Props> = ({ navigation }) => {
  const [bloodpressure, setBloodPressure] = useState('');
  const [heartrate, setHeartrate] = useState('');
  const [bloodgroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHealthVitals = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (!storedUsername) throw new Error('Username not found in storage.');

        const response = await axios.get(`http://10.0.2.2:5000/healthvitals/${storedUsername}`);
        const data = response.data;

        setBloodPressure(data.bloodpressure || '');
        setHeartrate(data.heartrate || '');
        setBloodGroup(data.bloodgroup || '');
        setHeight(data.height || '');
        setWeight(data.weight || '');
      } catch (err) {
        setBloodPressure('');
        setHeartrate('');
        setBloodGroup('');
        setHeight('');
        setWeight('');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthVitals();
  }, []);

  const saveDetails = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (!storedUsername) throw new Error('Username not found in storage.');
  
      const payload = { bloodpressure, heartrate, bloodgroup, height, weight };
      const response = await axios.post(`http://10.0.2.2:5000/healthvitals/${storedUsername}`, payload);
  
      // Check for a successful status code
      if (response.status >= 200 && response.status < 300) {
        Alert.alert('Success', 'Health vitals saved successfully!');
        navigation.goBack();
      } else {
        throw new Error('Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error saving health vitals:', error);
      Alert.alert('Error', 'Failed to save health vitals. Please try again.');
    }
  };
  

  const handleGoBack = () => navigation.goBack();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
                <Icon name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
        <Text style={styles.title}>Edit Health Vitals</Text>
      </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Blood Pressure (mmHg)</Text>
          <TextInput
            style={styles.input}
            value={bloodpressure}
            onChangeText={setBloodPressure}
            placeholder="Enter blood pressure"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Heart Rate (ms)</Text>
          <TextInput
            style={styles.input}
            value={heartrate}
            onChangeText={setHeartrate}
            placeholder="Enter heart rate"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Enter height"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Blood Group (A+)</Text>
          <TextInput
            style={styles.input}
            value={bloodgroup}
            onChangeText={setBloodGroup}
            placeholder="Enter blood group"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={saveDetails}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    top:10,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#24BAAC',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default EditHealthVitalsScreen;