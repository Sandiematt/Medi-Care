import React from 'react';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screens/HomeScreen/HomeScreen';
import ReminderScreen from '../Screens/Reminder/ReminderScreen';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons
import PillIdentifierScreen from '../Screens/Medicine/PillIdentifierScreen';
import MyTabBar from './TabBar'; // Import custom TabBar
import { RouteProp } from '@react-navigation/native'; // ParamListBase is not needed here

// Define your TabParamList, including potential params for Home screen
export type RootTabParamList = { // Exporting for use in other files if needed
  Home: { hideTabBar?: boolean };
  Medicine: undefined;
  Reminders: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>(); // Use the RootTabParamList here

// This type is for Tab.Screen options
// type TabBarVisibilityOptions = {  // This local type isn't strictly needed anymore
//   tabBarVisible?: boolean;
// };

const BottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <MyTabBar {...props} />}
      screenOptions={({ route }: { route: RouteProp<RootTabParamList, keyof RootTabParamList> }) => {
        // Base options that are standard
        const baseOptions: BottomTabNavigationOptions = {
          tabBarIcon: ({ color, size }) => { // focused removed as it was unused by Icon
            let iconName = '';
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Reminders') {
              iconName = 'notifications';
            } else if (route.name === 'Medicine') {
              iconName = 'medication';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#199A8E',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        };

        // Add our custom tabBarVisible property for MyTabBar to consume
        // This is an extension to the standard options, specific to our custom tab bar implementation.
        let customOptions: any = { ...baseOptions }; // Start with base, allow adding custom props

        if (route.name === 'Home') {
          customOptions.tabBarVisible = route.params?.hideTabBar ? false : true;
        } else {
          // For other screens, default to true unless they have their own params (not implemented here)
          customOptions.tabBarVisible = true; 
        }
        return customOptions; // MyTabBar will receive this entire object as `options`
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} initialParams={{ hideTabBar: false }} />
      <Tab.Screen name="Medicine" component={PillIdentifierScreen} />
      <Tab.Screen name="Reminders" component={ReminderScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
