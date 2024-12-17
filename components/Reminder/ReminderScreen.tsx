import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStackNavigator } from '@react-navigation/stack';

// Directly import screens
import NewReminderScreen from './NewReminderScreen';

const Stack = createStackNavigator();

// Reminder Options Navigator (Main Reminder Screen and New Reminder Screen)
const ReminderOptionsNavigator = () => (
  <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
    <Stack.Screen name="ReminderMain" component={ReminderMainScreen} options={{ headerShown: false }} />
    <Stack.Screen name="NewReminder" component={NewReminderScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const ReminderMainScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Mock data for reminders
  const reminders = [
    { name: 'Lisinopril', time: '16:00', pills: '1 Pill' },
    { name: 'Atorvastatin', time: '16:30', pills: '2 Pills' },
    { name: 'Lisinopril', time: '20:00', pills: '1 Pill' },
  ];

  // Mock data for inventory
  const inventory = [
    { name: 'Lisinopril', count: 5, color: 'red' },
    { name: 'Metformin', count: 23, color: 'blue' },
  ];

  return (
    <View style={styles.container}>
      {/* Today's Reminders */}
      <Text style={styles.header}>Today's Reminders</Text>
      <ScrollView style={styles.scrollView}>
        {reminders.map((item, index) => (
          <View key={index} style={styles.reminderCard}>
            <View style={styles.reminderDetails}>
              <Text style={styles.medicineName}>{item.name}</Text>
              <View style={styles.iconRow}>
                <Icon name="clock-outline" size={18} color="#888" />
                <Text style={styles.time}> {item.time} </Text>
                <Icon name="pill" size={18} color="#888" />
                <Text style={styles.time}> {item.pills}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity>
                <Icon name="check-circle" size={28} color="#B2EBF2" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name="close-circle" size={28} color="#FFCDD2" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Inventory Header with See All Button */}
      <View style={styles.inventoryHeader}>
        <Text style={styles.header}>Inventory</Text>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllButtonText}>SEE ALL</Text>
        </TouchableOpacity>
      </View>

      {/* Inventory Items */}
      <View style={styles.inventoryContainer}>
        {inventory.map((item, index) => (
          <View key={index} style={styles.inventoryCard}>
            <Text style={styles.inventoryName}>{item.name}</Text>
            <Text style={{ color: item.color, fontSize: 14, fontFamily: 'Poppins-Normal' }}>
              {item.count} remaining
            </Text>
          </View>
        ))}
      </View>

      {/* Add New Reminder Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('NewReminder')}
      >
        <Text style={styles.addButtonText}>+ New Reminder</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Profile Screen
const ReminderScreen: React.FC = () => {
  return <ReminderOptionsNavigator />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginVertical: 15,
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    backgroundColor: 'transparent',
    minHeight: 80,
  },
  reminderDetails: {
    justifyContent: 'center',
  },
  medicineName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 5,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  seeAllButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    elevation: 2,
  },
  seeAllButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  inventoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  inventoryCard: {
    width: '48%',
    backgroundColor: '#F7F8FA',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  inventoryName: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: '#E0F7FA',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#00ACC1',
  },
});

export default ReminderScreen;
