import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStackNavigator } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import PillDisplayScreen from './PillDisplayScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Define navigation types
type RootStackParamList = {
  PillIdentifier: undefined;
  PillDisplay: undefined;
};

const PillIdentifierApp = () => {
  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false // Hide the default header
        }}
      >
        <Stack.Screen 
          name="PillIdentifier" 
          component={PillIdentifierScreen}
        />
        <Stack.Screen 
          name="PillDisplay" 
          component={PillDisplayScreen}
        />
      </Stack.Navigator>
  );
};

const { width } = Dimensions.get('window');

const PillIdentifierScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [imprint, setImprint] = useState('');
  
  // State and ref for tab bar visibility
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  // Animation values using useRef
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const cameraAnimation = useRef(new Animated.Value(0)).current;
  const instructionsAnimation = useRef(new Animated.Value(0)).current;
  const searchButtonScale = useRef(new Animated.Value(1)).current;
  const searchBorderAnimation = useRef(new Animated.Value(0)).current;
  const floatingAnimation = useRef(new Animated.Value(0)).current;
  
  // Create tip animations using useRef
  const tipAnimations = useRef(
    [...Array(5)].map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Combine all animations into a single stagger
    const allAnimations = [
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(cameraAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(instructionsAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      ...tipAnimations.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ),
    ];

    // Start entrance animations
    Animated.stagger(150, allAnimations).start();

    // Start floating animation
    const floatingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    floatingLoop.start();

    // Cleanup animations on unmount
    return () => {
      floatingLoop.stop();
      allAnimations.forEach(anim => anim.stop());
    };
  }, []);

  // Scroll handler to show/hide tab bar
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    const canScroll = contentHeight > layoutHeight + 5; // 5px threshold
    const isEffectivelyAtBottom = canScroll && (layoutHeight + currentScrollY >= contentHeight - 20); // 20px threshold

    if (isEffectivelyAtBottom) {
      if (isTabBarVisible) {
        setIsTabBarVisible(false);
      }
    } else {
      if (canScroll && currentScrollY > lastScrollY.current && currentScrollY > 20) {
        if (isTabBarVisible) {
          setIsTabBarVisible(false);
        }
      } else {
        if (!isTabBarVisible) {
          setIsTabBarVisible(true);
        }
      }
    }
    lastScrollY.current = currentScrollY;
  }, [isTabBarVisible]);

  // Effect to update parent navigator's tab bar visibility
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarVisible: isTabBarVisible,
    });
  }, [isTabBarVisible, navigation]);

  // Effect to handle screen focus and blur for tab bar visibility
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setIsTabBarVisible(true); // Show tab bar on focus, scroll will adjust
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      // Ensure tab bar is visible for the next screen when this one blurs
      navigation.getParent()?.setOptions({ tabBarVisible: true });
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      // Ensure tab bar is visible if component unmounts
      navigation.getParent()?.setOptions({ tabBarVisible: true });
    };
  }, [navigation]);

  const handlePressIn = useCallback((scaleAnim: Animated.Value) => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback((scaleAnim: Animated.Value) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleFileUpload = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorMessage) {
        console.log('Image Picker Error:', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        console.log('Image URI:', imageUri);

        try {
          const result = await TextRecognition.recognize(imageUri);
          const recognizedText = result.text || '';
          console.log('Recognized Text:', recognizedText);
          setImprint(recognizedText);
        } catch (error) {
          console.error('OCR Error:', error);
        }
      }
    });
  };

  const floatingTranslateY = floatingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const handleSearch = () => {
    // Validate that imprint is not empty before searching
    if (!imprint.trim()) {
      // Show alert or handle empty input case
      Alert.alert('Input Required', 'Please enter a pill imprint or name before searching');
      return;
    }
    
    // Navigate to PillDisplay screen and pass the imprint as a query parameter
    navigation.navigate('PillDisplay', { query: imprint });
  };

  return (
    <ScrollView 
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="never"
    >
      {/* Gradient Header */}
      <Animated.View style={{
        opacity: headerAnimation,
        transform: [
          { translateY: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            })
          }
        ],
      }}>
        <LinearGradient
          colors={['#199A8E', '#199A8E']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Icon name="pill" size={36} color="#FFFFFF" />
              <Text style={styles.headerText}>Pill Identifier</Text>
            </View>
            <Text style={styles.headerSubtext}>Upload or search for medication details</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.mainContent}>
        {/* Search Section */}
        <View style={styles.searchCard}>
          <View style={styles.searchInputContainer}>
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={24} color="#A5B4FC" style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter pill imprint or name"
                placeholderTextColor="#94A3B8"
                value={imprint}
                onChangeText={setImprint}
              />
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.searchButton, !imprint.trim() && styles.disabledButton]}
            onPress={handleSearch}
            activeOpacity={0.8}
            disabled={!imprint.trim()}
          >
            <LinearGradient
              colors={['#199A8E', !imprint.trim() ? '#A0AEC0' : '#199A8E']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Search Database</Text>
              <Icon name="arrow-right" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Camera Section */}
        <Animated.View style={[
          styles.cameraCard,
          {
            opacity: cameraAnimation,
            transform: [
              { translateY: cameraAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }
            ],
          }
        ]}>
          <TouchableOpacity
            onPress={handleFileUpload}
            style={styles.cameraButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(241, 242, 248, 0.1)', 'rgba(242, 243, 242, 0.1)']}
              style={styles.cameraGradient}
            >
              <Animated.View style={[
                styles.cameraIconContainer,
                {transform: [{translateY: floatingTranslateY}]}
              ]}>
                <TouchableOpacity 
                  onPress={handleFileUpload}
                  activeOpacity={0.7}
                >
                  <Icon name="image-multiple" size={48} color="#199A8E" />
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.cameraText}>Upload Your Pill</Text>
              <Text style={styles.cameraSubtext}>
                Position pill in frame for best results
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Instructions Section */}
        <Animated.View style={[
          styles.instructionCard,
          {
            opacity: instructionsAnimation,
            transform: [
              { translateY: instructionsAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }
            ],
          }
        ]}>
          <View style={styles.cardHeader}>
            <Icon name="lightbulb-outline" size={24} color="#4F46E5" />
            <Text style={styles.cardTitle}>Scanning Tips</Text>
          </View>
          {[
            'Place pill on dark background',
            'Ensure good lighting conditions',
            'Hold camera 4-6 inches away',
            'Center the imprint in frame',
            'Keep device steady while scanning',
          ].map((tip, index) => (
            <Animated.View
              key={index}
              style={[
                styles.tipRow,
                {
                  opacity: tipAnimations[index],
                  transform: [
                    { translateX: tipAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      })
                    }
                  ],
                }
              ]}
            >
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header Styles
  headerGradient: {
    paddingTop: 48,
    paddingBottom: 80,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
    fontFamily: 'Poppins-Bold',
  },
  headerSubtext: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },

  // Main Content
  mainContent: {
    padding: 16,
    marginTop: -60,
    position: 'relative',
    zIndex: 2,
  },

  // Search Card Styles
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 20,
  },
  searchInputContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 12,
    paddingRight: 12,
    fontFamily: 'Poppins-Regular',
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Camera Card Styles
  cameraCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  cameraButton: {
    width: '100%',
  },
  
  cameraGradient: {
    padding: 24,
    alignItems: 'center',
  },
  cameraIconContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cameraText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  cameraSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },

  // Instruction Card Styles
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 12,
    fontFamily: 'Poppins-Bold',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipNumberText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },

  // Button Styles
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  buttonIcon: {
    marginLeft: 4,
  },
  buttonContainer: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
});


export default PillIdentifierApp;