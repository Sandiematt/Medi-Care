import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../components/HomeScreen';
import ProfileScreen from '../components/ProfileScreen';
import NotificationsScreen from '../components/NotificationsScreen';
import SettingsScreen from '../components/settings';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons

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
          } else if (route.name === 'Notifications') {
            iconName = 'notifications';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName!} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#FFFFFF' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
