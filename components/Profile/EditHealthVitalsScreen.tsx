import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView } from 'react-native';

const EditHealthVitalsScreen: React.FC = () => {
  const [bloodPressure, setBloodPressure] = useState('123 / 80');
  const [heartRate, setHeartRate] = useState('67 / min');
  const [height, setHeight] = useState("5'8\"");
  const [weight, setWeight] = useState('70 kg');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const saveDetails = () => {
    // Add save functionality here
    console.log('Health vitals updated successfully!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Health Vitals</Text>

      <Text style={styles.label}>Blood Pressure</Text>
      <TextInput
        style={styles.input}
        value={bloodPressure}
        onChangeText={setBloodPressure}
      />

      <Text style={styles.label}>Heart Rate</Text>
      <TextInput
        style={styles.input}
        value={heartRate}
        onChangeText={setHeartRate}
      />

      <Text style={styles.label}>Height</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
      />

      <Text style={styles.label}>Weight</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
      />

      <Text style={styles.label}>Blood Group</Text>
      <TextInput
        style={styles.input}
        value={bloodGroup}
        onChangeText={setBloodGroup}
      />

      <TouchableOpacity style={styles.button} onPress={saveDetails}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

export default EditHealthVitalsScreen;
