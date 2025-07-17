import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text } from "react-native";
import SplashScreen from "./SplashScreen";
import SignUp from "../components/Login/Signup";
import Login from "../components/Login/Login";
import BottomTabs from "./BottomTabs";

const Stack = createStackNavigator();

// Create a simple fallback splash screen
const FallbackSplash = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1d958b' }}>
      <Text style={{ color: 'white', fontSize: 24 }}>Loading...</Text>
    </View>
  );
};

const StackNavigator = () => {
  

  useEffect(() => {
    console.log("StackNavigator mounted");
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen || FallbackSplash} 
        options={{ gestureEnabled: false }} 
      />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Main" component={BottomTabs} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
