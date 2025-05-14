import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Easing,
  Modal,
  PermissionsAndroid,
  ScrollView,
  useColorScheme,
  // Linking // Import Linking for opening app settings
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the UserProfile interface
interface UserProfile {
  username: string;
  name: string;
  profilePhoto: string | null;
}

// Define the Message interface
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Helper function to parse and format message text - FIXED
const formatMessageText = (text: string, styles: any) => {
  // Return directly as Text component if no formatting needed
  if (!text || (!text.includes('**') && !text.includes('\n\n'))) {
    return <Text style={[styles.messageText, styles.botMessageText]}>{text}</Text>;
  }

  // Split the text by newlines first to handle paragraphs
  const paragraphs = text.split('\n\n');

  return (
    <>
      {paragraphs.map((paragraph, pIndex) => {
        // For each paragraph, check for ** markers
        const parts = paragraph.split(/(\*\*.*?\*\*)/g);

        return (
          <View key={`p-${pIndex}`} style={{ marginBottom: pIndex < paragraphs.length - 1 ? 10 : 0 }}>
            {parts.map((part, index) => {
              // Check if this part is enclosed in ** markers
              if (part.startsWith('**') && part.endsWith('**')) {
                // Remove the ** markers and apply bold styling
                const content = part.slice(2, -2);
                return (
                  <Text key={`p-${pIndex}-${index}`} style={{
                    fontWeight: 'bold',
                    color: '#AD1457', // Deep pink color for important notes
                    backgroundColor: 'rgba(173, 20, 87, 0.08)', // Very light pink background
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginVertical: 2,
                    lineHeight: 22,
                  }}>
                    {content}
                  </Text>
                );
              }
              // Return regular text
              return part ? <Text key={`p-${pIndex}-${index}`} style={[styles.messageText, styles.botMessageText]}>{part}</Text> : null;
            })}
          </View>
        );
      })}
    </>
  );
};

// Add AnimatedMessageItem component with profile photo support - FIXED
const AnimatedMessageItem: React.FC<{
  item: Message;
  formatTime: (date: Date) => string;
  styles: any; // Consider defining a more specific style type
  userProfile: UserProfile | null;
}> = ({ item, formatTime, styles, userProfile }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0], // Message slides up
  });

  // Handle message text rendering
  const renderMessageContent = () => {
    if (item.isUser) {
      return <Text style={[styles.messageText, styles.userMessageText]}>{item.text}</Text>;
    } else {
      return formatMessageText(item.text, styles);
    }
  };

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={[
        styles.messageRow,
        item.isUser ? styles.userMessageRow : styles.botMessageRow
      ]}>
        {!item.isUser && (
          <Image
            source={{ uri: 'https://img.icons8.com/plasticine/100/medical-doctor.png' }}
            style={styles.avatar}
            onError={(e) => console.log("Failed to load bot avatar in AnimatedItem", e.nativeEvent.error)}
          />
        )}
        <View style={styles.messageContentContainer}>
          <View style={[
            styles.messageBubble,
            item.isUser ? styles.userMessage : styles.botMessage
          ]}>
            {renderMessageContent()}
          </View>
          <Text style={[
            styles.timestamp,
            item.isUser ? styles.userTimestamp : styles.botTimestamp
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        {item.isUser && (
          <Image
            source={{
              uri: userProfile?.profilePhoto || 'https://img.icons8.com/pastel-glyph/64/user-male-circle.png'
            }}
            style={styles.avatar}
            onError={(e) => console.log("Failed to load user avatar in AnimatedItem", e.nativeEvent.error)}
          />
        )}
      </View>
    </Animated.View>
  );
};

// New Attachment Modal Component
const AttachmentModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
  styles: any; // Consider defining a more specific style type
}> = ({ visible, onClose, onCameraPress, onGalleryPress, styles }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={onClose} // Close when tapping outside the modal content
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Attach File</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onCameraPress}>
            <Ionicons name="camera-outline" size={24} color={styles.modalButtonText?.color || "#008080"} style={styles.modalButtonIcon} />
            <Text style={styles.modalButtonText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={onGalleryPress}>
            <Ionicons name="images-outline" size={24} color={styles.modalButtonText?.color || "#008080"} style={styles.modalButtonIcon} />
            <Text style={styles.modalButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalCancelButton]}
            onPress={onClose}
          >
            <Text style={[styles.modalButtonText, styles.modalCancelButtonText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// Add DisclaimerBanner component
const DisclaimerBanner: React.FC<{ styles: any }> = ({ styles }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.disclaimerBanner}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.9}
    >
      <View style={styles.disclaimerHeader}>
        <Ionicons name="alert-circle" size={16} color="#AD1457" style={{ marginRight: 10 }} />
        <Text style={styles.disclaimerTitle}>
          Medical Information Disclaimer
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color="#777"
          style={{ marginLeft: 'auto' }}
        />
      </View>

      {expanded && (
        <Text style={styles.disclaimerText}>
          Information provided is for general knowledge only and not medical advice.
          Always consult a healthcare professional for specific concerns.
        </Text>
      )}
    </TouchableOpacity>
  );
};

// SuggestionChips component
const SuggestionChips: React.FC<{
  onSuggestionPress: (suggestion: string) => void;
  styles: any; // Consider defining a more specific style type
}> = ({ onSuggestionPress, styles }) => {
  const suggestions = [
    "COVID symptoms",
    "Headache remedies",
    "Blood pressure advice",
    "Diabetes management",
    "Allergy medication",
    "Heart health tips",
    "First aid for burns",
    "Prenatal vitamins"
  ];

  return (
    <View style={styles.suggestionContainer}>
      <View style={styles.suggestionTitleContainer}>
        <Ionicons name="medical" size={16} color="#008080" style={{ marginRight: 6 }} />
        <Text style={styles.suggestionTitle}>Ask me about medical topics:</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionScrollContent}
      >
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => onSuggestionPress(suggestion)}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionChipText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const AI_ChatBot: React.FC = () => {
  const navigation = useNavigation();
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your MediCare assistant. I can help you with medical questions, health concerns, medication information, and general wellness advice. You can also share images of medications or symptoms for identification. How can I assist with your health today?",
      isUser: false,
      timestamp: new Date()
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingDots = useRef(new Animated.Value(0)).current;
  const typingAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // IMPORTANT: Replace with your actual API key.
  // It's highly recommended to store API keys securely and not hardcode them in client-side code.
  // Consider using environment variables or a backend service to manage API keys.
  const GEMINI_API_KEY = 'AIzaSyBfD0AG0TcAtVqZfADH1uqT9Qh8Q0VIzX8'; // Replace with your key
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const GEMINI_VISION_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;


  // New state variable to track the last uploaded image
  const [currentImage, setCurrentImage] = useState<{ uri: string, base64: string } | null>(null);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) {
        console.log('No username found in AsyncStorage');
        // Optionally set a default guest profile or handle as an error
        setUserProfile({ username: 'Guest', name: 'Guest User', profilePhoto: null });
        return;
      }

      // Replace with your actual API endpoint
      const response = await fetch(`http://20.193.156.237:5000/api/users/${username}/profile`);
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setUserProfile({
          username: data.username,
          name: data.name || data.username, // Fallback to username if name is not present
          profilePhoto: data.profilePhoto
        });
      } else {
        console.log('Profile fetch unsuccessful:', data.message);
        // Handle case where profile fetch is not successful but API call was okay
        setUserProfile({ username: username, name: username, profilePhoto: null });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set a default or guest profile on error to prevent app crash
      const guestUsername = await AsyncStorage.getItem('username') || 'Guest';
      setUserProfile({ username: guestUsername, name: 'Guest User', profilePhoto: null });
      Alert.alert("Profile Error", "Could not load your profile information.");
    }
  };

  // Hide tab bar on focus, show on blur
  useFocusEffect(
    React.useCallback(() => {
      // Get all parent navigators
      let parent = navigation.getParent();
      
      // Attempt to make tab bar invisible at the component level that renders it
      while (parent) {
        // Set options to completely hide the tab bar
        parent.setOptions({
          tabBarVisible: false,
          tabBarStyle: { display: 'none' },
          tabBarShowLabel: false,
          tabBarIconStyle: { display: 'none' },
          isAIChatScreen: true // Special flag for TabBar component
        });
        parent = parent.getParent();
      }
      console.log('AI_ChatBot: Tab bar completely hidden');

      return () => {
        // Reset all the navigation parents to show tab bar again
        let parentRestore = navigation.getParent();
        while (parentRestore) {
          parentRestore.setOptions({
            tabBarVisible: true,
            tabBarStyle: undefined,
            tabBarShowLabel: true,
            tabBarIconStyle: undefined,
            isAIChatScreen: false // Reset the special flag
          });
          parentRestore = parentRestore.getParent();
        }
        console.log('AI_ChatBot: Tab bar restored');
      };
    }, [navigation])
  );

  // Fetch user profile once on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (isTyping) {
      typingAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(typingDots, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.linear })
        ])
      );
      typingAnimationRef.current.start();
    } else {
      if (typingAnimationRef.current) {
        typingAnimationRef.current.stop();
        typingAnimationRef.current = null;
      }
      typingDots.setValue(0); // Reset animation dots
    }

    return () => {
      if (typingAnimationRef.current) {
        typingAnimationRef.current.stop();
        typingAnimationRef.current = null;
      }
    };
  }, [isTyping, typingDots]);

  useEffect(() => {
    if (messages.length > 0) {
      // Ensure FlatList scrolls to end after messages update
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim().length === 0 && !currentImage) { // Also check for currentImage
        Alert.alert("Empty Message", "Please type a message or attach an image.");
        return;
    }


    const userMessageText = input; // Keep a copy before clearing
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput(''); // Clear input after preparing the message
    Keyboard.dismiss();
    setIsTyping(true);

    try {
      const systemPrompt = "You are a medical assistant for MediCare. Only answer questions related to medical topics, health advice, symptoms, treatments, medications, and general wellness. If a user asks a non-medical question, politely explain that you can only help with medical and health-related inquiries. Provide informative, concise responses about medical topics without including disclaimers in every message - a persistent disclaimer is already shown to users. Keep your answers focused on factual medical information.";

      let requestBody;
      let apiUrl = GEMINI_API_URL;

      if (currentImage && currentImage.base64) {
        console.log('Sending image to Gemini API');
        apiUrl = GEMINI_VISION_API_URL;
        requestBody = {
          contents: [
            {
              role: "user",
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: "image/jpeg", // Assuming JPEG, adjust if other types are supported
                    data: currentImage.base64
                  }
                },
                { text: userMessageText || "Please describe this image." } // Add a default prompt if text is empty
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4, // Adjusted for potentially more factual responses with images
            topP: 0.95,
            topK: 40,
          }
        };
        setCurrentImage(null); // Clear the image after preparing the request
      } else {
        requestBody = {
          contents: [
            // It's common to have a "system" or "model" role for initial instructions,
            // but Gemini API might prefer alternating user/model roles.
            // Let's stick to user roles for prompts for now as per the original code.
            { role: 'user', parts: [{ text: systemPrompt }] }, // System prompt as first user message
            { role: 'user', parts: [{ text: userMessageText }] } // Actual user query
            // The API structure might also be:
            // contents: [{ parts: [{text: systemPrompt}, {text: userMessageText}]}]
            // Or:
            // contents: [
            //   { role: "user", parts: [{ text: systemPrompt }] },
            //   { role: "model", parts: [{ text: "Understood. How can I help?" }] }, // Optional priming
            //   { role: "user", parts: [{ text: userMessageText }] }
            // ]
            // For simplicity and based on the original, we'll use two user parts.
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
          }
        };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const botResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get a response at the moment.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(), // Ensure unique ID
        text: botResponseText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessageText = error instanceof Error ? error.message : 'Could not connect to the AI assistant. Please check your connection and try again.';
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${errorMessageText}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleBackButtonPress = () => {
    console.log('Back button pressed!');
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // This case might occur if this is the first screen in the stack
      Alert.alert('Navigation', 'This is the main chat screen.');
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "MediCare needs access to your camera to take photos for analysis.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Camera permission granted");
        return true;
      } else {
        console.log("Camera permission denied");
        Alert.alert("Permission Denied", "Camera permission is required to take photos.");
        return false;
      }
    } catch (err) {
      console.warn("Camera permission error:", err);
      return false;
    }
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      let granted;
      if (Platform.Version >= 33) { // Android 13+
        granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          // PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO, // If you plan to support video
        ]);
        if (granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Read media images permission granted");
          return true;
        } else {
           console.log("Read media images permission denied: ", granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES]);
          Alert.alert("Permission Denied", "Storage permission is required to select images.");
          return false;
        }
      } else { // Android < 13
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "MediCare needs access to your storage to select images.",
            buttonPositive: "OK",
            buttonNegative: "Cancel",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Read external storage permission granted");
          return true;
        } else {
          console.log("Read external storage permission denied");
          Alert.alert("Permission Denied", "Storage permission is required to select images.");
          return false;
        }
      }
    } catch (err) {
      console.warn("Storage permission error:", err);
      Alert.alert("Permission Error", "An error occurred while requesting storage permissions.");
      return false;
    }
  };


  const handleAttachButtonPress = () => {
    Keyboard.dismiss();
    setIsAttachmentModalVisible(true);
  };

  const handleImageSelected = (imageUri: string, imageBase64: string, fileName?: string) => {
     setCurrentImage({
        uri: imageUri,
        base64: imageBase64
      });

      const imageMessageText = `[Image: ${fileName || 'Selected Photo'}]`;
      const imageMessage: Message = {
        id: Date.now().toString(),
        text: imageMessageText,
        isUser: true,
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, imageMessage]);

      const botPromptMessage: Message = {
        id: (Date.now() + 2).toString(), // Ensure unique ID
        text: "Image received. What would you like to know about this image?",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, botPromptMessage]);
      setInput(''); // Clear text input if user was typing something for the image
  }

  const handleCameraOption = async () => {
    setIsAttachmentModalVisible(false);
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const options = {
      mediaType: 'photo' as const,
      includeBase64: true,
      maxHeight: 1024,
      maxWidth: 1024,
      quality: 0.8 as const,
    };

    try {
      const result = await launchCamera(options);
      if (result.didCancel) {
        console.log('User cancelled camera');
      } else if (result.errorCode) {
        console.log('Camera Error: ', result.errorMessage);
        Alert.alert('Camera Error', result.errorMessage || 'Unknown error occurred');
      } else if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        if (selectedImage.uri && selectedImage.base64) {
          handleImageSelected(selectedImage.uri, selectedImage.base64, selectedImage.fileName);
        } else {
          Alert.alert('Error', 'Could not process image data from camera. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error using camera:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleGalleryOption = async () => {
    setIsAttachmentModalVisible(false);
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    const options = {
      mediaType: 'photo' as const,
      includeBase64: true,
      maxHeight: 1024,
      maxWidth: 1024,
      quality: 0.8 as const,
      selectionLimit: 1,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.errorCode) {
        console.log('ImagePicker Error: ', result.errorMessage);
        Alert.alert('Gallery Error', result.errorMessage || 'Unknown error occurred');
      } else if (result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        if (selectedFile.uri && selectedFile.base64) {
           handleImageSelected(selectedFile.uri, selectedFile.base64, selectedFile.fileName);
        } else {
          Alert.alert('Error', 'Could not process image data from gallery. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInput(suggestion);
    // Optionally, you could immediately call handleSend() here if desired
    // handleSend(); // This would send the suggestion as a message right away
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <AnimatedMessageItem
      item={item}
      formatTime={formatTime}
      styles={styles}
      userProfile={userProfile}
    />
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    const dot1Opacity = typingDots.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] });
    const dot2Opacity = typingDots.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.7, 0.3] }); // slightly different timing
    const dot3Opacity = typingDots.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.5, 0.3] });


    return (
      <View style={[styles.messageRow, styles.botMessageRow]}>
        <Image
          source={{ uri: 'https://img.icons8.com/plasticine/100/medical-doctor.png' }}
          style={styles.avatar}
          onError={(e) => console.log("Failed to load bot avatar for typing", e.nativeEvent.error)}
        />
        <View style={[styles.messageBubble, styles.botMessage, styles.typingIndicator]}>
          <Animated.View style={styles.typingDotsContainer}>
            <Animated.View style={[styles.typingDot, { opacity: dot1Opacity }]} />
            <Animated.View style={[styles.typingDot, { opacity: dot2Opacity, marginHorizontal: 5 }]} />
            <Animated.View style={[styles.typingDot, { opacity: dot3Opacity }]} />
          </Animated.View>
        </View>
      </View>
    );
  };

  // Updated Styles with dark mode support
  const getStyles = () => {
    const inputBackgroundColor = isDarkMode ? '#333333' : '#F0F4F8';
    const inputTextColor = isDarkMode ? '#FFFFFF' : '#222222';
    const placeholderColor = isDarkMode ? '#AAAAAA' : '#888888';
    
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#F0F4F8',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#008080', // Teal (keep consistent for brand identity)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.2,
        shadowRadius: 3,
        elevation: 5,
      },
      headerBackButton: {
        padding: 8, // Increased touchable area
        marginRight: 10,
      },
      headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20, // Perfect circle
        marginRight: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.6)', // Softer border
      },
      headerTitleContainer: {
        flex: 1, // Allow title to take available space
      },
      headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'Poppins-Bold', // Example custom font
      },
      headerSubText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)', // Slightly more opaque
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Poppins-Regular',
      },
      userHeaderAvatar: { // Style for user's avatar in the header (optional)
        width: 36,
        height: 36,
        borderRadius: 18,
        marginLeft: 10, // Space from the title
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.6)',
      },
      chatContainer: {
        flex: 1,
      },
      messageList: {
        flex: 1,
      },
      messageListContent: {
        paddingHorizontal: 12,
        paddingVertical: 16,
        paddingBottom: 24,
      },
      messageRow: {
        flexDirection: 'row',
        marginBottom: 18, // Increased spacing between messages
        alignItems: 'flex-end', // Align avatar and bubble nicely
      },
      userMessageRow: {
        justifyContent: 'flex-end',
      },
      botMessageRow: {
        justifyContent: 'flex-start',
      },
      avatar: {
        width: 36, // Slightly larger avatar
        height: 36,
        borderRadius: 18,
        marginHorizontal: 8,
        borderWidth: 1, // Subtle border
        borderColor: '#D0D0D0'
      },
      messageContentContainer: {
        maxWidth: '78%', // Max width for message bubble + timestamp
      },
      messageBubble: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        maxWidth: '100%',
      },
      userMessage: {
        backgroundColor: '#008080', // Keep teal for user
        borderBottomRightRadius: 8,
      },
      botMessage: {
        backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF',
        borderBottomLeftRadius: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.4 : 0.18,
        shadowRadius: 2.00,
        elevation: 3,
      },
      messageText: {
        fontSize: 15.5,
        lineHeight: 22,
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Poppins-Regular',
      },
      userMessageText: {
        color: 'white',
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Poppins-Regular',
      },
      botMessageText: {
        color: isDarkMode ? '#E0E0E0' : '#000000',
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Poppins-Regular',
      },
      timestamp: {
        fontSize: 10.5,
        color: isDarkMode ? '#AAAAAA' : '#666666',
        marginTop: 6,
        paddingHorizontal: 5,
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Poppins-Regular',
      },
      userTimestamp: {
        textAlign: 'right',
      },
      botTimestamp: {
        textAlign: 'left',
      },
      typingIndicator: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        alignItems: 'center',
      },
      typingDotsContainer: {
        flexDirection: 'row',
        width: 45,
        justifyContent: 'space-around',
        alignItems: 'center',
      },
      typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: isDarkMode ? '#6BBAC6' : '#A0D2DB',
      },
      inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#333333' : '#DDE2E5',
      },
      attachButton: {
        padding: 8, // Good touch target
        marginRight: 6,
        justifyContent: 'center',
        alignItems: 'center',
      },
      inputWrapper: {
        flex: 1,
        backgroundColor: inputBackgroundColor,
        borderRadius: 25,
        paddingHorizontal: 18,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        maxHeight: 120,
        justifyContent: 'center',
        marginRight: 8,
      },
      input: {
        fontSize: 16,
        color: inputTextColor,
        paddingTop: Platform.OS === 'ios' ? 0 : 2,
        paddingBottom: Platform.OS === 'ios' ? 0 : 2,
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Poppins-Regular',
      },
      sendButton: {
        width: 48, // Circular button
        height: 48,
        borderRadius: 24, // Half of width/height
        backgroundColor: '#008080', // Teal
        justifyContent: 'center',
        alignItems: 'center',
        // Adding shadow to send button
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
      },
      sendButtonDisabled: {
        backgroundColor: '#B0BEC5', // Greyed out when disabled
        elevation: 0, // No shadow when disabled
        shadowOpacity: 0,
      },
      // Styles for AttachmentModal
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      },
      modalContent: {
        backgroundColor: 'white',
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20, // More padding for iOS home indicator
        paddingHorizontal: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center',
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 20,
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'Poppins-Bold',
      },
      modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4F8',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%', // Full width buttons
      },
      modalButtonIcon: {
        marginRight: 15,
      },
      modalButtonText: {
        fontSize: 16,
        color: '#008080', // Teal text
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'Poppins-Medium',
      },
      modalCancelButton: {
        backgroundColor: '#E0E0E0', // Distinct cancel button color
        marginTop: 10, // Space above cancel
      },
      modalCancelButtonText: {
        color: '#757575', // Darker grey for cancel text
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-SemiBold' : 'Poppins-SemiBold',
      },
      // Suggestion Chips Styles
      suggestionContainer: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: isDarkMode ? '#1A1A1A' : '#F0F4F8',
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#333333' : '#DDE2E5',
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#333333' : '#DDE2E5',
      },
      suggestionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginLeft: 5, // Align with chip content
      },
      suggestionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: isDarkMode ? '#E0E0E0' : '#555555',
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-SemiBold' : 'Poppins-SemiBold',
      },
      suggestionScrollContent: {
        paddingBottom: 5, // Small padding at the bottom of scroll
        paddingLeft: 5, // Align chips with title
      },
      suggestionChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: isDarkMode ? '#264D4D' : '#E6F2F2',
        borderWidth: 1,
        borderColor: '#008080',
        borderRadius: 20,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 1,
        elevation: 1,
      },
      suggestionChipText: {
        fontSize: 14,
        color: '#008080', // Teal text
        fontWeight: '500',
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'Poppins-Medium',
      },
      // Disclaimer Banner Styles
      disclaimerBanner: {
        backgroundColor: isDarkMode ? 'rgba(173, 20, 87, 0.15)' : 'rgba(173, 20, 87, 0.08)',
        borderLeftWidth: 3,
        borderLeftColor: '#AD1457',
        marginHorizontal: 10,
        marginTop: 10,
        marginBottom: 5,
        borderRadius: 6,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 1,
      },
      disclaimerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
      },
      disclaimerTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: isDarkMode ? '#F0F0F0' : '#333333',
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-SemiBold' : 'Poppins-SemiBold',
      },
      disclaimerText: {
        fontSize: 12,
        color: isDarkMode ? '#D0D0D0' : '#444444',
        paddingHorizontal: 10,
        paddingBottom: 10,
        paddingTop: 0,
        lineHeight: 18,
        fontFamily: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'Poppins-Regular',
      },
    });
  };

  const styles = getStyles();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={styles.header?.backgroundColor || "#008080"} 
      />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBackButtonPress}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://img.icons8.com/plasticine/100/medical-doctor.png' }}
          style={styles.headerAvatar}
          onError={(e) => console.log("Failed to load header avatar", e.nativeEvent.error)}
        />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerText}>MediCare Assistant</Text>
          {/* You could add a status like "Online" or "Typing..." here if needed */}
          <Text style={styles.headerSubText}>{isTyping ? "Typing..." : "Online"}</Text>
        </View>
      </View>

      {/* Chat Area with KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} // 'height' might also work
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust as needed
      >
        {/* Disclaimer Banner */}
        <DisclaimerBanner styles={styles} />

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          ListFooterComponent={renderTypingIndicator} // Show typing indicator at the bottom
          // Optimization: remove onLayout and onContentSizeChange if not strictly needed
          // for auto-scrolling, as useEffect handles it.
          // onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          // onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Suggestion Chips */}
        {messages.length <= 1 && !isTyping && ( // Show suggestions only initially or if chat is empty
             <SuggestionChips
                onSuggestionPress={handleSuggestionPress}
                styles={styles}
            />
        )}


        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachButtonPress}>
            <Ionicons name="add-circle-outline" size={30} color={styles.sendButton?.backgroundColor || "#008080"} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your medical question..."
              placeholderTextColor={isDarkMode ? '#AAAAAA' : '#888888'}
              multiline
              maxLength={500} // Max length for input
              onSubmitEditing={handleSend} // Allows sending with keyboard "return" key
              blurOnSubmit={false} // Keep keyboard open on send if desired (false)
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, (input.trim().length === 0 && !currentImage) ? styles.sendButtonDisabled : {}]}
            onPress={handleSend}
            disabled={input.trim().length === 0 && !currentImage} // Disable if no text and no image
          >
            <Ionicons name="send" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Modal */}
      <AttachmentModal
        visible={isAttachmentModalVisible}
        onClose={() => setIsAttachmentModalVisible(false)}
        onCameraPress={handleCameraOption}
        onGalleryPress={handleGalleryOption}
        styles={styles}
      />
    </SafeAreaView>
  );
};

export default AI_ChatBot;
