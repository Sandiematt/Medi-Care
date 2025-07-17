import { Animated } from 'react-native';
import { API_BASE_URL } from '@env';
export const animateLabel = (field: string, toValue: number, labelAnimations: any) => {
  Animated.timing(labelAnimations[field], {
    toValue,
    duration: 200,
    useNativeDriver: false,
  }).start();
};

export const handleFocus = (field: string, setIsFocused: (prevState: any) => any, labelAnimations: any) => {
  setIsFocused((prevState: any) => ({ ...prevState, [field]: true }));
  animateLabel(field, 1, labelAnimations);
};

export const handleBlur = (field: string, value: string, setIsFocused: (prevState: any) => any, labelAnimations: any) => {
  setIsFocused((prevState: any) => ({ ...prevState, [field]: false }));
  if (!value) {
    animateLabel(field, 0, labelAnimations);
  }
};

export const getLabelStyle = (field: string, labelAnimations: any) => {
  return {
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
};

export const getUnderlineStyle = (field: string, labelAnimations: any) => {
  return {
    backgroundColor: labelAnimations[field].interpolate({
      inputRange: [0, 1],
      outputRange: ['#E2E8F0', '#199A8E'],
    }),
  };
};

export const handleSignUp = async (
  username: string,
  email: string,
  contact: string,
  age: string,
  gender: string,
  password: string,
  confirmPassword: string,
  setError: (error: string) => void,
  navigation: { navigate: (screen: string) => void }
) => {
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
    const response = await fetch(`${API_BASE_URL}/register`, {
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