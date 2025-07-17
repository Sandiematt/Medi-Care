import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text } from "react-native";
import SplashScreen from "./SplashScreen";
import SignUp from "../Screens/SignUp/Signup";
import Login from "../Screens/Login/Login";
import BottomTabs from "./BottomTabs";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Splash: undefined;
  SignUp: undefined;
  Login: undefined;
  Main: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const Stack = createStackNavigator<RootStackParamList>();

// Create a simple fallback splash screen
const FallbackSplash = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1d958b' }}>
      <Text style={{ color: 'white', fontSize: 24 }}>Loading...</Text>
    </View>
  );
};

// Wrapper for Login component that provides the onLoginSuccess prop
const LoginWrapper = ({ navigation }: { navigation: LoginScreenNavigationProp }) => {
  const handleLoginSuccess = () => {
    navigation.replace('Main');
  };

  return <Login navigation={navigation} onLoginSuccess={handleLoginSuccess} />;
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
      <Stack.Screen name="Login" component={LoginWrapper} />
      <Stack.Screen name="Main" component={BottomTabs} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
