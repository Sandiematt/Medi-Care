import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const HealthVitalsScreen: React.FC = () => {
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');

  const handleSaveVitals = () => {
    // Save health vitals here
    console.log('Health vitals saved:', { bloodPressure, heartRate });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter blood pressure"
        value={bloodPressure}
        onChangeText={setBloodPressure}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter heart rate"
        value={heartRate}
        onChangeText={setHeartRate}
      />
      <Button title="Save Vitals" onPress={handleSaveVitals} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
});

export default HealthVitalsScreen;
