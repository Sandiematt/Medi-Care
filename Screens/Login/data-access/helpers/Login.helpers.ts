import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { Animated } from "react-native";
import { API_BASE_URL } from "@env";

export const handleLogin = async (username: string, password: string, setError: (error: string) => void, navigation: any) => {
    if (!username || !password) {
      setError("Username and Password are required.");
      return;
    }

    try {
      console.log(`Attempting login to: ${API_BASE_URL}/login`);
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password,
      });

      console.log("Login response:", response.status, response.statusText);
      const user = response.data;
      console.log("User data received:", user);

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
    } catch (err: any) {
      console.error("Login error:", err.message);
      if (err.response) {
        console.error("Error response:", err.response.status, err.response.data);
      }
      setError("Invalid username or password");
    }
  };

 export const handleGoogleSignIn = async (setError: (error: string) => void, navigation: any) => {
    try {
      // Clear any previous errors
      setError('');
      
      console.log("Starting Google Sign In process");
      // Check if Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Perform the sign in
      console.log("Requesting Google sign in");
      const userInfo = await GoogleSignin.signIn();
      console.log("Google sign in successful, data received");
      
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
      console.log("Retrieved email from Google response:", email ? "Found" : "Not found");
      
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
        console.log(`Sending Google authentication data to: ${API_BASE_URL}/google-login`);
        const response = await axios.post(`${API_BASE_URL}/google-login`, {
          email,
          googleId,
          displayName
        });
        
        console.log("Google auth response:", response.status, response.statusText);
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
      } catch (backendError: any) {
        console.error("Google login backend error:", backendError.message);
        if (backendError.response) {
          console.error("Error response:", backendError.response.status, backendError.response.data);
        }
        setError('Failed to authenticate with the server. Please try again.');
      }
    } catch (error: any) {
      console.error("Google Sign In error:", error.code, error.message);
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

  export const handleFocus = (setIsFocused: (isFocused: boolean) => void, animatedValue: Animated.Value, value: string) => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  export const handleBlur = (setIsFocused: (isFocused: boolean) => void, animatedValue: Animated.Value, value: string) => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  export const labelStyle = (animatedValue: Animated.Value) => {
    return {
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
}
