import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo here
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

// --- Animated Components ---

// Animated component for Reminder Cards
const AnimatedReminderCard = ({ item, index, onTickClick, today, getStatusIcon, getStatusColor, isPastDue }) => {
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
                   : isPastDue(timeObj.time) // Pass helper func result
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

  // useMemo is now correctly imported
  const today = useMemo(() => new Date().toLocaleString('en-US', { weekday: 'short' }), []);

  // --- Data Fetching Functions (Console logs removed, minor improvements) ---
  const fetchInventoryData = useCallback(async () => { // Use useCallback
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) return false;

      // Fetch inventory stats (assuming endpoint doesn't need username)
      // If stats are needed later, fetch them here. Removed setInventoryStats if unused.
      // const statsResponse = await fetch('http://10.0.2.2:5000/stats');
      // if (!statsResponse.ok) throw new Error(`Stats fetch failed: ${statsResponse.status}`);
      // const statsData = await statsResponse.json();
      // setInventoryStats(statsData); // Uncomment if needed

      const inventoryResponse = await fetch(`http://10.0.2.2:5000/inventory?username=${username}`);
      if (!inventoryResponse.ok) throw new Error(`Inventory fetch failed: ${inventoryResponse.status}`);
      const inventoryData = await inventoryResponse.json();

      if (Array.isArray(inventoryData)) {
        const lowItems = inventoryData.filter(item => item.inStock < 5 && item.inStock > 0);
        setLowStockItems(lowItems); // Update state
      } else {
        setLowStockItems([]);
        throw new Error('Invalid inventory data format received');
      }
      return true;
    } catch (error) {
      // Non-blocking error handling
      return false;
    }
  }, []); // Empty dependency array for useCallback

  const fetchReminders = useCallback(async () => { // Use useCallback
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) return false;

      const response = await fetch(`http://10.0.2.2:5000/reminders/${username}`);
      if (!response.ok) throw new Error(`Reminders fetch failed: ${response.status}`);
      const data = await response.json();

      const todaysReminders = data.filter((reminder) => reminder.days.includes(today));
      setReminders(todaysReminders); // Update state

      // Schedule notifications (can run in background)
      todaysReminders.forEach((reminder) => {
        reminder.times.forEach((timeObj) => { // No need for async here unless scheduleNotification itself needs await inside loop
          if (!timeObj.completed || !timeObj.completed[today]) {
             scheduleNotification(timeObj.time, reminder.name); // Fire and forget is okay here
          }
        });
      });

      return true;
    } catch (error) {
      return false;
    }
  }, [today]); // Add today as dependency

  // --- Notification Scheduling (Console logs removed) ---
  const scheduleNotification = async (timeString, medicineName) => {
    try {
      await notifee.requestPermission();

      const channelId = await notifee.createChannel({
        id: 'reminder-channel',
        name: 'Medication Reminders',
        sound: 'default',
        importance: AndroidImportance.HIGH,
      });

      const [hour, minute] = timeString.split(':');
      const triggerTime = new Date();
      triggerTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

      const now = new Date();
      if (triggerTime <= now) {
        return; // Skip past notifications
      }

      // Check if a notification for this exact time and medicine already exists
      // Note: This check might be basic. More robust checking might involve storing scheduled IDs.
      const scheduledNotifications = await notifee.getTriggerNotifications();
      const alreadyScheduled = scheduledNotifications.some(notif =>
        notif.notification.title === 'Medication Reminder' &&
        notif.notification.body?.includes(medicineName) &&
        notif.trigger.timestamp === triggerTime.getTime()
      );

      if (!alreadyScheduled) {
          await notifee.createTriggerNotification(
            {
              // Use a unique ID based on reminder and time to allow updates/cancellations
              id: `${medicineName.replace(/\s+/g, '_')}_${timeString}`,
              title: 'Medication Reminder',
              body: `It's time to take your ${medicineName}.`,
              android: {
                channelId,
                smallIcon: 'ic_launcher',
                sound: 'default',
                importance: AndroidImportance.HIGH,
                pressAction: { id: 'default' },
              },
              ios: {
                sound: 'default',
                // critical: true, // Reconsider if critical alert is necessary
              }
            },
            {
              type: TriggerType.TIMESTAMP,
              timestamp: triggerTime.getTime(),
            }
          );
      }
    } catch (error) {
      // Avoid alerting for scheduling errors
    }
  };

  // --- Refresh Handler (Console logs removed) ---
  const refreshHandler = useCallback(async () => { // Use useCallback
    setRefreshing(true);
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) {
        Alert.alert('Error', 'You need to be logged in to refresh data.');
        setRefreshing(false);
        return;
      }

      const results = await Promise.allSettled([
        fetchReminders(),
        fetchInventoryData()
      ]);

      const remindersSuccess = results[0].status === 'fulfilled' && results[0].value;
      const inventorySuccess = results[1].status === 'fulfilled' && results[1].value;

      if (!remindersSuccess && !inventorySuccess) {
        Alert.alert('Refresh Failed', 'Could not refresh data. Please check your connection.');
      } else if (!remindersSuccess) {
        Alert.alert('Partial Refresh', 'Inventory updated, but failed to refresh reminders.');
      } else if (!inventorySuccess) {
        Alert.alert('Partial Refresh', 'Reminders updated, but failed to refresh inventory.');
      }

    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while refreshing data.');
    } finally {
      setRefreshing(false);
    }
  }, [fetchReminders, fetchInventoryData]); // Add dependencies

  // --- Initial Data Load ---
  useEffect(() => {
    const initializeData = async () => {
      setRefreshing(true);
      await Promise.allSettled([fetchReminders(), fetchInventoryData()]);
      setRefreshing(false);
    };
    initializeData();
  }, [fetchReminders, fetchInventoryData]); // Add dependencies

  // --- Event Handlers (Console logs removed) ---
  const handleTickClick = useCallback((reminder) => { // Use useCallback
    setSelectedReminder(reminder);
    const incompleteTimes = reminder.times.filter(
      (timeObj) => !(timeObj.completed && timeObj.completed[today])
    );
    if (incompleteTimes.length > 0) {
      setModalVisible(true); // Show modal
    } else {
      Alert.alert('Info', 'All doses for today have been marked as completed.');
    }
  }, [today]); // Add dependency

  const handleRemoveTime = useCallback(async (time) => { // Use useCallback
    if (!selectedReminder) return;

    const reminderId = selectedReminder._id;
    const timeToRemove = time.time;

    // Optimistic UI Update
    setReminders((prevReminders) =>
      prevReminders.map((r) =>
        r._id === reminderId
          ? {
              ...r,
              times: r.times.map((t) =>
                t.time === timeToRemove
                  ? { ...t, completed: { ...(t.completed || {}), [today]: true } }
                  : t
              ),
            }
          : r
      )
    );
    setModalVisible(false); // Close modal immediately

    try {
      // Cancel the corresponding notification
      const notificationId = `${selectedReminder.name.replace(/\s+/g, '_')}_${timeToRemove}`;
      await notifee.cancelNotification(notificationId);

      // Update backend
      const response = await fetch(`http://10.0.2.2:5000/reminders/${reminderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time: timeToRemove,
          days: today,
        }),
      });

      if (!response.ok) {
        // Revert UI if backend update fails
        setReminders((prevReminders) =>
          prevReminders.map((r) =>
            r._id === reminderId
              ? {
                  ...r,
                  times: r.times.map((t) =>
                    t.time === timeToRemove
                      ? { ...t, completed: { ...(t.completed || {}), [today]: false } } // Revert completed status
                      : t
                  ),
                }
              : r
          )
        );
        // Show modal again if revert happens? Optional, depends on desired UX.
        // setModalVisible(true);
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to mark the reminder as completed.');
      }
      // No need to update state again on success, already done optimistically

    } catch (error) {
      // Revert UI on network or other errors
       setReminders((prevReminders) =>
          prevReminders.map((r) =>
            r._id === reminderId
              ? {
                  ...r,
                  times: r.times.map((t) =>
                    t.time === timeToRemove
                      ? { ...t, completed: { ...(t.completed || {}), [today]: false } }
                      : t
                  ),
                }
              : r
          )
        );
      // Show modal again if revert happens? Optional.
      // setModalVisible(true);
      Alert.alert('Error', 'An error occurred while updating the reminder.');
    }
  }, [selectedReminder, today]); // Add dependencies

  const handleAddMedication = useCallback(() => { // Use useCallback
    navigation.navigate('NewReminder');
  }, [navigation]);

  const handleNavigateInventory = useCallback(() => { // Use useCallback
     navigation.navigate('Inventory');
  }, [navigation]);


  // --- Helper Functions (memoized with useCallback or useMemo where appropriate) ---
  const isPastDue = useCallback((timeString) => {
    const [hour, minute] = timeString.split(':');
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
    return reminderTime < new Date();
  }, []);

  const getStatusColor = useCallback((timeObj) => {
    if (timeObj.completed && timeObj.completed[today]) return '#4CAF50'; // Green
    if (isPastDue(timeObj.time)) return '#FF6B6B'; // Red
    return '#4A90E2'; // Blue
  }, [today, isPastDue]);

  const getStatusIcon = useCallback((timeObj) => {
    if (timeObj.completed && timeObj.completed[today]) return 'check-circle';
    if (isPastDue(timeObj.time)) return 'clock-alert-outline';
    return 'clock-outline';
  }, [today, isPastDue]);

  // useMemo is now correctly imported
  const getFormattedDate = useMemo(() => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }, []);

  const getStockAlertStyle = useCallback((inStock) => { // Use useCallback
    if (inStock <= 2) {
      return { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', textColor: '#DC2626', iconColor: '#DC2626' };
    } else { // Assumes < 5 is low stock based on filter logic
      return { backgroundColor: '#FEF3C7', borderColor: '#FCD34D', textColor: '#D97706', iconColor: '#D97706' };
    }
  }, []);

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
            colors={['#4A90E2']}
            tintColor={'#4A90E2'}
          />
        }
        scrollEventThrottle={16} // Important for scroll-based animations if added later
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
                  colors={['#4A90E2', '#5C6BC0']}
                  style={styles.headerAddButtonGradient}
                >
                  <Icon name="plus" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* --- Main Content: Reminders --- */}
        {/* No extra Animated.View needed here as children have entering animations */}
        <View style={styles.contentContainer}>
            <View style={styles.remindersSection}>
            <Animated.View entering={FadeIn.delay(100).duration(400)}>
                <View style={styles.reminderHeader}>
                    <View style={styles.headerRow}>
                        <Icon name="pill" size={22} color="#4A90E2" />
                        <Text style={styles.sectionTitle}>Today's Medications</Text>
                    </View>
                    <TouchableOpacity onPress={refreshHandler} disabled={refreshing}>
                        <Icon name="refresh" size={22} color="#4A90E2" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <View style={styles.scrollViewWrapper}>
                {reminders.length === 0 && !refreshing ? (
                    <Animated.View entering={FadeInUp.duration(500)} style={styles.emptyStateContainer}>
                        <Icon name="medical-bag" size={48} color="#CBD5E0" />
                        <Text style={styles.emptyStateText}>No medications scheduled for today</Text>
                    </Animated.View>
                ) : (
                    reminders.map((item, index) => (
                        // Use the AnimatedReminderCard component
                        <AnimatedReminderCard
                            key={item._id || index} // Use stable key
                            item={item}
                            index={index}
                            onTickClick={handleTickClick}
                            today={today}
                            getStatusIcon={getStatusIcon}
                            getStatusColor={getStatusColor}
                            isPastDue={isPastDue}
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
            onPress={handleNavigateInventory} // Use handler
          >
            <Text style={styles.seeAllButtonText}>View All</Text>
            <Icon name="chevron-right" size={18} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        <View style={styles.inventoryContainer}>
          {lowStockItems.length === 0 ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.noAlertsContainer}>
              <Icon name="check-circle" size={32} color="#4CAF50" />
              <Text style={styles.noAlertsText}>All items are well stocked</Text>
            </Animated.View>
          ) : (
            <View style={styles.cardsRow}>
              {lowStockItems.slice(0, 2).map((item, index) => (
                  // Use the AnimatedInventoryCard component
                  <AnimatedInventoryCard
                    key={item._id || index} // Use stable key
                    item={item}
                    index={index}
                    alertStyle={getStockAlertStyle(item.inStock)}
                    onPress={handleNavigateInventory} // Use handler
                  />
              ))}
            </View>
          )}
        </View>
      </Animated.View>

      {/* --- Modal (Using standard Modal, animating content inside) --- */}
      <Modal
        animationType="fade" // Standard fade for backdrop
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Animate the modal content appearance */}
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
            <ScrollView>
                {selectedReminder?.times
                .filter((timeObj) => !(timeObj.completed && timeObj.completed[today]))
                .map((timeObj, index) => (
                    <TouchableOpacity
                    key={`${selectedReminder._id}-modal-${timeObj.time}-${index}`} // More specific key for modal items
                    onPress={() => handleRemoveTime(timeObj)} // Use handler
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Add padding for iOS home indicator
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#EDF2FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 5,
    elevation: 6, // Slightly increased elevation
    minHeight: 180,
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
