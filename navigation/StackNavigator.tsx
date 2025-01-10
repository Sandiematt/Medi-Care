import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import SignUp from '../components/Login/Signup'; // Adjust path as needed
import Login from '../components/Login/Login';   // Adjust path as needed
import BottomTabs from './BottomTabs';          // Main screen after login

const Stack = createStackNavigator();

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Login">
        {(props) => (
          <Login
            {...props}
            onLoginSuccess={() => {
              props.navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                })
              );
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
