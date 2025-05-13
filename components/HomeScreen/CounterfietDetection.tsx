/* eslint-disable no-catch-shadow */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const CounterfeitDetection = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);

  // Check camera permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const permission = await checkCameraPermission();
        setCameraPermission(permission);
      }
    })();
  }, []);

  // Hide tab bar on focus, show on blur
  useFocusEffect(
    useCallback(() => {
      // Get all navigation parents to ensure we find the tab navigator
      let parent = navigation;
      
      // Attempt to make tab bar invisible at the component level that renders it
      while (parent) {
        // Set options to hide the tab bar and mark as CounterfeitDetection screen
        parent.setOptions({ 
          tabBarVisible: false,
          tabBarStyle: { display: 'none' },
          tabBarShowLabel: false,
          tabBarIconStyle: { display: 'none' },
          isCounterfeitScreen: true // Special flag for TabBar component
        });
        
        // Try to navigate to parent
        parent = parent.getParent();
      }
      
      // Log for debugging
      console.log('CounterfeitDetection: Tab bar should be completely hidden now');
      
      // Cleanup function - restore tab bar visibility when leaving screen
      return () => {
        // Reset all the navigation parents
        parent = navigation;
        while (parent) {
          parent.setOptions({ 
            tabBarVisible: true,
            tabBarStyle: undefined,
            tabBarShowLabel: true,
            tabBarIconStyle: undefined,
            isCounterfeitScreen: false // Reset the special flag
          });
          parent = parent.getParent();
        }
        
        console.log('CounterfeitDetection: Tab bar should be visible again');
      };
    }, [navigation])
  );

  const checkCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        return result;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to verify medications',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        setCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Camera permission is required to take photos. Would you like to enable it in your device settings?',
            [
              {
                text: 'No thanks',
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return false;
        }
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // iOS handles permissions through info.plist
    }
  };

  const pickImage = async () => {
    try {
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1200,
        maxWidth: 1200,
        quality: 1,
        selectionLimit: 1,
      };

      launchImageLibrary(options, response => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          let errorMsg = 'Image picker error';
          if (response.errorCode === 'camera_unavailable') {
            errorMsg = 'Camera is not available on this device';
          } else if (response.errorCode === 'permission') {
            errorMsg = 'Permission not granted';
          } else {
            errorMsg = response.errorMessage || 'Unknown error occurred';
          }
          setError(errorMsg);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          setImage(selectedImage.uri);
          setResult(null);
          setError(null);

          uploadImageFile(selectedImage);
        }
      });
    } catch (error) {
      setError('Error picking image: ' + error.message);
      console.error(error);
    }
  };

  const takePicture = async () => {
    try {
      const hasPermission = await requestCameraPermission();

      if (!hasPermission) {
        return;
      }

      const options = {
        saveToPhotos: false,
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1200,
        maxWidth: 1200,
        quality: 1,
      };

      launchCamera(options, response => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          let errorMsg = 'Camera error';
          if (response.errorCode === 'camera_unavailable') {
            errorMsg = 'Camera is not available on this device';
          } else if (response.errorCode === 'permission') {
            errorMsg = 'Camera permission not granted';
          } else {
            errorMsg = response.errorMessage || 'Unknown error occurred';
          }
          setError(errorMsg);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          setImage(selectedImage.uri);
          setResult(null);
          setError(null);

          uploadImageFile(selectedImage);
        }
      });
    } catch (error) {
      setError('Error taking picture: ' + error.message);
      console.error(error);
    }
  };

  const uploadImageFile = async (imageFile) => {
    setLoading(true);

    try {
      // Create form data
      const formData = new FormData();

      formData.append('image', {
        uri: Platform.OS === 'android' ? imageFile.uri : imageFile.uri.replace('file://', ''),
        type: imageFile.type || 'image/jpeg',
        name: imageFile.fileName || 'upload.jpg',
      });

      console.log('Uploading image:', imageFile.uri);

      const response = await axios.post(
        'http://20.193.156.237:500/detect-counterfeit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout - increased for slower connections
        }
      );

      setResult(response.data);

    } catch (error) {
      let errorMessage = 'Server error';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again with a stronger connection.';
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message ||
                      `Server error (${error.response.status}): Please try again.`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'An unknown error occurred';
      }

      setError(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format confidence percentage
  const formatConfidence = (confidence) => {
    if (!confidence && confidence !== 0) {return null;}
    return `${Math.round(confidence * 100)}%`;
  };

  // Get result color based on authenticity
  const getResultColor = () => {
    if (!result) {return '#808080';}
    return !result.isCounterfeit ? '#10B981' : '#EF4444';
  };

  // Get result text based on authenticity
  const getResultText = () => {
    if (!result) {return '';}
    return !result.isCounterfeit ? 'AUTHENTIC' : 'COUNTERFEIT';
  };

  // Get result details to display
  const getResultDetails = () => {
    if (!result) {return null;}

    const details = [];

    if (result.confidence) {
      details.push({
        label: 'Confidence',
        value: formatConfidence(result.confidence),
        icon: 'analytics',
      });
    }

    if (result.currencyType) {
      details.push({
        label: 'Medicine Type',
        value: result.currencyType,
        icon: 'medkit',
      });
    }

    if (result.denomination) {
      details.push({
        label: 'Dosage',
        value: result.denomination,
        icon: 'fitness',
      });
    }

    if (result.features && result.features.length > 0) {
      details.push({
        label: 'Features Detected',
        value: Array.isArray(result.features) ? result.features.join(', ') : result.features,
        icon: 'scan',
      });
    }

    return details;
  };

  // Handle retry scan
  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0891B2" />

      <LinearGradient
        colors={['#0891B2', '#0E7490']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Icon name="shield-checkmark" size={28} color="#FFFFFF" style={styles.headerIconLeft} />
          <Text style={styles.headerTitle}>Medication Verify</Text>
        </View>
        <Text style={styles.headerSubtitle}>Instant authenticity check</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.content}>
          {!image ? (
            <View style={styles.placeholderContainer}>
              <LinearGradient
                colors={['#F9FAFB', '#F3F4F6']}
                style={styles.placeholderBox}
              >
                <View style={styles.iconCircle}>
                  <Icon name="medkit" size={40} color="#0891B2" />
                </View>
                <Text style={styles.placeholderTitle}>
                  Verify Your Medication
                </Text>
                <Text style={styles.placeholderText}>
                  Take a photo or select an image of your medicine packaging
                </Text>
                <View style={styles.placeholderSteps}>
                  <View style={styles.stepItem}>
                    <View style={styles.stepCircle}>
                      <Icon name="camera" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.stepText}>Capture</Text>
                  </View>
                  <View style={styles.stepDivider} />
                  <View style={styles.stepItem}>
                    <View style={styles.stepCircle}>
                      <Icon name="scan-outline" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.stepText}>Analyze</Text>
                  </View>
                  <View style={styles.stepDivider} />
                  <View style={styles.stepItem}>
                    <View style={styles.stepCircle}>
                      <Icon name="checkmark-circle" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.stepText}>Verify</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              {loading && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color="#0891B2" />
                    <Text style={styles.loadingText}>Analyzing Medicine...</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={24} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() => setError(null)}
                style={styles.dismissButton}
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
              >
                <Icon name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {result && !loading && (
            <View style={styles.resultContainer}>
              <View style={[styles.resultCard, { backgroundColor: !result.isCounterfeit ? '#ECFDF5' : '#FEF2F2' }]}>
                <View style={styles.resultHeaderContainer}>
                  <View style={[styles.resultIndicator, { backgroundColor: getResultColor() }]}>
                    <Icon
                      name={!result.isCounterfeit ? 'checkmark-circle' : 'alert-circle'}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={[styles.resultText, { color: getResultColor() }]}>
                    {getResultText()}
                  </Text>
                </View>

                <View style={styles.resultIconContainer}>
                  <View style={[styles.iconCircleLarge, { borderColor: getResultColor() }]}>
                    <Icon
                      name={!result.isCounterfeit ? 'shield-checkmark' : 'warning'}
                      size={48}
                      color={getResultColor()}
                    />
                  </View>
                </View>

                <View style={styles.resultDetailsContainer}>
                  {getResultDetails()?.map((detail, index) => (
                    <View key={index} style={[
                      styles.detailRow,
                      index === getResultDetails().length - 1 ? { borderBottomWidth: 0 } : {},
                    ]}>
                      <View style={styles.detailLabelContainer}>
                        <View style={[styles.detailIconCircle, { backgroundColor: !result.isCounterfeit ? '#059669' : '#B91C1C' }]}>
                          <Icon name={detail.icon || 'information-circle'} size={14} color="#FFFFFF" />
                        </View>
                        <Text style={styles.detailLabel}>{detail.label}</Text>
                      </View>
                      <Text style={styles.detailValue}>{detail.value}</Text>
                    </View>
                  ))}
                </View>

                {result.isCounterfeit && (
                  <View style={styles.warningContainer}>
                    <Icon name="warning" size={20} color="#EF4444" />
                    <Text style={styles.warningText}>
                      This appears to be counterfeit medication. Please verify with a healthcare professional.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: !result.isCounterfeit ? '#10B981' : '#4B5563' }]}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Icon name="refresh" size={18} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Scan Another</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <LinearGradient
          colors={['#FFFFFF', '#F9FAFB']}
          style={styles.buttonsGradient}
        >
          <TouchableOpacity
            style={[styles.cameraButton, { opacity: loading ? 0.7 : 1 }]}
            onPress={takePicture}
            activeOpacity={0.7}
            disabled={loading}
          >
            <LinearGradient
              colors={['#0E7490', '#0891B2']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.buttonGradient}
            >
              <Icon name="camera" size={22} color="#FFFFFF" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.galleryButton, { opacity: loading ? 0.7 : 1 }]}
            onPress={pickImage}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Icon name="images" size={22} color="#0E7490" />
            <Text style={styles.galleryButtonText}>Gallery</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#0E7490',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingRight: 12,
    paddingLeft: 4,
    paddingVertical: 8,
  },
  headerIconLeft: {
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    marginRight: 30,
    fontFamily: 'Poppins-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'Poppins-Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContainer: {
    width: width - 32,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
    marginVertical: 16,
  },
  placeholderBox: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  placeholderSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0891B2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  stepDivider: {
    height: 1,
    width: 40,
    backgroundColor: '#D1D5DB',
  },
  imageContainer: {
    width: width - 32,
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
    marginVertical: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loadingText: {
    color: '#1F2937',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    marginLeft: 10,
    color: '#B91C1C',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  dismissButton: {
    padding: 4,
  },
  resultContainer: {
    width: '100%',
    marginVertical: 16,
  },
  resultCard: {
    padding: 20,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  resultHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'Poppins-Bold',
  },
  resultIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  iconCircleLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultDetailsContainer: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(254, 226, 226, 0.6)',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  warningText: {
    marginLeft: 10,
    color: '#B91C1C',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  actionButton: {
    marginTop: 20,
    borderRadius: 16,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  footerContainer: {
    width: width,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonsGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cameraButton: {
    width: '68%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0E7490',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  galleryButton: {
    width: '28%',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#0E7490',
  },
  galleryButtonText: {
    color: '#0E7490',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default CounterfeitDetection;
