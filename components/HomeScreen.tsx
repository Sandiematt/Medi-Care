import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Icon with label */}
      <Icon name="home" size={10} color="#6200EE" />
      <Text style={styles.text}>Welcome to the Home Screen</Text>
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
    color: '#6200EE',
    marginTop: 10,
    fontFamily: 'Poppins-Bold', // Your preferred font style
  },
});

export default HomeScreen;
