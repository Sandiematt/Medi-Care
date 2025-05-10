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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

// Define the Message interface
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// AnimatedMessageItem component (remains the same)
const AnimatedMessageItem: React.FC<{
  item: Message;
  formatTime: (date: Date) => string;
  styles: any;
}> = ({ item, formatTime, styles }) => {
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
              {item.text}
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
            source={{ uri: 'https://img.icons8.com/pastel-glyph/64/user-male-circle.png' }}
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

const AI_ChatBot: React.FC = () => {
  const navigation = useNavigation();
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your MediCare assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingDots = useRef(new Animated.Value(0)).current;

  const GEMINI_API_KEY = 'AIzaSyBfD0AG0TcAtVqZfADH1uqT9Qh8Q0VIzX8';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  useEffect(() => {
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
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: userMessageText }] }] }),
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
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
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
        // Create message with image indication
        const imageMessage: Message = {
          id: Date.now().toString(),
          text: `[Image sent: ${selectedImage.fileName || 'Photo'}]`,
          isUser: true,
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, imageMessage]);
        
        // In a real app, you would upload the image to a server here
        console.log('Selected image:', selectedImage.uri);
        
        // Simulated bot response to the image
        setTimeout(() => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: "I've received your image. How can I help you with this?",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prevMessages => [...prevMessages, botResponse]);
        }, 1000);
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
      mediaType: 'mixed' as const, // Allow both photos and videos
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
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
        
        // Determine if it's an image or video
        const fileType = selectedFile.type?.startsWith('image/') ? 'Image' : 'File';
        
        // Create message with file indication
        const fileMessage: Message = {
          id: Date.now().toString(),
          text: `[${fileType} sent: ${selectedFile.fileName || 'Media file'}]`,
          isUser: true,
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, fileMessage]);
        
        // In a real app, you would upload the file to a server here
        console.log('Selected file:', selectedFile.uri);
        
        // Simulated bot response to the file
        setTimeout(() => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: `I've received your ${fileType.toLowerCase()}. How can I help you with this?`,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prevMessages => [...prevMessages, botResponse]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <AnimatedMessageItem item={item} formatTime={formatTime} styles={styles} />
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
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
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

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachButtonPress}>
            <Ionicons name="add-circle-outline" size={30} color={styles.sendButton.backgroundColor} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
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
});

export default AI_ChatBot;