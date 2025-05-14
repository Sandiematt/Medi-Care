/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// TypeScript interfaces
interface TimeSlot {
  time: string;
  dose: number;
}

interface DaysState {
  [key: string]: boolean;
}

const NewReminderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  // State management
  const [medicationInfo, setMedicationInfo] = useState({
    name: '',
    description: '',
  });
  const [username, setUsername] = useState('');
  const [days, setDays] = useState<DaysState>({
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
    Sun: false,
  });
  const [times, setTimes] = useState<TimeSlot[]>([{ time: '12:00', dose: 1 }]);
  const [totalDoses, setTotalDoses] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  // Time picker state
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Authentication check
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          Alert.alert(
            'Account Required',
            'Please log in to create reminders',
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
          );
        }
      } catch (error) {
        console.error('Error retrieving username:', error);
        Alert.alert('Error', 'Failed to retrieve user information.');
      }
    };

    fetchUsername();
  }, [navigation]);

  // Helper function to format time
  const formatTime12Hour = (time24: string): string => {
    if (!time24 || !time24.includes(':')) return '00:00 AM'; // Default or handle invalid format

    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    const hoursFormatted = hours.toString().padStart(2, '0');
    const minutesFormatted = minutes.toString().padStart(2, '0');

    return `${hoursFormatted}:${minutesFormatted} ${ampm}`;
  };

  // Input handlers
  const handleInputChange = (field: 'name' | 'description', value: string) => {
    setMedicationInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: string) => {
    setDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleDoseChange = (index: number, value: number | string) => {
    const updatedTimes = [...times];

    if (typeof value === 'number') {
      // Direct numeric update (from buttons)
      updatedTimes[index] = {
        ...updatedTimes[index],
        dose: value,
      };
    } else {
      // Text input update
      updatedTimes[index] = {
        ...updatedTimes[index],
        dose: value === '' ? 1 : parseInt(value, 10) || 1,
      };
    }

    setTimes(updatedTimes);
  };

  // Now let's create functions to increment and decrement the dose
  const incrementDose = (index: number) => {
    const currentDose = times[index].dose;
    handleDoseChange(index, typeof currentDose === 'number' ? currentDose + 1 : 1);
  };

  const decrementDose = (index: number) => {
    const currentDose = times[index].dose;
    if (typeof currentDose === 'number' && currentDose > 1) {
      handleDoseChange(index, currentDose - 1);
    }
  };

  // Time picker handlers
  const showTimePicker = (index: number) => {
    // Parse the existing time string to set initial picker value
    const timeStr = times[index].time;
    const [hours, minutes] = timeStr.split(':').map(Number);

    const date = new Date();
    date.setHours(hours || 0);
    date.setMinutes(minutes || 0);

    setSelectedTime(date);
    setSelectedTimeIndex(index);
    setTimePickerVisible(true);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setTimePickerVisible(false);
    }

    if (date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      const updatedTimes = [...times];
      updatedTimes[selectedTimeIndex] = {
        ...updatedTimes[selectedTimeIndex],
        time: timeString,
      };

      setSelectedTime(date);
      setTimes(updatedTimes);
    }
  };

  const addTime = () => setTimes(prev => [...prev, { time: '00:00', dose: 1 }]);

  const removeTime = (index: number) => {
    if (times.length > 1) {
      setTimes(prev => prev.filter((_, i) => i !== index));
    } else {
      Alert.alert('Info', 'At least one time slot is required');
    }
  };

  // Form submission
  const handleSubmit = async () => {
    const selectedDays = Object.keys(days).filter(day => days[day]);

    // Validation
    if (!username) {
      Alert.alert('Error', 'You need to be logged in to add reminders.');
      return;
    }

    if (!medicationInfo.name || !medicationInfo.description || selectedDays.length === 0) {
      Alert.alert('Missing Information', 'Please fill all the required fields.');
      return;
    }

    const reminderData = {
      username,
      name: medicationInfo.name,
      description: medicationInfo.description,
      days: selectedDays,
      times,
      totalDoses,
    };

    try {
      setIsLoading(true);
      const response = await fetch('http://10.0.2.2:5000/addReminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Reminder added successfully.', [
          { text: 'OK', onPress: () => navigation.navigate('Reminders') },
        ]);
        resetForm();
      } else {
        Alert.alert('Error', result.message || 'Failed to add reminder.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while adding the reminder.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMedicationInfo({ name: '', description: '' });
    setDays({
      Mon: false, Tue: false, Wed: false, Thu: false,
      Fri: false, Sat: false, Sun: false,
    });
    setTimes([{ time: '12:00', dose: 1 }]);
    setTotalDoses(30);
  };

  // UI Components
  const DayPicker = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Schedule</Text>
      <Text style={styles.label}>Which days?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      >
        {Object.keys(days).map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, days[day] && styles.selectedDayButton]}
            onPress={() => handleDayToggle(day)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayText, days[day] && styles.selectedDayText]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const TimePicker = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.label}>When? (Time & Dose)</Text>
      {times.map((time, index) => (
        <View key={index} style={styles.timeSlotContainer}>
          <TouchableOpacity
            style={styles.timeInputWrapper}
            onPress={() => showTimePicker(index)}
          >
            <Icon name="clock" size={18} color="#6366F1" style={styles.inputIcon} />
            <Text style={styles.timeInput}>{formatTime12Hour(time.time)}</Text>
            <Icon name="chevron-down" size={14} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.doseControlContainer}>
            <TouchableOpacity
              onPress={() => decrementDose(index)}
              style={styles.counterButton}
              disabled={time.dose <= 1}
            >
              <Icon name="minus" size={14} color={time.dose <= 1 ? '#CBD5E1' : '#6366F1'} />
            </TouchableOpacity>

            <View style={styles.doseValueInputWrapper}>
              <Icon name="pills" size={18} color="#6366F1" style={styles.inputIcon} />
              <TextInput
                style={styles.doseValueTextInput}
                value={String(time.dose)}
                onChangeText={(text) => handleDoseChange(index, text)}
                placeholder="1"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              onPress={() => incrementDose(index)}
              style={styles.counterButton}
            >
              <Icon name="plus" size={14} color="#6366F1" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => removeTime(index)}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="trash-alt" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}

      {isTimePickerVisible && (
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          date={selectedTime}
          onConfirm={(date) => {
            handleTimeChange(null, date);
            setTimePickerVisible(false);
          }}
          onCancel={() => setTimePickerVisible(false)}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={addTime}>
        <Icon name="plus-circle" size={20} color="#6366F1" />
        <Text style={styles.addButtonText}>Add time</Text>
      </TouchableOpacity>
    </View>
  );

  const DoseCounter = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Supply</Text>
      <View style={styles.doseCounterContainer}>
        <View style={styles.labelContainer}>
          <Icon name="capsules" size={16} color="#6366F1" />
          <Text style={styles.label}>Total Pills/Doses</Text>
        </View>
        <View style={styles.counterControl}>
          <TouchableOpacity
            onPress={() => totalDoses > 1 && setTotalDoses(prev => prev - 1)}
            style={styles.counterButton}
            disabled={totalDoses <= 1}
          >
            <Icon name="minus" size={16} color={totalDoses <= 1 ? '#CBD5E1' : '#6366F1'} />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{totalDoses}</Text>
          <TouchableOpacity
            onPress={() => setTotalDoses(prev => prev + 1)}
            style={styles.counterButton}
          >
            <Icon name="plus" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Main render
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* <Text style={styles.screenTitle}>Add Medication Reminder</Text> */}

        {/* Medication Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Medication Details</Text>

          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Icon name="prescription-bottle-alt" size={16} color="#6366F1" />
              <Text style={styles.label}>Name</Text>
            </View>
            <TextInput
              style={styles.input}
              value={medicationInfo.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Medication name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Icon name="info-circle" size={16} color="#6366F1" />
              <Text style={styles.label}>Description</Text>
            </View>
            <TextInput
              style={styles.textArea}
              value={medicationInfo.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Add notes or instructions"
              placeholderTextColor="#94A3B8"
              multiline={true}
              textAlignVertical="top"
            />
          </View>

          {/* Move Schedule and Supply inside this card */}
          <DayPicker />
          <TimePicker />
          <DoseCounter />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetForm}
          >
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Save Reminder</Text>
                <Icon name="check" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
{Platform.OS === 'android' && isTimePickerVisible && (
  <DateTimePicker
    value={selectedTime}
    mode="time"
    is24Hour={false}
    display="default"
    onChange={(event, date) => {
      if (event.type === 'dismissed') {
        setTimePickerVisible(false);
        return;
      }
      handleTimeChange(event, date);
    }}
  />
)}
{Platform.OS === 'ios' && isTimePickerVisible && (
  <DateTimePickerModal
    isVisible={isTimePickerVisible}
    mode="time"
    date={selectedTime}
    onConfirm={(date) => {
      handleTimeChange(null, date);
      setTimePickerVisible(false);
    }}
    onCancel={() => setTimePickerVisible(false)}
  />
)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom:80,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#475569',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    minHeight: 100,
  },
  inputIcon: {
    marginRight: 8,
  },
  // Day picker styles
  daysContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  dayButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedDayButton: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  // Time picker styles
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    marginRight: 12,
    justifyContent: 'space-between',
    minWidth: 120,
  },
  doseControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timeInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    padding: 0,
    marginLeft: 8,
  },
  iconButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  addButtonText: {
    color: '#6366F1',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Dose counter styles
  doseCounterContainer: {
    marginTop: 8,
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginHorizontal: 20,
    minWidth: 36,
    textAlign: 'center',
  },
  // Button styles
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  doseValueInputWrapper: {
    width: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 6,
  },
  doseValueTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    padding: 0,
    textAlign: 'center',
  },
});

export default NewReminderScreen;
