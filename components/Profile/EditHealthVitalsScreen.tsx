import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
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
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchHealthVitals = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (!storedUsername) throw new Error('Username not found in storage.');

        const response = await axios.get(`http://20.193.156.237:5000/healthvitals/${storedUsername}`);
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
      setSaving(true);
      const storedUsername = await AsyncStorage.getItem('username');
      if (!storedUsername) throw new Error('Username not found in storage.');
  
      const payload = { bloodpressure, heartrate, bloodgroup, height, weight };
      const response = await axios.post(`http://20.193.156.237:5000/healthvitals/${storedUsername}`, payload);
  
      if (response.status >= 200 && response.status < 300) {
        Alert.alert('Success', 'Health vitals saved successfully!');
        navigation.goBack();
      } else {
        throw new Error('Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error saving health vitals:', error);
      Alert.alert('Error', 'Failed to save health vitals. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleGoBack = () => navigation.goBack();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4551C5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.mainContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#1d948b" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Icon name="chevron-back" size={24} color="#1d948b" />
          </TouchableOpacity>
          <Text style={styles.title}>Health Vitals</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.cardContainer}>
          <VitalInputField
            label="Blood Pressure"
            value={bloodpressure}
            onChangeText={setBloodPressure}
            placeholder="120/80 mmHg"
            icon="heart-outline"
          />
          
          <VitalInputField
            label="Heart Rate"
            value={heartrate}
            onChangeText={setHeartrate}
            placeholder="72 bpm"
            icon="pulse-outline"
          />
          
          <VitalInputField
            label="Height"
            value={height}
            onChangeText={setHeight}
            placeholder="175 cm"
            icon="resize-outline"
            keyboardType="numeric"
          />
          
          <VitalInputField
            label="Weight"
            value={weight}
            onChangeText={setWeight}
            placeholder="70 kg"
            icon="scale-outline"
            keyboardType="numeric"
          />
          
          <VitalInputField
            label="Blood Group"
            value={bloodgroup}
            onChangeText={setBloodGroup}
            placeholder="A+"
            icon="water-outline"
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.savingButton]} 
          onPress={saveDetails}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="save-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

interface VitalInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

const VitalInputField: React.FC<VitalInputFieldProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder,
  icon,
  keyboardType = 'default'
}) => {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <Icon name={icon} size={18} color="#1d948b" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#AAAAAA"
        keyboardType={keyboardType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#1d948b',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4551C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  savingButton: {
    backgroundColor: '#3A45AD',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default EditHealthVitalsScreen;