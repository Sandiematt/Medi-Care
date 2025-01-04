import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, TouchableOpacity, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons

interface SignUpProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!email || !password || !name || !contact) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          contact,
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

  const gotoLogin = () => {
    navigation.navigate('Login'); // Navigate to Login screen
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Create a New Account</Text>
              <Text style={styles.subheader}>Fill in the details below to get started</Text>
            </View>
            <View style={styles.formContainer}>
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    autoCapitalize="words"
                    autoCorrect={false}
                    style={styles.inputText}
                    placeholder="John Doe"
                    placeholderTextColor="#003f5c"
                    onChangeText={(text) => setName(text)}
                  />
                  <Icon name="person-outline" size={20} color="#003f5c" style={styles.icon} />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    style={styles.inputText}
                    placeholder="john.doe@example.com"
                    placeholderTextColor="#003f5c"
                    onChangeText={(text) => setEmail(text)}
                    autoFocus
                  />
                  <Icon name="mail-outline" size={20} color="#003f5c" style={styles.icon} />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Contact</Text>
                  <TextInput
                    keyboardType="phone-pad"
                    style={styles.inputText}
                    placeholder="+91894567890"
                    placeholderTextColor="#003f5c"
                    onChangeText={(text) => setContact(text)}
                  />
                  <Icon name="call-outline" size={20} color="#003f5c" style={styles.icon} />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    secureTextEntry
                    style={styles.inputText}
                    placeholder="•••••••••••••••"
                    placeholderTextColor="#003f5c"
                    onChangeText={(text) => setPassword(text)}
                  />
                  <Icon name="lock-closed-outline" size={20} color="#003f5c" style={styles.icon} />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    secureTextEntry
                    style={styles.inputText}
                    placeholder="•••••••••••••••"
                    placeholderTextColor="#003f5c"
                    onChangeText={(text) => setConfirmPassword(text)}
                  />
                  <Icon name="lock-closed-outline" size={20} color="#003f5c" style={styles.icon} />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <View style={styles.formAction}>
                  <TouchableOpacity onPress={handleSignUp}>
                    <View style={styles.btn}>
                      <Text style={styles.btnText}>Sign Up</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.loginBtn}>
              <Text style={styles.hehe}>Already have an account? <Text style={styles.loginText} onPress={gotoLogin}>Login</Text></Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 5,
  },
  title: {
    fontSize: 25,
    fontFamily: 'Poppins-Bold',
    color: 'black',
    marginBottom: 6,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#003f5c',
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    marginBottom: 0,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#003f5c',
    marginBottom: 8,
  },
  inputText: {
    backgroundColor: '#ebecf4',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Poppins-Normal',
    color: '#222',
  },
  icon: {
    position: 'absolute',
    right: 16,
    top: '65%',
    transform: [{ translateY: -10 }],
  },
  btn: {
    backgroundColor: '#24BAAC',
    borderRadius: 50,
    alignSelf: 'center',
    paddingVertical: 10,
    width: 150,
  },
  formAction: {
    marginVertical: 24,
  },
  btnText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    top: 2,
  },
  loginBtn: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Poppins-Normal',
  },
  hehe: { fontSize: 13, fontFamily: 'Poppins-Normal' },
});

export default SignUp;
