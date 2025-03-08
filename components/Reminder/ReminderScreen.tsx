import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Button, RefreshControl, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStackNavigator } from '@react-navigation/stack';
import NewReminderScreen from './NewReminderScreen';
import notifee from '@notifee/react-native';
import { TriggerType, AndroidImportance } from '@notifee/react-native';
import InventoryScreen from './InventoryScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

// Create a Stack Navigator
const Stack = createStackNavigator();

const ReminderApp = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F7F9FC' }
      }}
    >
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
      // Get the username from AsyncStorage
      const username = await AsyncStorage.getItem('username');
      
      if (!username) {
        console.log('No username found in AsyncStorage');
        return;
      }
  
      console.log('Fetching inventory data for user:', username);
      
      // Fetch inventory stats
      const statsResponse = await fetch('http://20.193.156.237:5000/stats');
      const statsData = await statsResponse.json();
      console.log('Inventory stats:', statsData);
      setInventoryStats(statsData);
  
      // Fetch all inventory items with the username parameter
      const inventoryResponse = await fetch(`http://20.193.156.237:5000/inventory?username=${username}`);
      const inventoryData = await inventoryResponse.json();
      console.log('Inventory data received:', inventoryData);
      
      // Check if inventoryData is an array before filtering
      if (Array.isArray(inventoryData)) {
        const lowStockItems = inventoryData.filter(item => item.inStock < 5 && item.inStock > 0);
        console.log('Low stock items:', lowStockItems);
        setLowStockItems(lowStockItems);
      } else {
        console.error('Invalid inventory data format:', inventoryData);
        setLowStockItems([]);
      }
      
      return true; // Return success status
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      return false; // Return failure status
    }
  };

  const fetchReminders = async () => {
    try {
      // Get the username from AsyncStorage
      const username = await AsyncStorage.getItem('username');
      
      if (!username) {
        console.log('No username found in AsyncStorage for reminders');
        return false;
      }
      
      console.log('Fetching reminders for user:', username);
      
      // Use the endpoint that fetches reminders for a specific user
      const response = await fetch(`http://20.193.156.237:5000/reminders/${username}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Reminders data received:', data);
        const todaysReminders = data.filter((reminder) => reminder.days.includes(today));
        console.log('Today\'s reminders:', todaysReminders);
        setReminders(todaysReminders);
        
        todaysReminders.forEach((reminder) => {
          reminder.times.forEach(async (timeObj) => {
            if (!timeObj.completed[today]) {
              await scheduleNotification(timeObj.time, reminder.name);
            }
          });
        });
        
        return true; // Return success status
      } else {
        console.error('Failed to fetch reminders. Server responded with:', response.status);
        return false; // Return failure status
      }
    } catch (error) {
      console.error('Error in fetchReminders:', error);
      return false; // Return failure status
    }
  };

  const scheduleNotification = async (timeString, medicineName) => {
    try {
      await notifee.requestPermission();
  
      const channelId = await notifee.createChannel({
        id: 'reminder-channel',
        name: 'Medication Reminders',
        sound: 'default',
        importance: AndroidImportance.HIGH,
      });
      
      // Parse the time string
      const [hour, minute] = timeString.split(':');
      const triggerTime = new Date();
      triggerTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
      
      // Check if the time is in the future
      const now = new Date();
      if (triggerTime <= now) {
        // Time has already passed today, no need to show an error
        console.log(`Skipped notification for ${medicineName} at ${timeString} - time already passed`);
        return;
      }
  
      await notifee.createTriggerNotification(
        {
          title: 'Medication Reminder',
          body: `It's time to take your ${medicineName}.`,
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
      // Handle other unexpected errors without showing user-facing alerts
      console.error('Notification scheduling error:', error);
    }
  };

  const refreshHandler = async () => {
    console.log('Refresh handler triggered');
    setRefreshing(true);
    
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) {
        console.log('No username found during refresh');
        Alert.alert('Error', 'You need to be logged in to refresh data.');
        setRefreshing(false);
        return;
      }
      
      console.log('Starting refresh for user:', username);
      
      const remindersSuccess = await fetchReminders().catch(err => {
        console.error('Error during reminders refresh:', err);
        return false;
      });
      
      const inventorySuccess = await fetchInventoryData().catch(err => {
        console.error('Error during inventory refresh:', err);
        return false;
      });
      
      if (!remindersSuccess && !inventorySuccess) {
        Alert.alert('Refresh Failed', 'Could not refresh data. Please check your connection.');
      } else if (!remindersSuccess) {
        Alert.alert('Partial Refresh', 'Your inventory was updated, but there was an issue refreshing reminders.');
      } else if (!inventorySuccess) {
        Alert.alert('Partial Refresh', 'Your reminders were updated, but there was an issue refreshing inventory data.');
      } else {
        console.log('Refresh completed successfully');
        // Uncomment if you want to show success message
        // Alert.alert('Success', 'Data refreshed successfully');
      }
    } catch (error) {
      console.error('Error during refresh operation:', error);
      Alert.alert('Error', 'An unexpected error occurred while refreshing data.');
    } finally {
      setRefreshing(false);
      console.log('Refresh operation completed');
    }
  };

  useEffect(() => {
    console.log('Component mounted, initializing data...');
    
    const initializeData = async () => {
      setRefreshing(true);
      try {
        await Promise.all([
          fetchReminders().catch(err => console.error('Initial reminders fetch error:', err)),
          fetchInventoryData().catch(err => console.error('Initial inventory fetch error:', err))
        ]);
      } catch (error) {
        console.error('Error during initial data load:', error);
      } finally {
        setRefreshing(false);
      }
    };
    
    initializeData();
  }, []);

  const handleTickClick = (reminder) => {
    setSelectedReminder(reminder);
    
    // Filter out times that have already been completed
    const incompleteTimes = reminder.times.filter(
      (timeObj) => !(timeObj.completed && timeObj.completed[today])
    );
    
    // If there are incomplete times, show the modal
    if (incompleteTimes.length > 0) {
      setModalVisible(true);
    } else {
      Alert.alert('Info', 'All doses for today have been marked as completed.');
    }
  };

  const handleRemoveTime = async (time, day) => {
    if (selectedReminder) {
      try {
        console.log('Marking dose as completed:', selectedReminder.name, time.time);
        
        const response = await fetch(`http://20.193.156.237:5000/reminders/${selectedReminder._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            time: time.time,
            days: today,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          console.log('Dose marked as completed successfully');
          
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
          console.error('Failed to mark dose as completed:', data.message);
          Alert.alert('Error', data.message || 'Failed to mark the reminder as completed.');
        }
      } catch (error) {
        console.error('Error removing time:', error);
        Alert.alert('Error', 'An error occurred while updating the reminder.');
      }
    }
  };

  // Function to determine if a reminder time is past due
  const isPastDue = (timeString) => {
    const [hour, minute] = timeString.split(':');
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
    
    return reminderTime < new Date();
  };

  // Function to get icon color based on completion status
  const getStatusColor = (timeObj) => {
    if (timeObj.completed && timeObj.completed[today]) {
      return '#4CAF50'; // Green for completed
    } else if (isPastDue(timeObj.time)) {
      return '#FF6B6B'; // Red for past due
    }
    return '#4A90E2'; // Blue for upcoming
  };

  // Function to get status icon based on completion status
  const getStatusIcon = (timeObj) => {
    if (timeObj.completed && timeObj.completed[today]) {
      return 'check-circle';
    } else if (isPastDue(timeObj.time)) {
      return 'clock-alert-outline';
    }
    return 'clock-outline';
  };

  // Function to get formatted time and date
  const getFormattedDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Function to get stock alert styling
  const getStockAlertStyle = (inStock) => {
    if (inStock <= 2) {
      return {
        backgroundColor: '#FEE2E2', // Light red
        borderColor: '#FCA5A5', // Medium red
        textColor: '#DC2626', // Dark red
        iconColor: '#DC2626'
      };
    } else {
      return {
        backgroundColor: '#FEF3C7', // Light yellow
        borderColor: '#FCD34D', // Medium yellow
        textColor: '#D97706', // Dark yellow/amber
        iconColor: '#D97706'
      };
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshHandler}
            colors={['#4A90E2']}
            tintColor={'#4A90E2'}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.date}>{getFormattedDate()}</Text>
          <Text style={styles.appTitle}>MediReminder</Text>
        </View>

        {/* This is the main content container for reminders */}
        <View style={styles.contentContainer}>
          {/* Scrollable top section for reminders */}
          <View style={styles.remindersSection}>
            <View style={styles.reminderHeader}>
              <View style={styles.headerRow}>
                <Icon name="pill" size={22} color="#4A90E2" />
                <Text style={styles.sectionTitle}>Today's Medications</Text>
              </View>
              <TouchableOpacity onPress={refreshHandler}>
                <Icon name="refresh" size={22} color="#4A90E2" />
              </TouchableOpacity>
            </View>

            <View style={styles.scrollViewWrapper}>
              {reminders.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Icon name="medical-bag" size={48} color="#CBD5E0" />
                  <Text style={styles.emptyStateText}>No medications scheduled for today</Text>
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={() => navigation.navigate('NewReminder')}
                  >
                    <Text style={styles.emptyStateButtonText}>Add Medication</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                reminders.map((item, index) => (
                  <View key={item._id || index} style={styles.reminderCard}>
                    <View style={styles.cardTop}>
                      <View style={styles.nameContainer}>
                        <Text style={styles.medicineName}>{item.name}</Text>
                        <View style={styles.dosesContainer}>
                          <Icon name="pill" size={14} color="#4A90E2" />
                          <Text style={styles.totalDoses}>{item.totalDoses} doses</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.checkButton}
                        onPress={() => handleTickClick(item)}
                      >
                        <Icon name="check" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    {item.description && (
                      <Text style={styles.medicineDescription}>{item.description}</Text>
                    )}
                    
                    <View style={styles.timesList}>
                      {item.times.map((timeObj, timeIndex) => (
                        <View 
                          key={`${item._id}-${timeIndex}`}
                          style={styles.timeItem}
                        >
                          <Icon 
                            name={getStatusIcon(timeObj)} 
                            size={16} 
                            color={getStatusColor(timeObj)} 
                          />
                          <Text
                            style={[
                              styles.time,
                              {color: getStatusColor(timeObj)},
                              timeObj.completed && timeObj.completed[today] && styles.completedTime
                            ]}
                          >
                            {timeObj.time}
                          </Text>
                          <Text style={styles.doseInfo}>
                            {timeObj.dose} dose
                            {timeObj.completed && timeObj.completed[today] ? 
                              " • Taken" : 
                              isPastDue(timeObj.time) ? " • Past Due" : " • Upcoming"}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
          
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewReminder')}
      >
        <LinearGradient
          colors={['#4A90E2', '#5C6BC0']}
          style={styles.fabGradient}
        >
          <Icon name="plus" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Low Stock Alerts section at bottom of screen */}
      <View style={styles.fixedInventorySection}>
        <View style={styles.inventoryHeader}>
          <View style={styles.headerRow}>
            <Icon name="alert-circle-outline" size={22} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
          </View>
          <TouchableOpacity 
            style={styles.seeAllButton} 
            onPress={() => navigation.navigate('Inventory')}
          >
            <Text style={styles.seeAllButtonText}>View All</Text>
            <Icon name="chevron-right" size={18} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Low Stock Items */}
        <View style={styles.inventoryContainer}>
          {lowStockItems.length === 0 ? (
            <View style={styles.noAlertsContainer}>
              <Icon name="check-circle" size={32} color="#4CAF50" />
              <Text style={styles.noAlertsText}>All items are well stocked</Text>
            </View>
          ) : (
            <View style={styles.cardsRow}>
              {lowStockItems.slice(0, 2).map((item, index) => {
                const alertStyle = getStockAlertStyle(item.inStock);
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.inventoryCard,
                      { 
                        backgroundColor: alertStyle.backgroundColor,
                        borderWidth: 1,
                        borderColor: alertStyle.borderColor,
                      }
                    ]}
                    onPress={() => navigation.navigate('Inventory')}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.stockIndicator, {
                        backgroundColor: '#FFFFFF',
                        borderColor: alertStyle.borderColor,
                        borderWidth: 1,
                      }]}>
                        <Text style={[styles.stockCount, {
                          color: alertStyle.textColor
                        }]}>{item.inStock}</Text>
                      </View>
                      <Text style={[styles.inventoryName, {
                        color: alertStyle.textColor
                      }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <View style={styles.cardFooter}>
                      <Icon 
                        name={item.inStock <= 2 ? "alert-circle" : "alert-circle-outline"} 
                        size={16} 
                        color={alertStyle.iconColor} 
                      />
                      <Text style={[styles.lowStockText, {
                        color: alertStyle.textColor
                      }]}>
                        {item.inStock <= 2 ? "Very Low" : "Low Stock"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>


      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mark as Taken</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Select a time to mark {selectedReminder?.name} as taken:
            </Text>
            
            {selectedReminder?.times
              .filter((timeObj) => !(timeObj.completed && timeObj.completed[today]))
              .map((timeObj, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleRemoveTime(timeObj)}
                  style={styles.modalOption}
                >
                  <View style={styles.modalOptionInner}>
                    <Icon 
                      name={isPastDue(timeObj.time) ? "clock-alert-outline" : "clock-outline"} 
                      size={20} 
                      color={isPastDue(timeObj.time) ? "#FF6B6B" : "#4A90E2"} 
                    />
                    <View>
                      <Text style={styles.modalTimeText}>
                        {timeObj.time}
                      </Text>
                      <Text style={styles.modalDoseText}>
                        {timeObj.dose} dose {isPastDue(timeObj.time) ? " (Past Due)" : ""}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContainer: {
    paddingTop: 48,
    paddingBottom: 20, // Reduced padding to make room for fixed section
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#718096',
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#2D3748',
  },
  // Container for the main content sections
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  // Section for reminders 
  remindersSection: {
    paddingBottom: 20,
  },
  // Wrapper for scrollable content
  scrollViewWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  // Fixed inventory section at bottom of screen
  fixedInventorySection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#EDF2FA', // Lighter blue background to differentiate it
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#2D3748',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#718096',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#2D3748',
    marginBottom: 4,
  },
  dosesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalDoses: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#718096',
  },
  checkButton: {
    backgroundColor: '#4A90E2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    marginBottom: 16,
  },
  timesList: {
    marginTop: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  time: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
    width: 60,
  },
  completedTime: {
    textDecorationLine: 'line-through',
  },
  doseInfo: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    marginLeft: 8,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4A90E2',
  },
  inventoryContainer: {
    marginBottom: 10, // Slightly reduced margin
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inventoryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16, // Increased border radius
    elevation: 1, // Reduced elevation
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stockIndicator: {
    borderRadius: 12, // More rounded
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockCount: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  inventoryName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lowStockText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  noAlertsContainer: {
    backgroundColor: '#F0FFF4',
    borderRadius: 16, // Increased border radius to match
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  noAlertsText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#4CAF50',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 730, // Increased from 100 to 140 to place it higher above the fixed section
    elevation: 5,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#2D3748',
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    marginBottom: 16,
  },
  modalOption: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  modalOptionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTimeText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#2D3748',
    marginBottom: 4,
  },
  modalDoseText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
  },
  modalCancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#718096',
  },
});

export default ReminderApp;