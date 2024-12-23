import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PrescriptionsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Prescriptions Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default PrescriptionsScreen;
