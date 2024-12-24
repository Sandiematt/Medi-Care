import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../components/HomeScreen/HomeScreen';
import ProfileScreen from '../components/Profile/ProfileScreen';
import ReminderScreen from '../components/Reminder/ReminderScreen';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons
import PillIdentifierScreen from '../components/Medicine/PillIdentifierScreen';

const Tab = createBottomTabNavigator();

const BottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          // Assign icons based on the route name
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Reminders') {
            iconName = 'notifications';
          } else if (route.name === 'Medicine') {
            iconName = 'medication';
          }

          return <Icon name={iconName!} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#199A8E',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#FFFFFF' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Medicine" component={PillIdentifierScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Reminders" component={ReminderScreen}options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
};

export default BottomTabs;
