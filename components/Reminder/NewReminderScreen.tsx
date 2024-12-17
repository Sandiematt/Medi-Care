import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
      [day]: !prevDays[day],  // Toggle the selected state of the day
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
          style={styles.descriptionInput}  // Apply separate style for description
          value={description}
          onChangeText={setDescription}
          placeholder="Enter reminder description"
          multiline={true}  // Allow multiple lines for description
        />
      </View>

      {/* Days Container */}
      <View style={styles.daysSelectionContainer}>
        <Text style={styles.label}>Select Days</Text>
        <View style={styles.daysContainer}>
          {Object.keys(days).map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayBox, days[day] && styles.selectedDayBox]}  // Highlight selected day
              onPress={() => handleDayToggle(day)}  // Toggle the selection of the day
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Time and Dose Selection */}
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

      {/* Total Doses */}
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

      {/* Add Reminder Button */}
      <TouchableOpacity style={styles.addButton}>
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
    height: 50,  // Adjust height for the input box (Name)
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    color: '#000',
    fontFamily: 'Poppins-Normal',
    height: 100,  // Increase height for the description input box
    textAlignVertical: 'top',  // Align text to the top for better readability
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
