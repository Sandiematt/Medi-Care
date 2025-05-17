import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SignUpProps, FocusState } from './data-access/interfaces/Signup.interface';
import { SignupStyles } from './data-access/helpers/Signup.styles';
import { FloatingLabelInput, GenderPicker } from './components/SignupInputComponent';
import { handleSignUp, handleFocus, handleBlur, animateLabel } from './data-access/helpers/Signup.helpers';

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isFocused, setIsFocused] = useState<FocusState>({
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
    if (username) animateLabel('username', 1, labelAnimations);
    if (email) animateLabel('email', 1, labelAnimations);
    if (contact) animateLabel('contact', 1, labelAnimations);
    if (age) animateLabel('age', 1, labelAnimations);
    if (gender) animateLabel('gender', 1, labelAnimations);
    if (password) animateLabel('password', 1, labelAnimations);
    if (confirmPassword) animateLabel('confirmPassword', 1, labelAnimations);
  }, []);

  return (
    <SafeAreaView style={SignupStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={SignupStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          bounces={false} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={SignupStyles.scrollContent}
        >
          <View style={SignupStyles.header}>
            <Text style={SignupStyles.title}>Create Account</Text>
            <Text style={SignupStyles.subtitle}>Join our community today</Text>
          </View>

          <View style={SignupStyles.formContainer}>
            <FloatingLabelInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              iconName="person-outline"
              field="username"
              isFocused={isFocused.username}
              handleFocus={() => handleFocus('username', setIsFocused, labelAnimations)}
              handleBlur={() => handleBlur('username', username, setIsFocused, labelAnimations)}
              labelAnimation={labelAnimations}
            />

            <FloatingLabelInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              iconName="mail-outline"
              keyboardType="email-address"
              field="email"
              isFocused={isFocused.email}
              handleFocus={() => handleFocus('email', setIsFocused, labelAnimations)}
              handleBlur={() => handleBlur('email', email, setIsFocused, labelAnimations)}
              labelAnimation={labelAnimations}
            />

            <FloatingLabelInput
              label="Contact"
              value={contact}
              onChangeText={setContact}
              iconName="call-outline"
              keyboardType="phone-pad"
              field="contact"
              isFocused={isFocused.contact}
              handleFocus={() => handleFocus('contact', setIsFocused, labelAnimations)}
              handleBlur={() => handleBlur('contact', contact, setIsFocused, labelAnimations)}
              labelAnimation={labelAnimations}
            />

            <FloatingLabelInput
              label="Age"
              value={age}
              onChangeText={setAge}
              iconName="calendar-outline"
              keyboardType="numeric"
              field="age"
              isFocused={isFocused.age}
              handleFocus={() => handleFocus('age', setIsFocused, labelAnimations)}
              handleBlur={() => handleBlur('age', age, setIsFocused, labelAnimations)}
              labelAnimation={labelAnimations}
            />

            <GenderPicker
              value={gender}
              onSelect={setGender}
              isFocused={isFocused.gender}
              handleFocus={() => handleFocus('gender', setIsFocused, labelAnimations)}
              labelAnimation={labelAnimations}
            />

            <FloatingLabelInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              iconName="lock-closed-outline"
              secureTextEntry={true}
              field="password"
              isFocused={isFocused.password}
              handleFocus={() => handleFocus('password', setIsFocused, labelAnimations)}
              handleBlur={() => handleBlur('password', password, setIsFocused, labelAnimations)}
              labelAnimation={labelAnimations}
            />

            <FloatingLabelInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              iconName="lock-closed-outline"
              secureTextEntry={true}
              field="confirmPassword"
              isFocused={isFocused.confirmPassword}
              handleFocus={() => handleFocus('confirmPassword', setIsFocused, labelAnimations)}
              handleBlur={() => handleBlur('confirmPassword', confirmPassword, setIsFocused, labelAnimations)}
              labelAnimation={labelAnimations}
            />

            {error ? <Text style={SignupStyles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
              style={SignupStyles.signupButton} 
              onPress={() => handleSignUp(
                username, 
                email, 
                contact, 
                age, 
                gender, 
                password, 
                confirmPassword, 
                setError, 
                navigation
              )} 
              activeOpacity={0.7}
            >
              <Text style={SignupStyles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <View style={SignupStyles.loginContainer}>
              <Text style={SignupStyles.loginText}>
                Already have an account?{' '}
                <Text
                  style={SignupStyles.loginLink}
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

export default SignUp;