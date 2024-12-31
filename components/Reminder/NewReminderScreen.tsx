import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const NewReminderScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState({
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
    Sun: false,
  });
  const [times, setTimes] = useState([{ time: '12:00', dose: 1 }, { time: '24:00', dose: 1 }]);
  const [totalDoses, setTotalDoses] = useState(30);

  const handleDayToggle = (day: string) => {
    setDays((prevDays) => ({
      ...prevDays,
      [day]: !prevDays[day],
    }));
  };

  const handleTimeChange = (index: number, key: string, value: string) => {
    const updatedTimes = [...times];
    updatedTimes[index] = { ...updatedTimes[index], [key]: value };
    setTimes(updatedTimes);
  };

  const addTime = () => setTimes([...times, { time: '00:00', dose: 1 }]);

  const removeTime = (index: number) => {
    const updatedTimes = times.filter((_, i) => i !== index);
    setTimes(updatedTimes);
  };

  const handleSubmit = async () => {
    const selectedDays = Object.keys(days).filter((day) => days[day]);
    if (!name || !description || selectedDays.length === 0 || times.length === 0) {
      Alert.alert('Error', 'Please fill all the required fields.');
      return;
    }

    const reminderData = {
      name,
      description,
      days: selectedDays,
      times,
      totalDoses,
    };

    try {
      const response = await fetch('http://10.0.2.2:5000/addReminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminderData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Reminder added successfully.');
        setName('');
        setDescription('');
        setDays({
          Mon: false,
          Tue: false,
          Wed: false,
          Thu: false,
          Fri: false,
          Sat: false,
          Sun: false,
        });
        setTimes([{ time: '12:00', dose: 1 }, { time: '24:00', dose: 1 }]);
        setTotalDoses(30);
      } else {
        Alert.alert('Error', result.message || 'Failed to add reminder.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while adding the reminder.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter reminder name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter reminder description"
          multiline={true}
        />
      </View>

      <View style={styles.daysSelectionContainer}>
        <Text style={styles.label}>Select Days</Text>
        <View style={styles.daysContainer}>
          {Object.keys(days).map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayBox, days[day] && styles.selectedDayBox]}
              onPress={() => handleDayToggle(day)}
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.timesContainer}>
        {times.map((time, index) => (
          <View key={index} style={styles.timeBox}>
            <TextInput
              style={styles.timeInput}
              value={time.time}
              onChangeText={(text) => handleTimeChange(index, 'time', text)}
              placeholder="Time"
            />
            <TextInput
              style={styles.doseInput}
              value={time.dose.toString()}
              onChangeText={(text) => handleTimeChange(index, 'dose', text)}
              placeholder="Dose"
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={() => removeTime(index)}>
              <Icon name="minus-circle" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addTimeButton} onPress={addTime}>
          <View style={styles.addTimeContent}>
            <Text style={styles.addTimeText}>Add Time</Text>
            <Icon name="plus-circle" size={24} color="gray" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.totalDosesContainer}>
        <Text style={styles.label}>Total Doses</Text>
        <View style={styles.totalDosesBox}>
          <TouchableOpacity onPress={() => setTotalDoses(totalDoses - 1)}>
            <Icon name="minus" size={24} color="gray" />
          </TouchableOpacity>
          <Text style={styles.totalDosesText}>{totalDoses}</Text>
          <TouchableOpacity onPress={() => setTotalDoses(totalDoses + 1)}>
            <Icon name="plus" size={24} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
        <View style={styles.addButtonContent}>
          <Text style={styles.addButtonText}>Add Reminder</Text>
          <Icon style={styles.addButtonText1} name="check" size={15} color="#fff" />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
    fontFamily: 'Poppins-Bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    color: '#000',
    fontFamily: 'Poppins-Normal',
    height: 50,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    color: '#000',
    fontFamily: 'Poppins-Normal',
    height: 100,
    textAlignVertical: 'top',
  },
  daysSelectionContainer: {
    marginBottom: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginRight: 8,
  },
  selectedDayBox: {
    backgroundColor: '#00bcd4',
  },
  dayText: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
  },
  timesContainer: {
    marginBottom: 20,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    color: '#000',
    fontFamily: 'Poppins-SemiNormal',
  },
  doseInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    color: '#000',
    fontFamily: 'Poppins-Normal',
  },
  addTimeButton: {
    alignSelf: 'flex-end',
  },
  addTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  addTimeText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    marginRight: 8,
  },
  totalDosesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalDosesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 12,
  },
  totalDosesText: {
    fontSize: 16,
    marginHorizontal: 12,
    color: '#000',
    fontFamily: 'Poppins-Normal',
  },
  addButton: {
    backgroundColor: '#00bcd4',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  addButtonText1: {
    left: 5,
  },
});

export default NewReminderScreen;
