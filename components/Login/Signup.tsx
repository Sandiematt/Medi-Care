import React, { useState, useEffect } from 'react';
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
  Animated,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const [showGenderModal, setShowGenderModal] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState({
    username: false,
    email: false,
    contact: false,
    age: false,
    gender: false,
    password: false,
    confirmPassword: false,
  });

  const [labelAnimations] = useState({
    username: new Animated.Value(0),
    email: new Animated.Value(0),
    contact: new Animated.Value(0),
    age: new Animated.Value(0),
    gender: new Animated.Value(0),
    password: new Animated.Value(0),
    confirmPassword: new Animated.Value(0),
  });

  // Initialize animations for fields with existing values
  useEffect(() => {
    if (username) animateLabel('username', 1);
    if (email) animateLabel('email', 1);
    if (contact) animateLabel('contact', 1);
    if (age) animateLabel('age', 1);
    if (gender) animateLabel('gender', 1);
    if (password) animateLabel('password', 1);
    if (confirmPassword) animateLabel('confirmPassword', 1);
  }, []);

  const animateLabel = (field: string, toValue: number) => {
    Animated.timing(labelAnimations[field], {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!email || !password || !username || !contact || !age || !gender) {
      setError('Please fill in all fields');
      return;
    }

    if (isNaN(Number(age)) || Number(age) <= 0) {
      setError('Please enter a valid age');
      return;
    }

    try {
      const response = await fetch('http://20.193.156.237:500/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          contact,
          age,
          gender,
          password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.message === 'User registered successfully') {
        navigation.navigate('Login');
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
    secureTextEntry?: boolean,
    keyboardType?: any,
    field: keyof typeof isFocused
  ) => {
    const labelStyle = {
      transform: [{
        translateY: labelAnimations[field].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      }],
      fontSize: labelAnimations[field].interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),
      color: labelAnimations[field].interpolate({
        inputRange: [0, 1],
        outputRange: ['#A0A0A0', '#199A8E'],
      }),
    };

    const underlineStyle = {
      backgroundColor: labelAnimations[field].interpolate({
        inputRange: [0, 1],
        outputRange: ['#E2E8F0', '#199A8E'],
      }),
    };

    return (
      <View style={styles.inputContainer}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={20} color="#199A8E" />
        </View>
        <View style={styles.inputWrapper}>
          <View style={styles.labelContainer}>
            <Animated.Text style={[styles.floatingLabel, labelStyle]}>
              {label}
            </Animated.Text>
          </View>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize="none"
            onFocus={() => {
              setIsFocused({ ...isFocused, [field]: true });
              animateLabel(field, 1);
            }}
            onBlur={() => {
              setIsFocused({ ...isFocused, [field]: false });
              if (!value) {
                animateLabel(field, 0);
              }
            }}
          />
          <Animated.View style={[styles.inputUnderline, underlineStyle]} />
        </View>
      </View>
    );
  };

  const renderGenderPicker = () => {
    const labelStyle = {
      transform: [{
        translateY: labelAnimations['gender'].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      }],
      fontSize: labelAnimations['gender'].interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),
      color: labelAnimations['gender'].interpolate({
        inputRange: [0, 1],
        outputRange: ['#A0A0A0', '#199A8E'],
      }),
    };

    const underlineStyle = {
      backgroundColor: labelAnimations['gender'].interpolate({
        inputRange: [0, 1],
        outputRange: ['#E2E8F0', '#199A8E'],
      }),
    };

    return (
      <View style={styles.inputContainer}>
        <View style={styles.iconContainer}>
          <Icon name="people-outline" size={20} color="#199A8E" />
        </View>
        <View style={styles.inputWrapper}>
          <View style={styles.labelContainer1}>
            <Animated.Text style={[styles.floatingLabel, labelStyle]}>
              Gender
            </Animated.Text>
          </View>
          
          {/* Custom picker touchable - covers the entire input area */}
          <TouchableOpacity
            style={styles.customPickerButton}
            onPress={() => {
              setShowGenderModal(true);
              setIsFocused({ ...isFocused, gender: true });
              animateLabel('gender', 1);
            }}
          >
            <Text style={[
              styles.customPickerText,
              !gender && { color: '#A0A0A0' }
            ]}>
              {gender || "Select Gender"}
            </Text>
            <Icon name="chevron-down-outline" size={16} color="#1A1A1A" />
          </TouchableOpacity>
          
          <Animated.View style={[styles.inputUnderline, underlineStyle]} />
        </View>
      </View>
    );
  };

  // Render gender modal separately to avoid rendering issues
  const renderGenderModal = () => (
    <Modal
      visible={showGenderModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowGenderModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowGenderModal(false)}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
              setGender('Male');
              setShowGenderModal(false);
            }}
          >
            <Text style={[styles.modalItemText, gender === 'Male' && styles.selectedItemText]}>Male</Text>
          </TouchableOpacity>
          <View style={styles.modalDivider} />
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
              setGender('Female');
              setShowGenderModal(false);
            }}
          >
            <Text style={[styles.modalItemText, gender === 'Female' && styles.selectedItemText]}>Female</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          bounces={false} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
              false,
              undefined,
              'username'
            )}
            {renderInput(
              'Email',
              email,
              setEmail,
              'mail-outline',
              false,
              'email-address',
              'email'
            )}
            {renderInput(
              'Contact',
              contact,
              setContact,
              'call-outline',
              false,
              'phone-pad',
              'contact'
            )}
            {renderInput(
              'Age',
              age,
              setAge,
              'calendar-outline',
              false,
              'numeric',
              'age'
            )}

            {renderGenderPicker()}
            {renderGenderModal()}

            {renderInput(
              'Password',
              password,
              setPassword,
              'lock-closed-outline',
              true,
              undefined,
              'password'
            )}
            {renderInput(
              'Confirm Password',
              confirmPassword,
              setConfirmPassword,
              'lock-closed-outline',
              true,
              undefined,
              'confirmPassword'
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text
                  style={styles.loginLink}
                  onPress={() => navigation.navigate('Login')}
                >
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
  scrollContent: {
    flexGrow: 1,
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
    paddingBottom: 40, // Increased to provide more space at the bottom
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    height: 56,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    justifyContent: 'center',
    pointerEvents: 'none', // This prevents the label from capturing touches
  },
  labelContainer1: {
    position: 'absolute',
    bottom:10,
    left: 0,
    right: 0,
    height: 56,
    justifyContent: 'center',
    pointerEvents: 'none', // This prevents the label from capturing touches
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 0,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#1A1A1A',
    padding: 0,
    height: 24,
    marginTop: 16,
    zIndex: 2,
  },
  inputUnderline: {
    height: 1,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  customPickerButton: {
    height: 40,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
    zIndex: 3, // Ensure this is above other elements
  },
  customPickerText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  modalItemText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  selectedItemText: {
    color: '#199A8E',
    fontWeight: 'bold',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
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