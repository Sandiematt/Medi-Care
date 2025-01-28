import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Button, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStackNavigator } from '@react-navigation/stack'; 
import NewReminderScreen from './NewReminderScreen';
import notifee from '@notifee/react-native';
import { TriggerType, AndroidImportance } from '@notifee/react-native';
import InventoryScreen from './InventoryScreen';

// Create a Stack Navigator
const Stack = createStackNavigator();

const ReminderApp = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReminderMain" component={ReminderMainScreen} />
      <Stack.Screen name="NewReminder" component={NewReminderScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
    </Stack.Navigator>
  );
};

const ReminderMainScreen = ({ navigation }) => {
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [inventoryStats, setInventoryStats] = useState({
    lowStock: 0,
    outOfStock: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);

  const today = new Date().toLocaleString('en-US', { weekday: 'short' });

  const fetchInventoryData = async () => {
    try {
      // Fetch inventory stats
      const statsResponse = await fetch('http://10.0.2.2:5000/stats');
      const statsData = await statsResponse.json();
      setInventoryStats(statsData);

      // Fetch all inventory items
      const inventoryResponse = await fetch('http://10.0.2.2:5000/inventory');
      const inventoryData = await inventoryResponse.json();
      
      // Filter low stock items (items with stock less than 5 but greater than 0)
      const lowStockItems = inventoryData.filter(item => item.inStock < 5 && item.inStock > 0);
      setLowStockItems(lowStockItems);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      Alert.alert('Error', 'Failed to fetch inventory data');
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/reminders');
      const data = await response.json();
  
      if (response.ok) {
        const todaysReminders = data.filter((reminder) => reminder.days.includes(today));
        setReminders(todaysReminders);
        
        todaysReminders.forEach((reminder) => {
          reminder.times.forEach(async (timeObj) => {
            if (!timeObj.completed[today]) {
              const [hour, minute] = timeObj.time.split(':');
              const triggerTime = new Date();
              triggerTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
              await scheduleNotification(triggerTime);
            }
          });
        });
      } else {
        Alert.alert('Error', 'Failed to fetch reminders.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching reminders.');
      console.error(error);
    }
  };

  const scheduleNotification = async (triggerTime) => {
    try {
      await notifee.requestPermission();
  
      const channelId = await notifee.createChannel({
        id: 'reminder-channel',
        name: 'Medication Reminders',
        sound: 'default',
        importance: AndroidImportance.HIGH,
      });
  
      await notifee.createTriggerNotification(
        {
          title: 'Medication Reminder',
          body: 'It\'s time to take your medicine.',
          android: {
            channelId,
            smallIcon: 'ic_launcher',
            sound: 'default',
            importance: AndroidImportance.HIGH,
          },
          ios: {
            sound: 'default',
            critical: true,
          }
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerTime.getTime(),
        }
      );
    } catch (error) {
      console.error('Notification scheduling error:', error);
      Alert.alert('Notification Error', 'Could not schedule medication reminder');
    }
  };

  const refreshHandler = async () => {
    setRefreshing(true);
    await Promise.all([fetchReminders(), fetchInventoryData()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReminders();
    fetchInventoryData();
  }, []);

  const handleTickClick = (reminder) => {
    setSelectedReminder(reminder);
    setModalVisible(true);
  };

  const handleRemoveTime = async (time, day) => {
    if (selectedReminder) {
      try {
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
                            [today]: true,
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
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshHandler} />
        }
      >
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
                        ? { textDecorationLine: 'line-through', opacity: 0.5 }
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
              .filter((timeObj) => !(timeObj.completed && timeObj.completed[today]))
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
        <View style={styles.headerRow}>
          <Icon name="alert-circle-outline" size={24} color="#FF6B6B" />
          <Text style={styles.header}>Low Stock Alerts</Text>
        </View>
        <TouchableOpacity 
          style={styles.seeAllButton} 
          onPress={() => navigation.navigate('Inventory')}
        >
          <Text style={styles.seeAllButtonText}>View All</Text>
          <Icon name="chevron-right" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Low Stock Items - Max 2 cards side by side */}
      <View style={styles.inventoryContainer}>
        {lowStockItems.length === 0 ? (
          <View style={styles.noAlertsContainer}>
            <Icon name="check-circle-outline" size={40} color="#4CAF50" />
            <Text style={styles.noAlertsText}>All items are well stocked</Text>
          </View>
        ) : (
          <View style={styles.cardsRow}>
            {lowStockItems.slice(0, 2).map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.inventoryCard}
                onPress={() => navigation.navigate('Inventory')}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.stockIndicator}>
                    <Text style={styles.stockCount}>{item.inStock}</Text>
                  </View>
                  <Text style={styles.inventoryName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <Icon name="alert-circle" size={16} color="#FF6B6B" />
                  <Text style={styles.lowStockText}>Low Stock</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  header: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#2D3748',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#4A90E2',
  },
  inventoryContainer: {
    marginBottom: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inventoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stockIndicator: {
    backgroundColor: '#FFF3F3',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockCount: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FF6B6B',
  },
  inventoryName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#2D3748',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lowStockText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FF6B6B',
  },
  noAlertsContainer: {
    backgroundColor: '#F7FFF7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  noAlertsText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#4CAF50',
    textAlign: 'center',
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