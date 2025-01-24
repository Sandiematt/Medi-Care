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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

interface SignUpProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!email || !password || !username || !contact || !age || !gender) { // Replaced name with username
      setError('Please fill in all fields');
      return;
    }

    if (isNaN(Number(age)) || Number(age) <= 0) {
      setError('Please enter a valid age');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username, // Replaced name with username
          email,
          contact,
          age,
          gender,
          password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.message === 'User registered successfully') {
        navigation.navigate('Login'); // Navigate to Login screen
      } else {
        setError(result.message || 'Sign-up failed');
      }
    } catch (err) {
      setError('An error occurred during sign-up');
      console.error('Sign-up error:', err);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    iconName: string,
    placeholder: string,
    secureTextEntry?: boolean,
    keyboardType?: any
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={20} color="#199A8E" />
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our community today</Text>
          </View>

          <View style={styles.formContainer}>
            {renderInput(
              'Username',
              username,
              setUsername,
              'person-outline',
              'Enter your username'
            )}
            {renderInput(
              'Email',
              email,
              setEmail,
              'mail-outline',
              'Enter your email',
              false,
              'email-address'
            )}
            {renderInput(
              'Contact',
              contact,
              setContact,
              'call-outline',
              'Enter your phone number',
              false,
              'phone-pad'
            )}
            {renderInput(
              'Age',
              age,
              setAge,
              'calendar-outline',
              'Enter your age',
              false,
              'numeric'
            )}

            <View style={styles.pickerOuterContainer}>
              <View style={styles.iconContainer}>
                <Icon name="people-outline" size={20} color="#199A8E" />
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={gender}
                    style={styles.picker}
                    onValueChange={(itemValue) => setGender(itemValue)}
                  >
                    <Picker.Item label="Select Gender" value="" color="#A0A0A0" />
                    <Picker.Item label="Male" value="Male" color="#000000" />
                    <Picker.Item label="Female" value="Female" color="#000000" />
                  </Picker>
                </View>
              </View>
            </View>

            {renderInput(
              'Password',
              password,
              setPassword,
              'lock-closed-outline',
              '••••••••',
              true
            )}
            {renderInput(
              'Confirm Password',
              confirmPassword,
              setConfirmPassword,
              'lock-closed-outline',
              '••••••••',
              true
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                  Login
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
    backgroundColor: '#199A8E',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  label: {
    fontSize: 12,
    color: '#199A8E',
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    fontSize: 16,
    color: '#1A1A1A',
    padding: 0,
    height: 24,
  },
  pickerOuterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  pickerContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 16,
  },
  pickerWrapper: {
    height: 24,
    justifyContent: 'center',
  },
  picker: {
    margin: 0,
    height: 24,
    fontSize: 16,
    color: '#1A1A1A',
  },
  signupButton: {
    backgroundColor: '#199A8E',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
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
  loginContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#718096',
  },
  loginLink: {
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

export default SignUp;