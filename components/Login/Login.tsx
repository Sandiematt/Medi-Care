import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

interface LoginProps {
  navigation: any;
  onLoginSuccess: () => void;
}

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName: string;
  secureTextEntry?: boolean;
  isPasswordInput?: boolean;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  iconName,
  secureTextEntry,
  isPasswordInput,
  isPasswordVisible,
  onTogglePasswordVisibility,
}) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: 'absolute' as 'absolute',
    left: 30,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#A0A0A0', '#199A8E'],
    }),
  };

  return (
    <View style={styles.inputContainer}>
      <Animated.Text style={[styles.floatingLabel, labelStyle]}>
        {label}
      </Animated.Text>
      <View style={styles.inputRow}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={20} color={isFocused ? '#199A8E' : '#A0A0A0'} />
        </View>
        <TextInput
          style={[
            styles.input,
            isPasswordInput && { paddingRight: 40 },
            isFocused && styles.inputFocused,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
        {isPasswordInput && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={onTogglePasswordVisibility}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#199A8E"
            />
          </TouchableOpacity>
        )}
      </View>
      <Animated.View
        style={[
          styles.inputUnderline,
          isFocused && styles.inputUnderlineFocused
        ]} 
      />
    </View>
  );
};

const Login: React.FC<LoginProps> = ({ navigation, onLoginSuccess: _onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  // Configure Google Sign-In
  useEffect(() => {
    // Set up Google Sign-In with the configuration matching your Firebase console
    GoogleSignin.configure({
      // Use the web client ID from firebase console (client_type: 3)
      webClientId: '213391549194-58hs3g88b0dtcc15utdal7evg2j4d6fn.apps.googleusercontent.com',
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
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.signOut();
        }
      } catch (error) {
        // Silently handle error
      }
    };
    checkSignIn();
  }, [navigation]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and Password are required.");
      return;
    }

    try {
      const response = await axios.post("http://20.193.156.237:5000/login", {
        username,
        password,
      });

      const user = response.data;

      if (user.username) {
        await AsyncStorage.setItem("username", user.username);
      }

      const onLoginSuccess = navigation.getState()?.routes?.find((route: { name: string; }) => route.name === "Login")?.params?.onLoginSuccess;

      if (onLoginSuccess) {
        onLoginSuccess();
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Clear any previous errors
      setError('');
      
      // Check if Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Perform the sign in
      const userInfo = await GoogleSignin.signIn();
      
      // Recursively search through response for user properties
      const findEmail = (obj: any): string | null => {
        if (!obj) return null;
        
        // Direct check for email
        if (obj.email) return obj.email;
        
        // Check if it's an object and search through its properties
        if (typeof obj === 'object') {
          for (const key in obj) {
            // Skip if property is null or not an object/array
            if (!obj[key] || typeof obj[key] !== 'object') continue;
            
            const foundEmail = findEmail(obj[key]);
            if (foundEmail) return foundEmail;
          }
        }
        
        return null;
      };
      
      // Find user info in the response
      const email = findEmail(userInfo);
      
      if (!email) {
        setError('Failed to get email from Google Sign-In response');
        return;
      }
      
      // Try to extract other user info from the same location
      let name = null;
      let id = null;
      
      // Recursively find the object that contains the email
      const findUserObject = (obj: any): any | null => {
        if (!obj) return null;
        
        // Check if current object has the email
        if (obj.email === email) return obj;
        
        // Check nested objects
        if (typeof obj === 'object') {
          for (const key in obj) {
            if (!obj[key] || typeof obj[key] !== 'object') continue;
            const result = findUserObject(obj[key]);
            if (result) return result;
          }
        }
        
        return null;
      };
      
      const userObj = findUserObject(userInfo);
      
      if (userObj) {
        name = userObj.name || userObj.displayName || userObj.givenName;
        id = userObj.id || userObj.userId || userObj.sub;
      }
      
      try {
        // Ensure we have an identifier even if not perfect
        const googleId = id || 'unknown_id';
        const displayName = name || email.split('@')[0];
        
        // Send Google sign-in data to your MongoDB backend
        const response = await axios.post('http://20.193.156.237:5000/google-login', {
          email,
          googleId,
          displayName
        });
        
        const user = response.data;
        
        // Store the username in AsyncStorage
        if (user.username) {
          await AsyncStorage.setItem('username', user.username);
        }
        
        // Navigate to main screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } catch (backendError) {
        setError('Failed to authenticate with the server. Please try again.');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the sign-in, no need to show an error
        return;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setError('Sign in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services not available or outdated');
      } else if (error.code === 10) {
        // DEVELOPER_ERROR specific handling
        setError('Google Sign-In configuration error. Please check Google API settings.');
      } else {
        setError(`Google Sign-In failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo.jpg')}
                style={styles.logo}
              />
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                Don't have an account?{' '}
                <Text
                  style={styles.signupLink}
                  onPress={() => navigation.navigate('SignUp')}
                >
                  Sign Up
                </Text>
              </Text>
              
              <View style={styles.separatorContainer}>
                <View style={styles.separator} />
                <Text style={styles.separatorText}>or</Text>
                <View style={styles.separator} />
              </View>
              
              <TouchableOpacity style={styles.googleSignupButton} onPress={handleGoogleSignIn}>
                <Icon name="logo-google" size={24} color="#DB4437" style={styles.googleIcon} />
                <Text style={styles.googleSignupLink}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    backgroundColor: '#1d958b',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  logo: {
    width: 150,
    height: 150,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
    height: 60,
    justifyContent: 'flex-end',
  },
  iconContainer: {
    width: 24,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  floatingLabel: {
    position: 'absolute',
    backgroundColor: 'transparent',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1A1A1A',
    padding: 0,
    height: '100%',
  },
  inputFocused: {
    color: '#199A8E',
  },
  inputUnderline: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  inputUnderlineFocused: {
    height: 2,
    backgroundColor: '#199A8E',
  },
  eyeIcon: {
    padding: 8,
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#199A8E',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#199A8E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  signupContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
  },
  signupLink: {
    color: '#199A8E',
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  separatorText: {
    paddingHorizontal: 10,
    color: '#718096',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  googleSignupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleSignupLink: {
    color: '#000000',
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
});

export default Login;
