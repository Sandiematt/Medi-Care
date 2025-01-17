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
  Animated, 
  Image 
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons'; 
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
  const [isNameFocused, setIsNameFocused] = useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const nameLabelAnim = useRef(new Animated.Value(0)).current;
  const passwordLabelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(nameLabelAnim, {
      toValue: isNameFocused || username !== '' ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isNameFocused, username]);

  useEffect(() => {
    Animated.timing(passwordLabelAnim, {
      toValue: isPasswordFocused || password !== '' ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isPasswordFocused, password]);

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
      } else {
        console.error('Username not found in response');
      }
  
      // Call the callback to notify that login was successful
      onLoginSuccess();
  
      // Reset the navigation stack and navigate to 'Main' screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
  
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    }
  };
  

  const gotoRegister = () => {
    navigation.navigate('SignUp');
  };

  const labelStyle = (labelAnim: Animated.Value) => ({
    position: 'absolute' as 'absolute',
    left: 15,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [12, -25],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 12],
    }),
    color: '#24BAAC',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerrContainer}>
            {/* Logo Section */}
            <View style={styles.logoBackground}>
              <View style={styles.logoContainer}>
                <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
              </View>
            </View>
          </View>

          <View style={styles.innerContainer}>
            {/* Header Section */}
            <View style={styles.header}>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>Welcome To MediCare !</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Animated.Text style={labelStyle(nameLabelAnim)}>Username</Animated.Text>
                  <TextInput
                    autoCapitalize='none'
                    autoCorrect={false}
                    style={styles.inputText}
                    placeholder={isNameFocused || username !== '' ? '' : 'Username'}
                    placeholderTextColor="#003f5c"
                    onFocus={() => setIsNameFocused(true)}
                    onBlur={() => setIsNameFocused(false)}
                    onChangeText={setUsername}
                  />
                  <View style={styles.iconContainer}>
                    <Icon name="person" size={24} color="#24BAAC" />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Animated.Text style={labelStyle(passwordLabelAnim)}>Password</Animated.Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      secureTextEntry={!isPasswordVisible}
                      style={styles.inputText}
                      placeholder={isPasswordFocused || password !== '' ? '' : 'Password'}
                      placeholderTextColor="#003f5c"
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIconContainer}>
                      <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#24BAAC" />
                    </TouchableOpacity>
                  </View>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity onPress={handleLogin}>
                  <View style={styles.btn}>
                    <Text style={styles.btnText}>Login</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.regBtn}>
              <Text style={styles.hehe}>Don't have an account?  <Text style={styles.regText} onPress={gotoRegister}>Sign Up</Text></Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    position: 'static',
  },
  innerContainer: {
    flex: 1,
    padding: 24,
  },
  innerrContainer: {
    flex: 1,
  },
  logoBackground: {
    width: '100%',
    height: 240,
    backgroundColor: '#24BAAC',
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 160,
    height: 160,
    top:20,
  },
  appTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#24BAAC',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 27,
    color: 'black',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    textAlign: 'center',
    color: 'gray',
    fontFamily: 'Poppins-SemiBold',
  },
  formContainer: {
    flex: 1,
    top: 30,
  },
  form: {
    marginBottom: 50,
  },
  inputContainer: {
    marginBottom: 35,
  },
  inputText: {
    backgroundColor: '#ebecf4',
    height: 45,
    paddingHorizontal: 15,
    borderRadius: 12,
    fontSize: 15,
    fontFamily: 'Poppins-Normal',
    color: '#222',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 15,
    top: 10,
  },
  iconContainer: {
    position: 'absolute',
    right: 15,
    top: 10,
    zIndex: 1,
  },  
  btn: {
    backgroundColor: '#24BAAC',
    borderRadius: 50,
    alignSelf: 'center',
    paddingVertical: 10,
    width: 150,
    marginTop: 20,
  },
  btnText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    top: 2,
  },
  regBtn: {
    alignItems: 'center',
    marginBottom: 24,
  },
  regText: {
    fontSize: 15,
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-Bold',
  },
  hehe: {
    fontFamily: 'Poppins-Normal',
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
});

export default Login;
