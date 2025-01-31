import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MedicinesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Medicines Screen</Text>
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

export default MedicinesScreen;
