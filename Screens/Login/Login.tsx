import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginProps } from './data-access/interfaces/Login.interface';
import { FloatingLabelInput } from './components/LoginInputComponent';
import { handleGoogleSignIn, handleLogin } from './data-access/helpers/Login.helpers';
import { LoginStyles } from './data-access/helpers/Login.styles';
import { WEB_CLIENT_ID, API_BASE_URL } from '@env';

const Login: React.FC<LoginProps> = ({ navigation, onLoginSuccess: _onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  // Configure Google Sign-In
  useEffect(() => {
    // Debug environment variables
    console.log('Environment variables:');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('WEB_CLIENT_ID:', WEB_CLIENT_ID);
    
    // Set up Google Sign-In with the configuration matching your Firebase console
    GoogleSignin.configure({
      // Use the web client ID from firebase console (client_type: 3)
      webClientId: WEB_CLIENT_ID,
      // This line ensures we get the user's email
      scopes: ['email', 'profile'],
      // Force account selection each time
      forceCodeForRefreshToken: true,
      offlineAccess: true
    });
    
    // Hide the tab bar on the login screen
    navigation.setOptions({
      tabBarVisible: false,
    });

    // Check if user is already signed in and sign out
    const checkSignIn = async () => {
      try {
        const isSignedIn = await GoogleSignin.signInSilently();
        if (isSignedIn) {
          await GoogleSignin.signOut();
        }
      } catch (error) {
        // Silently handle error
      }
    };
    checkSignIn();
  }, [navigation]);

  return (
    <SafeAreaView style={LoginStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={LoginStyles.keyboardView}
      >
        <View style={LoginStyles.contentContainer}>
          <View style={LoginStyles.header}>
            <View style={LoginStyles.logoContainer}>
              <Image
                source={require('../../assets/images/logo.jpg')}
                style={LoginStyles.logo}
              />
            </View>
          </View>

          <View style={LoginStyles.formContainer}>
            <Text style={LoginStyles.title}>Welcome Back!</Text>
            <Text style={LoginStyles.subtitle}>Sign in to continue</Text>

            <FloatingLabelInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              iconName="person-outline"
            />

            <FloatingLabelInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              iconName="lock-closed-outline"
              secureTextEntry={!isPasswordVisible}
              isPasswordInput
              isPasswordVisible={isPasswordVisible}
              onTogglePasswordVisibility={() =>
                setIsPasswordVisible(!isPasswordVisible)
              }
            />

            {error ? <Text style={LoginStyles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
              style={LoginStyles.loginButton} 
              activeOpacity={0.7} 
              onPress={() => handleLogin(username, password, setError, navigation)}
            >
              <Text style={LoginStyles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={LoginStyles.signupContainer}>
              <Text style={LoginStyles.signupText}>
                Don't have an account?{' '}
                <Text
                  style={LoginStyles.signupLink}
                  onPress={() => navigation.navigate('SignUp')}
                >
                  Sign Up
                </Text>
              </Text>
              
              <View style={LoginStyles.separatorContainer}>
                <View style={LoginStyles.separator} />
                <Text style={LoginStyles.separatorText}>or</Text>
                <View style={LoginStyles.separator} />
              </View>
              
              <TouchableOpacity style={LoginStyles.googleSignupButton} onPress={() => handleGoogleSignIn(setError, navigation)} activeOpacity={0.7}>
                <Icon name="logo-google" size={24} color="#DB4437" style={LoginStyles.googleIcon} />
                <Text style={LoginStyles.googleSignupLink}>
                  Sign up using Google
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
