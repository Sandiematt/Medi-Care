import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Button } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStackNavigator } from '@react-navigation/stack'; 
import { NavigationContainer } from '@react-navigation/native'; 
import NewReminderScreen from './NewReminderScreen';

// Create a Stack Navigator
const Stack = createStackNavigator();

const ReminderApp = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReminderMain" component={ReminderMainScreen} />
      <Stack.Screen name="NewReminder" component={NewReminderScreen} />
    </Stack.Navigator>
  );
};

const ReminderMainScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [selectedReminder, setSelectedReminder] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<any>(null);

  // Mock inventory data
  const inventory = [
    { name: 'Lisinopril', count: 5, color: 'red' },
    { name: 'Metformin', count: 23, color: 'blue' },
  ];

  const today = new Date().toLocaleString('en-US', { weekday: 'short' }); // e.g., "Mon", "Tue"

  const fetchReminders = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/reminders');
      const data = await response.json();
  
      if (response.ok) {
        const today = new Date().toLocaleString('en-US', { weekday: 'short' }); // e.g., "Mon", "Tue", "Wed"
        
        // Filter reminders based on the current day
        const todaysReminders = data.filter((reminder) => reminder.days.includes(today));
  
        // Update the reminders in state
        setReminders(todaysReminders);
      } else {
        Alert.alert('Error', 'Failed to fetch reminders.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching reminders.');
      console.error(error);
    }
  };
  

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleTickClick = (reminder) => {
    setSelectedReminder(reminder);
    setModalVisible(true);
  };

  const handleRemoveTime = async (time, day) => {
    if (selectedReminder) {
      try {
        const today = new Date().toLocaleString('en-US', { weekday: 'short' });
  
        const response = await fetch(`http://10.0.2.2:5000/reminders/${selectedReminder._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            time: time.time,
            days: today,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Update UI for today: Mark the time as completed for today without removing it
          setReminders((prevReminders) =>
            prevReminders.map((r) =>
              r._id === selectedReminder._id
                ? {
                    ...r,
                    times: r.times.map((t) => {
                      if (t.time === time.time) {
                        return {
                          ...t,
                          completed: {
                            ...t.completed,
                            [today]: true, // Mark it as completed for today, without removing the time
                          },
                        };
                      }
                      return t;
                    }),
                  }
                : r
            )
          );
  
          setModalVisible(false);
        } else {
          Alert.alert('Error', data.message || 'Failed to mark the reminder as completed.');
        }
      } catch (error) {
        console.error('Error removing time:', error);
        Alert.alert('Error', 'An error occurred while updating the reminder.');
      }
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today's Reminders</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {reminders.map((item, index) => (
          <View key={item._id || index} style={styles.reminderCard}>
            <View style={styles.reminderDetails}>
              <Text style={styles.medicineName}>{item.name}</Text>
              <Text style={styles.medicineDescription}>{item.description}</Text>
              <View style={styles.iconRow}>
                {item.times.map((timeObj, timeIndex) => (
                  <Text
                    key={`${item._id}-${timeIndex}`}
                    style={[
                      styles.time,
                      timeObj.completed && timeObj.completed[today]
                        ? { textDecorationLine: 'line-through', opacity: 0.5 } // Apply styles for completed times
                        : {},
                    ]}
                  >
                    {timeObj.time} - {timeObj.dose} dose
                  </Text>
                ))}
              </View>
              <Text style={styles.totalDoses}>Total Doses: {item.totalDoses}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleTickClick(item)}>
                <Icon name="check-circle" size={28} color="#B2EBF2" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalHeader}>Select a Time to Remove</Text>
      {selectedReminder?.times
        .filter((timeObj) => !(timeObj.completed && timeObj.completed[today])) // Filter out completed times
        .map((timeObj, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleRemoveTime(timeObj)}
            style={styles.modalOption}
          >
            <Text style={styles.modalOptionText}>{timeObj.time}</Text>
          </TouchableOpacity>
        ))}
      <Button title="Close" onPress={() => setModalVisible(false)} />
    </View>
  </View>
</Modal>

      {/* Inventory Section */}
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

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NewReminder')}
        >
          <Text style={styles.addButtonText}>+ New Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
    minHeight: 100,
  },
  reminderDetails: {
    justifyContent: 'center',
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 5,
  },
  medicineDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    marginBottom: 5,
    color: '#888',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  time: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#888',
    marginRight: 10,
  },
  totalDoses: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    marginTop: 5,
    color: '#333',
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
  addButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  addButton: {
    backgroundColor: '#E0F7FA',
    
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 100,
    alignItems: 'center',
    
  },
  addButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#00ACC1',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 15,
  },
  modalOption: {
    paddingVertical: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Normal',
    textAlign: 'center',
  },
});

export default ReminderApp;