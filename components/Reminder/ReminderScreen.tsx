import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  RefreshControl,
  Pressable, // Keep Pressable if needed elsewhere
  Platform, // For potential platform-specific adjustments
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStackNavigator } from '@react-navigation/stack';
import NewReminderScreen from './NewReminderScreen'; // Assuming this file exists
import InventoryScreen from './InventoryScreen'; // Assuming this file exists
import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
// Import Reanimated components and hooks
// Ensure you have installed and configured react-native-reanimated
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeInDown, // Pre-built layout animation
  FadeInUp,   // Pre-built layout animation
  FadeIn,     // Pre-built layout animation
  Layout,     // For animating layout changes
  ZoomIn,     // Pre-built animation for modal
} from 'react-native-reanimated';

// --- Type Definitions (Add these for better type safety) ---
interface TimeObject {
  time: string;
  dose: number;
  completed?: { [key: string]: boolean };
}

interface Reminder {
  _id: string; // Assuming MongoDB ObjectId string
  name: string;
  description?: string;
  totalDoses: number;
  days: string[];
  times: TimeObject[];
}

interface InventoryItem {
  _id: string; // Assuming MongoDB ObjectId string
  name: string;
  inStock: number;
  // Add other inventory properties if needed
}

interface ReminderMainScreenProps {
  navigation: any; // Replace 'any' with more specific navigation prop type if available
}

// --- Navigation Setup (Unchanged) ---
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

// --- Helper Function: isPastDue (FIXED: Removed useCallback) ---
// This function now correctly calculates based on the current time each time it's called.
const isPastDue = (timeString: string): boolean => {
    const [hour, minute] = timeString.split(':');
    const now = new Date(); // Get current time *inside* the function call
    const reminderTimeToday = new Date(now); // Create a new date object based on 'now' for today
    reminderTimeToday.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0); // Set hours/mins for today

    // Compare the reminder time for today with the current time
    return reminderTimeToday < now;
};


// --- Animated Components ---

// Animated component for Reminder Cards
const AnimatedReminderCard = ({ item, index, onTickClick, today, getStatusIcon, getStatusColor }) => {
  return (
    // Use entering animation for initial appearance
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400).easing(Easing.out(Easing.quad))}
      layout={Layout.springify()} // Animate layout changes (e.g., if list reorders)
    >
      <View style={styles.reminderCard}>
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
              onPress={() => onTickClick(item)} // Pass handler
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
                key={`${item._id}-${timeIndex}`} // Use a unique key combining reminder ID and time index
                style={styles.timeItem}
              >
                <Icon
                  name={getStatusIcon(timeObj)} // Pass helper func result
                  size={16}
                  color={getStatusColor(timeObj)} // Pass helper func result
                />
                <Text
                  style={[
                    styles.time,
                    { color: getStatusColor(timeObj) }, // Pass helper func result
                    timeObj.completed && timeObj.completed[today] && styles.completedTime,
                  ]}
                >
                  {timeObj.time}
                </Text>
                <Text style={styles.doseInfo}>
                  {timeObj.dose} dose
                  {timeObj.completed && timeObj.completed[today]
                    ? ' • Taken'
                    : isPastDue(timeObj.time) // Call helper func directly
                    ? ' • Past Due'
                    : ' • Upcoming'}
                </Text>
              </View>
            ))}
          </View>
        </View>
    </Animated.View>
  );
};

// Animated component for Inventory Cards
const AnimatedInventoryCard = ({ item, index, alertStyle, onPress }) => {
  return (
    // Use entering animation for initial appearance
    <Animated.View
        style={{ flex: 1 }} // Ensure it takes up space in the row
        entering={FadeIn.delay(index * 150).duration(400)}
    >
      <TouchableOpacity
        style={[
          styles.inventoryCard,
          {
            backgroundColor: alertStyle.backgroundColor,
            borderWidth: 1,
            borderColor: alertStyle.borderColor,
          },
        ]}
        onPress={onPress} // Pass navigation handler
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
    </Animated.View>
  );
};


// --- Main Screen Component ---
const ReminderMainScreen: React.FC<ReminderMainScreenProps> = ({ navigation }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  // useMemo is correctly imported and used for today's short weekday name
  const today = useMemo(() => new Date().toLocaleString('en-US', { weekday: 'short' }), []);

  // --- Data Fetching Functions (Optimized with useCallback) ---
  const fetchInventoryData = useCallback(async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) return false; // Early exit if no username

      const inventoryResponse = await fetch(`http://10.0.2.2:5000/inventory?username=${username}`);
      if (!inventoryResponse.ok) throw new Error(`Inventory fetch failed: ${inventoryResponse.status}`);
      const inventoryData = await inventoryResponse.json();

      if (Array.isArray(inventoryData)) {
        const lowItems = inventoryData.filter(item => item.inStock < 5 && item.inStock > 0);
        setLowStockItems(lowItems); // Update state with low stock items
      } else {
        setLowStockItems([]); // Reset if data is not an array
        console.warn('Invalid inventory data format received:', inventoryData); // Log warning
      }
      return true; // Indicate success
    } catch (error) {
      console.error('Error fetching inventory data:', error); // Log the error
      // Non-blocking error handling for UI
      return false; // Indicate failure
    }
  }, []); // Empty dependency array: function doesn't depend on props/state

  const fetchReminders = useCallback(async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) return false; // Early exit

      const response = await fetch(`http://10.0.2.2:5000/reminders/${username}`);
      if (!response.ok) throw new Error(`Reminders fetch failed: ${response.status}`);
      const data = await response.json();

      // Filter reminders for the current day ('today' is stable due to useMemo)
      const todaysReminders = data.filter((reminder: Reminder) => reminder.days.includes(today));
      setReminders(todaysReminders); // Update state

      // Schedule notifications (runs asynchronously, doesn't block UI)
      todaysReminders.forEach((reminder) => {
        reminder.times.forEach((timeObj) => {
          if (!timeObj.completed || !timeObj.completed[today]) {
            // Schedule notification - fire and forget is okay here
            scheduleNotification(timeObj.time, reminder.name);
          }
        });
      });

      return true; // Indicate success
    } catch (error) {
      console.error('Error fetching reminders:', error); // Log the error
      return false; // Indicate failure
    }
  }, [today]); // Dependency: today (from useMemo)

  // --- Notification Scheduling (Improved Error Handling) ---
  const scheduleNotification = async (timeString: string, medicineName: string) => {
    try {
      await notifee.requestPermission();

      const channelId = await notifee.createChannel({
        id: 'reminder-channel',
        name: 'Medication Reminders',
        sound: 'default',
        importance: AndroidImportance.HIGH,
      });

      // Calculate trigger time based on today's date and the time string
      const [hour, minute] = timeString.split(':');
      const triggerTime = new Date();
      triggerTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

      const now = new Date();
      // Only schedule if the trigger time is in the future
      if (triggerTime <= now) {
        // console.log(`Skipping past notification for ${medicineName} at ${timeString}`);
        return; // Don't schedule past notifications
      }

      // Generate a unique ID for the notification
      const notificationId = `${medicineName.replace(/\s+/g, '_')}_${timeString}`;

      // Check if a notification with this ID already exists
      // Note: This might not be perfectly reliable if app restarts clear scheduled lists internally in notifee
      const scheduledNotifications = await notifee.getTriggerNotificationIds();
      if (scheduledNotifications.includes(notificationId)) {
          // console.log(`Notification already scheduled for ${medicineName} at ${timeString}`);
          return; // Avoid duplicates
      }


      // Create the trigger notification
      await notifee.createTriggerNotification(
        {
          id: notificationId, // Use the unique ID
          title: 'Medication Reminder',
          body: `It's time to take your ${medicineName}.`,
          android: {
            channelId,
            smallIcon: 'ic_launcher', // Ensure this icon exists
            sound: 'default',
            importance: AndroidImportance.HIGH,
            pressAction: { id: 'default' },
          },
          ios: {
            sound: 'default',
            // critical: true, // Consider if critical alert is needed, requires special entitlement
          }
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerTime.getTime(),
        }
      );
      // console.log(`Notification scheduled for ${medicineName} at ${timeString}`);

    } catch (error) {
      console.error(`Error scheduling notification for ${medicineName}:`, error);
      // Avoid alerting the user for background scheduling errors
    }
  };

  // --- Refresh Handler (Using Promise.allSettled for robustness) ---
  const refreshHandler = useCallback(async () => {
    setRefreshing(true);
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) {
        Alert.alert('Error', 'You need to be logged in to refresh data.');
        setRefreshing(false);
        return;
      }

      // Fetch both data types concurrently and wait for both to settle
      const results = await Promise.allSettled([
        fetchReminders(),
        fetchInventoryData()
      ]);

      // Check the results of each promise
      const remindersSuccess = results[0].status === 'fulfilled' && results[0].value;
      const inventorySuccess = results[1].status === 'fulfilled' && results[1].value;

      // Provide feedback based on success/failure
      if (!remindersSuccess && !inventorySuccess) {
        Alert.alert('Refresh Failed', 'Could not refresh reminders or inventory. Please check your connection.');
      } else if (!remindersSuccess) {
        Alert.alert('Partial Refresh', 'Inventory updated, but failed to refresh reminders.');
      } else if (!inventorySuccess) {
        Alert.alert('Partial Refresh', 'Reminders updated, but failed to refresh inventory.');
      }
      // If both succeed, no alert is needed.

    } catch (error) {
      // Catch any unexpected errors during the refresh process
      console.error("Unexpected refresh error:", error);
      Alert.alert('Error', 'An unexpected error occurred while refreshing data.');
    } finally {
      // Ensure refreshing state is always turned off
      setRefreshing(false);
    }
  }, [fetchReminders, fetchInventoryData]); // Dependencies: memoized fetch functions

  // --- Initial Data Load ---
  useEffect(() => {
    const initializeData = async () => {
      setRefreshing(true); // Show loading indicator on initial load
      await Promise.allSettled([fetchReminders(), fetchInventoryData()]);
      setRefreshing(false); // Hide indicator once done
    };
    initializeData();
    // Run only once on mount, dependencies ensure fetch functions are stable
  }, [fetchReminders, fetchInventoryData]);

  // --- Event Handlers ---
  const handleTickClick = useCallback((reminder: Reminder) => {
    setSelectedReminder(reminder);
    // Check if there are any doses for today that are not completed
    const incompleteTimes = reminder.times.filter(
      (timeObj) => !(timeObj.completed && timeObj.completed[today])
    );
    if (incompleteTimes.length > 0) {
      setModalVisible(true); // Show modal only if there are times to mark
    } else {
      Alert.alert('Info', 'All doses for today have already been marked as completed.');
    }
  }, [today]); // Dependency: today

  const handleRemoveTime = useCallback(async (time: TimeObject) => {
    if (!selectedReminder) return; // Guard clause

    const reminderId = selectedReminder._id;
    const timeToRemove = time.time;
    const originalReminders = reminders; // Store original state for potential revert

    // --- Optimistic UI Update ---
    setReminders((prevReminders) =>
      prevReminders.map((r) =>
        r._id === reminderId
          ? {
              ...r,
              times: r.times.map((t) =>
                t.time === timeToRemove
                  ? { ...t, completed: { ...(t.completed || {}), [today]: true } } // Mark as completed today
                  : t
              ),
            }
          : r
      )
    );
    setModalVisible(false); // Close modal immediately

    try {
      // --- Cancel Notification ---
      const notificationId = `${selectedReminder.name.replace(/\s+/g, '_')}_${timeToRemove}`;
      await notifee.cancelNotification(notificationId);
      // console.log(`Cancelled notification: ${notificationId}`);

      // --- Update Backend ---
      const response = await fetch(`http://10.0.2.2:5000/reminders/${reminderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time: timeToRemove, // The specific time to mark completed
          day: today,         // The specific day to mark completed for
        }),
      });

      if (!response.ok) {
        // --- Revert UI on Backend Failure ---
        setReminders(originalReminders); // Restore previous state
        const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty object
        Alert.alert('Error', errorData.message || 'Failed to mark the reminder as completed on the server.');
        // Optionally reopen modal if revert happens:
        // setSelectedReminder(selectedReminder); // Ensure selected reminder is still set
        // setModalVisible(true);
      } else {
         // Backend update successful, UI already updated optimistically.
         // Optionally, fetch reminders again to ensure sync, but optimistic update is usually sufficient.
         // fetchReminders();
      }

    } catch (error) {
      // --- Revert UI on Network/Other Errors ---
      console.error('Error updating reminder:', error);
      setReminders(originalReminders); // Restore previous state
      Alert.alert('Error', 'An network error occurred while updating the reminder.');
       // Optionally reopen modal:
       // setSelectedReminder(selectedReminder);
       // setModalVisible(true);
    }
  }, [selectedReminder, today, reminders]); // Dependencies: selectedReminder, today, and reminders (for revert)

  const handleAddMedication = useCallback(() => {
    navigation.navigate('NewReminder');
  }, [navigation]);

  const handleNavigateInventory = useCallback(() => {
     navigation.navigate('Inventory');
  }, [navigation]);


  // --- Helper Functions (getStatusColor/Icon now depend on 'today') ---
  const getStatusColor = useCallback((timeObj: TimeObject): string => {
    if (timeObj.completed && timeObj.completed[today]) return '#4CAF50'; // Green (Completed)
    if (isPastDue(timeObj.time)) return '#FF6B6B'; // Red (Past Due)
    return '#4A90E2'; // Blue (Upcoming)
  }, [today]); // Dependency: today

  const getStatusIcon = useCallback((timeObj: TimeObject): string => {
    if (timeObj.completed && timeObj.completed[today]) return 'check-circle';
    if (isPastDue(timeObj.time)) return 'clock-alert-outline';
    return 'clock-outline';
  }, [today]); // Dependency: today

  // Memoized formatted date string
  const getFormattedDate = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }, []); // No dependencies, calculated once

  // Memoized function to get styling based on stock level
  const getStockAlertStyle = useCallback((inStock: number) => {
    if (inStock <= 2) { // Very Low
      return { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', textColor: '#DC2626', iconColor: '#DC2626' };
    } else { // Low Stock (assumes < 5 based on filter logic)
      return { backgroundColor: '#FEF3C7', borderColor: '#FCD34D', textColor: '#D97706', iconColor: '#D97706' };
    }
  }, []); // No dependencies, logic is self-contained

  // --- JSX Structure (with Reanimated components) ---
  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshHandler}
            colors={['#4A90E2']} // Spinner color for Android
            tintColor={'#4A90E2'} // Spinner color for iOS
          />
        }
        scrollEventThrottle={16} // Enable smoother scroll event handling if needed later
      >
        {/* --- Animated Header --- */}
        <Animated.View entering={FadeInDown.duration(500).easing(Easing.out(Easing.quad))}>
          <View style={styles.header}>
            <Text style={styles.date}>{getFormattedDate}</Text>
            <View style={styles.titleRow}>
              <Text style={styles.appTitle}>MediReminder</Text>
              <TouchableOpacity
                style={styles.headerAddButton}
                onPress={handleAddMedication}
              >
                <LinearGradient
                  colors={['#4A90E2', '#5C6BC0']} // Example gradient colors
                  style={styles.headerAddButtonGradient}
                >
                  <Icon name="plus" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* --- Main Content: Reminders --- */}
        <View style={styles.contentContainer}>
            <View style={styles.remindersSection}>
            <Animated.View entering={FadeIn.delay(100).duration(400)}>
                <View style={styles.reminderHeader}>
                    <View style={styles.headerRow}>
                        <Icon name="pill" size={22} color="#4A90E2" />
                        <Text style={styles.sectionTitle}>Today's Medications</Text>
                    </View>
                    {/* Refresh icon button */}
                    <TouchableOpacity onPress={refreshHandler} disabled={refreshing}>
                        <Icon name="refresh" size={22} color={refreshing ? '#A0AEC0' : '#4A90E2'} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <View style={styles.scrollViewWrapper}>
                {/* Conditional Rendering: Empty State or Reminder List */}
                {reminders.length === 0 && !refreshing ? (
                    <Animated.View entering={FadeInUp.duration(500)} style={styles.emptyStateContainer}>
                        <Icon name="medical-bag" size={48} color="#CBD5E0" />
                        <Text style={styles.emptyStateText}>No medications scheduled for today</Text>
                    </Animated.View>
                ) : (
                    reminders.map((item, index) => (
                        // Use the AnimatedReminderCard component
                        <AnimatedReminderCard
                            key={item._id || index} // Use stable key (_id preferred)
                            item={item}
                            index={index}
                            onTickClick={handleTickClick}
                            today={today}
                            getStatusIcon={getStatusIcon} // Pass memoized helper
                            getStatusColor={getStatusColor} // Pass memoized helper
                            // isPastDue is called directly inside AnimatedReminderCard now
                        />
                    ))
                )}
            </View>
            </View>
        </View>
      </ScrollView>

      {/* --- Fixed Low Stock Alerts Section (with animation) --- */}
      <Animated.View style={styles.fixedInventorySection} entering={FadeInUp.delay(200).duration(500).springify().damping(15)}>
        <View style={styles.inventoryHeader}>
          <View style={styles.headerRow}>
            <Icon name="alert-circle-outline" size={22} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={handleNavigateInventory} // Use navigation handler
          >
            <Text style={styles.seeAllButtonText}>View All</Text>
            <Icon name="chevron-right" size={18} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        <View style={styles.inventoryContainer}>
          {/* Conditional Rendering: No Alerts or Low Stock Cards */}
          {lowStockItems.length === 0 ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.noAlertsContainer}>
              <Icon name="check-circle" size={32} color="#4CAF50" />
              <Text style={styles.noAlertsText}>All items are well stocked</Text>
            </Animated.View>
          ) : (
            <View style={styles.cardsRow}>
              {/* Display only the first 2 low stock items */}
              {lowStockItems.slice(0, 2).map((item, index) => (
                  // Use the AnimatedInventoryCard component
                  <AnimatedInventoryCard
                      key={item._id || index} // Use stable key
                      item={item}
                      index={index}
                      alertStyle={getStockAlertStyle(item.inStock)} // Get dynamic style
                      onPress={handleNavigateInventory} // Navigate on press
                  />
              ))}
            </View>
          )}
        </View>
      </Animated.View>

      {/* --- Modal (Using standard Modal, animating content inside) --- */}
      <Modal
        animationType="fade" // Use standard fade for the modal backdrop
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Allow closing via back button on Android
      >
        <View style={styles.modalContainer}>
          {/* Animate the modal content appearance using ZoomIn */}
          <Animated.View style={styles.modalContent} entering={ZoomIn.duration(300).easing(Easing.out(Easing.quad))}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mark as Taken</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Select a time to mark {selectedReminder?.name} as taken:
            </Text>

            {/* ScrollView for potentially long list of times */}
            <ScrollView style={styles.modalScrollView}>
              {selectedReminder?.times
                .filter((timeObj) => !(timeObj.completed && timeObj.completed[today])) // Show only incomplete times for today
                .map((timeObj, index) => (
                    <TouchableOpacity
                        key={`${selectedReminder._id}-modal-${timeObj.time}-${index}`} // Unique key for modal items
                        onPress={() => handleRemoveTime(timeObj)} // Call handler to mark time as taken
                        style={styles.modalOption}
                    >
                        <View style={styles.modalOptionInner}>
                            {/* Use correct icon and color based on whether it's past due */}
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
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

// --- Styles (Largely Unchanged - Ensure Fonts are Linked) ---
// NOTE: Make sure you have linked the 'Poppins' font family in your React Native project (iOS/Android specific setup).
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
    paddingTop: Platform.OS === 'android' ? 25 : 48, // Adjust top padding for Android status bar
    paddingBottom: 220, // Ensure enough space below scroll for fixed section
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#2D3748',
  },
  headerAddButton: {
    position: 'absolute',
    right: 0, // Align to the right edge of the titleRow
    top: -4, // Shift slightly upwards
    justifyContent: 'center',
    alignItems: 'center',
    width: 52, // Ensure touchable area is large enough
  },
  headerAddButtonGradient: {
    width: 44, // Visual size
    height: 44, // Visual size
    borderRadius: 22, // Circular
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Add elevation for Android shadow
    shadowColor: '#4A90E2', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  contentContainer: {
    // No specific styles needed now
  },
  remindersSection: {
    paddingBottom: 20,
  },
  scrollViewWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  fixedInventorySection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, // Increased bottom padding
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#EDF2FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 5,
    elevation: 6, // Slightly increased elevation
    minHeight: 250, // Increased height from 180 to 200
    zIndex: 100, // Ensure it's on top
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
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#718096',
    marginTop: 12,
    textAlign: 'center',
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: 'rgba(0, 0, 0, 0.08)', // Softer shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1, // Use opacity in color
    shadowRadius: 5,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to the top
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1, // Take available space
    marginRight: 10, // Space before button
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
    marginLeft: 10, // Space after name container
    elevation: 2, // Add slight elevation to button
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  medicineDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    marginBottom: 16,
    marginTop: 4,
  },
  timesList: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Slightly more padding
  },
  time: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginLeft: 10, // Increased margin
    width: 60,
    textAlign: 'left',
  },
  completedTime: {
    textDecorationLine: 'line-through',
    color: '#90A4AE',
  },
  doseInfo: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    marginLeft: 12,
    flex: 1, // Take remaining space
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
    paddingVertical: 4, // Add padding for easier touch
  },
  seeAllButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4A90E2',
  },
  inventoryContainer: {
    marginBottom: 10,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inventoryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    elevation: 1,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    minHeight: 100,
    justifyContent: 'space-between',
    borderWidth: 1, // Keep border definition separate
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stockIndicator: {
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1, // Keep border definition separate
  },
  stockCount: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  inventoryName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  lowStockText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
  noAlertsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Add subtle border
  },
  noAlertsText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#4CAF50',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker backdrop
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 0, // Remove padding here, add to inner content
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Increased shadow offset
    shadowOpacity: 0.15, // Slightly increased opacity
    shadowRadius: 12, // Increased radius
    elevation: 10, // Increased elevation
    maxHeight: '75%', // Limit height
    overflow: 'hidden', // Clip content to rounded corners
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    paddingHorizontal: 20, // Add horizontal padding
    paddingTop: 16, // Add top padding
  },
  modalOption: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20, // Add horizontal margin
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Add subtle border
  },
  modalOptionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTimeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#2D3748',
  },
  modalDoseText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    marginTop: 2,
  },
  modalCancelButton: {
    alignItems: 'center',
    margin: 20, // Use margin instead of marginTop
    paddingVertical: 14, // Increased padding
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#4A5568',
  },
});

export default ReminderApp;
