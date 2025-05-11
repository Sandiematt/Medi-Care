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
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Hide the tab bar on the login screen
  useEffect(() => {
    // Set tab bar visibility to false for this screen
    navigation.setOptions({
      tabBarVisible: false,
    });
  }, [navigation]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and Password are required.");
      return;
    }

    try {
      const response = await axios.post("http://10.0.2.2:5000/login", {
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
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
            </View>
          </View>
        </ScrollView>
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
  header: {
    backgroundColor: '#1d958b',
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 80,
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
    width: 170,
    height: 170,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
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
  },
  input: {
    flex: 1,
    fontSize: 16,
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
    paddingVertical: 16,
    marginTop: 32,
    marginBottom: 16,
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
    textAlign: 'center',
  },
  signupContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    color: '#718096',
  },
  signupLink: {
    color: '#199A8E',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
});

export default Login;
