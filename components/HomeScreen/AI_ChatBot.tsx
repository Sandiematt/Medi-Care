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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
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

// Helper function to parse and format message text
const formatMessageText = (text: string) => {
  if (!text) return null;
  
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
              return part ? <Text key={`p-${pIndex}-${index}`}>{part}</Text> : null;
            })}
          </View>
        );
      })}
    </>
  );
};

// Add AnimatedMessageItem component with profile photo support
const AnimatedMessageItem: React.FC<{
  item: Message;
  formatTime: (date: Date) => string;
  styles: any;
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
    outputRange: [15, 0],
  });

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
            <Text style={[
              styles.messageText,
              item.isUser ? styles.userMessageText : styles.botMessageText
            ]}>
              {item.isUser ? item.text : formatMessageText(item.text)}
            </Text>
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
  styles: any;
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
        onPressOut={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Attach File</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onCameraPress}>
            <Ionicons name="camera-outline" size={24} color={styles.modalButtonText.color} style={styles.modalButtonIcon} />
            <Text style={styles.modalButtonText}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={onGalleryPress}>
            <Ionicons name="images-outline" size={24} color={styles.modalButtonText.color} style={styles.modalButtonIcon} />
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
const DisclaimerBanner: React.FC<{styles: any}> = ({ styles }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <TouchableOpacity 
      style={styles.disclaimerBanner}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.9}
    >
      <View style={styles.disclaimerHeader}>
        <Ionicons name="alert-circle" size={16} color="#AD1457" style={{marginRight: 6}} />
        <Text style={styles.disclaimerTitle}>
          Medical Information Disclaimer
        </Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#777" 
          style={{marginLeft: 'auto'}} 
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
  styles: any;
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
        <Ionicons name="medical" size={16} color="#008080" style={{marginRight: 6}} />
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

  const GEMINI_API_KEY = 'AIzaSyBfD0AG0TcAtVqZfADH1uqT9Qh8Q0VIzX8';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // New state variable to track the last uploaded image
  const [currentImage, setCurrentImage] = useState<{uri: string, base64: string} | null>(null);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      // Get username from AsyncStorage
      const username = await AsyncStorage.getItem('username');
      
      if (!username) {
        console.log('No username found in AsyncStorage');
        return;
      }
      
      // Call the API to fetch profile data
      const response = await fetch(`http://10.0.2.2:5000/api/users/${username}/profile`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUserProfile({
          username: data.username,
          name: data.name || data.username,
          profilePhoto: data.profilePhoto
        });
      } else {
        console.log('Profile fetch unsuccessful:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Fetch user profile when component mounts
    fetchUserProfile();
    
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 0, useNativeDriver: true })
        ])
      ).start();
    } else {
      typingDots.setValue(0);
    }
  }, [isTyping, typingDots]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim().length === 0) return;
    
    const userMessageText = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    Keyboard.dismiss();
    
    setIsTyping(true);
    
    try {
      // Create a system prompt to constrain the model to medical context
      const systemPrompt = "You are a medical assistant for MediCare. Only answer questions related to medical topics, health advice, symptoms, treatments, medications, and general wellness. If a user asks a non-medical question, politely explain that you can only help with medical and health-related inquiries. Provide informative, concise responses about medical topics without including disclaimers in every message - a persistent disclaimer is already shown to users. Keep your answers focused on factual medical information.";
      
      let requestBody;
      
      // Check if we're dealing with an image query
      if (currentImage && currentImage.base64) {
        console.log('Sending image to Gemini API');
        // Use the image API endpoint for Gemini Pro Vision
        const visionApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        // Format the request for image + text
        requestBody = {
          contents: [
            {
              role: "user",
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: currentImage.base64
                  }
                },
                { text: userMessageText }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topP: 0.95,
            topK: 40,
          }
        };

        // Clear the image after sending to avoid reusing it
        setCurrentImage(null);
        
        const response = await fetch(visionApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        const botResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't analyze this image.";

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } else {
        // Regular text-only query
        requestBody = {
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'user', parts: [{ text: userMessageText }] }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
          }
        };
        
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        const botResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get a response.";

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error instanceof Error ? error.message : 'Could not connect to AI'}`,
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
      Alert.alert('Navigation', 'No previous screen to navigate back to.');
    }
  };

  // Function to check camera permissions (Android only)
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "MediCare needs access to your camera to take photos",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Function to request storage permissions for Android
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) { // Android 13 (API level 33) and above
        console.log('Requesting READ_MEDIA_IMAGES and READ_MEDIA_VIDEO permissions for Android 13+');
        const statuses = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
        console.log('Permission statuses:', statuses);

        const imagesGranted = statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES];
        const videoGranted = statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO];

        if (imagesGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN || videoGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            "Permission Required",
            "Storage permission is needed to select files. Please enable it in app settings.",
            [{ text: "OK" }]
          );
          // Optionally, you could add a button to open app settings:
          // { text: "Open Settings", onPress: () => Linking.openSettings() }
          return false;
        }
        return imagesGranted === PermissionsAndroid.RESULTS.GRANTED && videoGranted === PermissionsAndroid.RESULTS.GRANTED;
      } else { // Android versions below 13
        console.log('Requesting READ_EXTERNAL_STORAGE permission for Android < 13');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "MediCare needs access to your storage to select files",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        console.log('Permission status for READ_EXTERNAL_STORAGE:', granted);
        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            "Permission Required",
            "Storage permission is needed to select files. Please enable it in app settings.",
            [{ text: "OK" }]
          );
          // Optionally, Linking.openSettings()
          return false;
        }
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Error during permission request:', err);
      Alert.alert("Permission Error", "An error occurred while requesting storage permissions.");
      return false;
    }
  };

  // Toggle attachment modal
  const handleAttachButtonPress = () => {
    Keyboard.dismiss();
    setIsAttachmentModalVisible(true);
  };

  const handleCameraOption = async () => {
    setIsAttachmentModalVisible(false);
    console.log('Camera selected');
    
    // Check camera permission for Android
    if (Platform.OS === 'android') {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to use this feature.');
        return;
      }
    }
    
    // Launch camera
    const options = {
      mediaType: 'photo' as const,
      includeBase64: true, // Get base64 data for Gemini API
      maxHeight: 1024, // Reduce image size for faster upload
      maxWidth: 1024,
      quality: 0.8 as const, // Fix type error with as const
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
        
        if (selectedImage.base64) {
          // Store the image to use with the next message
          setCurrentImage({
            uri: selectedImage.uri || '',
            base64: selectedImage.base64
          });
          
          // Create message with image indication
          const imageMessage: Message = {
            id: Date.now().toString(),
            text: `[Image sent: ${selectedImage.fileName || 'Photo'}]`,
            isUser: true,
            timestamp: new Date()
          };
          setMessages(prevMessages => [...prevMessages, imageMessage]);
          
          // Inform user to ask a question about the image
          const botPromptMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "I can now see your image. Please ask me a specific question about it, like 'What medication is this?' or 'What might these symptoms indicate?'",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prevMessages => [...prevMessages, botPromptMessage]);
        } else {
          Alert.alert('Error', 'Could not process image data. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error using camera:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleGalleryOption = async () => {
    setIsAttachmentModalVisible(false);
    console.log('Gallery selected');
    
    // Check storage permission for Android
    if (Platform.OS === 'android') {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to access gallery.');
        return;
      }
    }
    
    // Launch image library
    const options = {
      mediaType: 'photo' as const, // Focus on photos for medical analysis
      includeBase64: true, // Get base64 data for Gemini API
      maxHeight: 1024, // Reduce image size for faster upload
      maxWidth: 1024,
      quality: 0.8 as const, // Fix type error with as const
      selectionLimit: 1, // Allow only one file selection
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
        
        if (selectedFile.base64) {
          // Store the image to use with the next message
          setCurrentImage({
            uri: selectedFile.uri || '',
            base64: selectedFile.base64
          });
          
          // Create message with file indication
          const fileMessage: Message = {
            id: Date.now().toString(),
            text: `[Image sent: ${selectedFile.fileName || 'Photo from gallery'}]`,
            isUser: true,
            timestamp: new Date()
          };
          setMessages(prevMessages => [...prevMessages, fileMessage]);
          
          // Inform user to ask a question about the image
          const botPromptMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "I can now see your image. Please ask me a specific question about it, like 'What medication is this?' or 'What might these symptoms indicate?'",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prevMessages => [...prevMessages, botPromptMessage]);
        } else {
          Alert.alert('Error', 'Could not process image data. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInput(suggestion);
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

    return (
      <View style={styles.messageRow}>
        <Image
          source={{ uri: 'https://img.icons8.com/plasticine/100/medical-doctor.png' }}
          style={styles.avatar}
          onError={(e) => console.log("Failed to load bot avatar for typing", e.nativeEvent.error)}
        />
        <View style={[styles.messageBubble, styles.botMessage, styles.typingIndicator]}>
          <Animated.View style={styles.typingDotsContainer}>
            {[0, 1, 2].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.typingDot,
                  {
                    opacity: typingDots.interpolate({ inputRange: [0, 1], outputRange: [0.3, i === 0 ? 1 : i === 1 ? 0.5 : 0.3] }),
                    transform: [{ translateY: typingDots.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, i === 0 ? -5 : i === 1 ? -7 : -5, 0] }) }]
                  }
                ]}
              />
            ))}
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={styles.header.backgroundColor} />

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
          <Text style={styles.headerSubText}>Online</Text>
        </View>
        {userProfile && (
          <Image
            source={{ 
              uri: userProfile.profilePhoto || 'https://img.icons8.com/pastel-glyph/64/user-male-circle.png' 
            }}
            style={styles.userHeaderAvatar}
            onError={(e) => console.log("Failed to load user header avatar", e.nativeEvent.error)}
          />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <DisclaimerBanner styles={styles} />
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          ListFooterComponent={renderTypingIndicator}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <SuggestionChips 
          onSuggestionPress={handleSuggestionPress} 
          styles={styles} 
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachButtonPress}>
            <Ionicons name="add-circle-outline" size={30} color={styles.sendButton.backgroundColor} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your medical question..."
              placeholderTextColor="#888888"
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, input.trim().length === 0 ? styles.sendButtonDisabled : {}]}
            onPress={handleSend}
            disabled={input.trim().length === 0}
          >
            <Ionicons name="send" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#008080', // Teal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  headerBackButton: {
    padding: 8,
    marginRight: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
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
    marginBottom: 18,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#D0D0D0'
  },
  messageContentContainer: {
    maxWidth: '78%',
  },
  messageBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    maxWidth: '100%',
  },
  userMessage: {
    backgroundColor: '#008080', // Teal
    borderBottomRightRadius: 8,
  },
  botMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2.00,
    elevation: 3,
  },
  messageText: {
    fontSize: 15.5,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: '#333333',
  },
  timestamp: {
    fontSize: 10.5,
    color: '#666666',
    marginTop: 6,
    paddingHorizontal: 5,
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
    backgroundColor: '#A0D2DB', // Lighter teal
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DDE2E5',
  },
  attachButton: {
    padding: 8,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    maxHeight: 120,
    justifyContent: 'center',
    marginRight: 8,
  },
  input: {
    fontSize: 16,
    color: '#222222',
    paddingTop: Platform.OS === 'ios' ? 0 : 2,
    paddingBottom: Platform.OS === 'ios' ? 0 : 2,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#008080', // Teal
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#B0BEC5',
    elevation: 0,
    shadowOpacity: 0,
  },
  // Styles for AttachmentModal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'flex-end', // Align modal to bottom
  },
  modalContent: {
    backgroundColor: 'white',
    paddingTop: 20, // Add padding at the top
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Padding at bottom, more for iOS notch
    paddingHorizontal: 20,
    borderTopLeftRadius: 20, // Rounded corners at the top
    borderTopRightRadius: 20,
    alignItems: 'center', // Center items like title
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20, // Space below title
  },
  modalButton: {
    flexDirection: 'row', // Align icon and text
    alignItems: 'center', // Vertically align icon and text
    backgroundColor: '#F0F4F8', // Light background for buttons
    paddingVertical: 15,
    paddingHorizontal: 20, // Horizontal padding for button content
    borderRadius: 10, // Rounded buttons
    marginBottom: 10, // Space between buttons
    width: '100%', // Make buttons take full width
  },
  modalButtonIcon: {
    marginRight: 15, // Space between icon and text
  },
  modalButtonText: {
    fontSize: 16,
    color: '#008080', // Teal text color for options
    fontWeight: '500',
  },
  modalCancelButton: {
    backgroundColor: '#E0E0E0', // Different background for cancel
    marginTop: 10, // Add some space above cancel button
  },
  modalCancelButtonText: {
    color: '#757575', // Darker grey for cancel text
    fontWeight: '600',
  },
  suggestionContainer: {
    padding: 12,
    backgroundColor: '#F0F4F8',
    borderTopWidth: 1,
    borderTopColor: '#DDE2E5',
  },
  suggestionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 5,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
  suggestionScrollContent: {
    paddingBottom: 5,
  },
  suggestionChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#E6F2F2',
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  suggestionChipText: {
    fontSize: 14,
    color: '#008080',
    fontWeight: '500',
  },
  disclaimerBanner: {
    backgroundColor: 'rgba(173, 20, 87, 0.08)',
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
    shadowOpacity: 0.1,
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
    color: '#333',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#444',
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 0,
    lineHeight: 18,
  },
  userHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});

export default AI_ChatBot;