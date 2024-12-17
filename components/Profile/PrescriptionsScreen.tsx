import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PrescriptionsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Prescriptions</Text>
      <Text style={styles.text}>No prescriptions yet.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default PrescriptionsScreen;
