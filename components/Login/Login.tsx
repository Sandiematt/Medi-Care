import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginProps {
  navigation: any;
  onLoginSuccess: () => void;
}

interface User {
  username: string;
  isAdmin: boolean;
}

const Login: React.FC<LoginProps> = ({ navigation, onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username and Password are required.');
      return;
    }

    try {
      const response = await axios.post('http://10.0.2.2:5000/login', { username, password });
      const user: User = response.data;

      if (user.username) {
        await AsyncStorage.setItem('username', user.username);
      }

      onLoginSuccess();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password');
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    iconName: string,
    placeholder: string,
    isPassword: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={20} color="#5856D6" />
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, isPassword && { paddingRight: 40 }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#A0A0A0"
            secureTextEntry={isPassword && !isPasswordVisible}
            autoCapitalize="none"
          />
          {isPassword && (
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Icon 
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#5856D6" 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

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
                source={require('../../assets/images/logo.png')} 
                style={styles.logo}
              />
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {renderInput(
              'Username',
              username,
              setUsername,
              'person-outline',
              'Enter your username'
            )}

            {renderInput(
              'Password',
              password,
              setPassword,
              'lock-closed-outline',
              'Enter your password',
              true
            )}

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
    backgroundColor: '#5856D6',
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
    width: 120,
    height: 120,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  inputWrapper: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#5856D6',
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    padding: 0,
    height: 24,
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  loginButton: {
    backgroundColor: '#5856D6',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 32,
    marginBottom: 16,
    shadowColor: '#5856D6',
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
    color: '#5856D6',
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