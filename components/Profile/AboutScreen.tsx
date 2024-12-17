import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AboutScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About DocSwift</Text>
      <Text style={styles.text}>
        DocSwift is a platform that helps manage your health records efficiently.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default AboutScreen;
