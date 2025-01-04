import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from '../components/Login/Signup';  // Adjust the path to your SignUp screen
import Login from '../components/Login/Login';   // Adjust the path to your Login screen
import BottomTabs from './BottomTabs';  // BottomTabs is the main screen after login

const Stack = createStackNavigator();

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login" // Start with Login screen
      screenOptions={{
        headerShown: false, // Hide header for all screens by default
      }}
    >
      {/* SignUp Screen */}
      <Stack.Screen
        name="SignUp"
        component={SignUp}
      />

      {/* Login Screen */}
      <Stack.Screen name="Login">
        {(props) => (
          <Login
            {...props}
            onLoginSuccess={() => {}}
          />
        )}
      </Stack.Screen>

      {/* Main Screen (BottomTabs) */}
      <Stack.Screen
        name="Main"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
