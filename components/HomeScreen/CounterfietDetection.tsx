import React, { useState } from "react";
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
  ScrollView
} from "react-native";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from "axios";
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const CounterfeitDetection = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to take pictures",
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
      };

      launchImageLibrary(options, response => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          setError('Image picker error: ' + response.errorMessage);
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
        setError('Camera permission denied');
        return;
      }

      const options = {
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
          setError('Camera error: ' + response.errorMessage);
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
        name: imageFile.fileName || 'upload.jpg'
      });
      
      console.log('Uploading image:', imageFile.uri);
      
      const response = await axios.post(
        "http://10.0.2.2:5000/detect-counterfeit", 
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
          timeout: 15000 // 15 seconds timeout
        }
      );
      
      setResult(response.data);
      
    } catch (error) {
      setError('Server error: ' + (error.response?.data?.message || error.message));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Format confidence percentage
  const formatConfidence = (confidence) => {
    if (!confidence && confidence !== 0) return null;
    return `${Math.round(confidence * 100)}%`;
  };

  // Get result color based on authenticity
  const getResultColor = () => {
    if (!result) return '#808080';
    return !result.isCounterfeit ? '#00A896' : '#EF4444';
  };

  // Get result text based on authenticity
  const getResultText = () => {
    if (!result) return '';
    return !result.isCounterfeit ? 'AUTHENTIC' : 'COUNTERFEIT';
  };

  // Get result details to display
  const getResultDetails = () => {
    if (!result) return null;
    
    const details = [];
    
    if (result.confidence) {
      details.push({
        label: 'Confidence',
        value: formatConfidence(result.confidence),
        icon: 'analytics'
      });
    }
    
    if (result.currencyType) {
      details.push({
        label: 'Medicine Type',
        value: result.currencyType,
        icon: 'medkit'
      });
    }
    
    if (result.denomination) {
      details.push({
        label: 'Dosage',
        value: result.denomination,
        icon: 'fitness'
      });
    }
    
    if (result.features && result.features.length > 0) {
      details.push({
        label: 'Features Detected',
        value: Array.isArray(result.features) ? result.features.join(', ') : result.features,
        icon: 'scan'
      });
    }
    
    return details;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="shield-checkmark" size={32} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Medicine Authenticator</Text>
        </View>
        <Text style={styles.headerSubtitle}>Verify medication authenticity instantly</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {!image ? (
            <View style={styles.placeholderContainer}>
              <View style={styles.placeholderBox}>
                <Icon name="medical" size={80} color="#6B7280" />
                <Text style={styles.placeholderText}>
                  Upload or take a photo of medicine packaging to verify
                </Text>
                <View style={styles.placeholderIconsRow}>
                  <Icon name="camera" size={24} color="#6B7280" style={styles.placeholderIcon} />
                  <Icon name="arrow-forward" size={16} color="#6B7280" style={styles.placeholderIcon} />
                  <Icon name="scan-outline" size={24} color="#6B7280" style={styles.placeholderIcon} />
                  <Icon name="arrow-forward" size={16} color="#6B7280" style={styles.placeholderIcon} />
                  <Icon name="checkmark-circle" size={24} color="#6B7280" style={styles.placeholderIcon} />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.loadingText}>Analyzing...</Text>
                </View>
              )}
            </View>
          )}
          
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={24} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError(null)} style={styles.dismissButton}>
                <Icon name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
          
          {result && !loading && (
            <View style={styles.resultContainer}>
              <View style={[styles.resultBox, { backgroundColor: !result.isCounterfeit ? '#E8F8F5' : '#FEF2F2' }]}>
                <View style={styles.resultHeaderContainer}>
                  <View style={[styles.resultIndicator, { backgroundColor: getResultColor() }]}>
                    <Icon 
                      name={!result.isCounterfeit ? "checkmark-circle" : "alert-circle"} 
                      size={24} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <Text style={[styles.resultText, { color: getResultColor() }]}>
                    {getResultText()}
                  </Text>
                </View>
                
                <View style={styles.iconContainer}>
                  <Icon 
                    name={!result.isCounterfeit ? "shield-checkmark" : "warning"} 
                    size={64} 
                    color={getResultColor()} 
                  />
                </View>
                
                <View style={styles.resultDetailsContainer}>
                  {getResultDetails()?.map((detail, index) => (
                    <View key={index} style={styles.detailRow}>
                      <View style={styles.detailLabelContainer}>
                        <Icon name={detail.icon || 'information-circle'} size={18} color="#00786A" style={styles.detailIcon} />
                        <Text style={styles.detailLabel}>{detail.label}:</Text>
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
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#00A896' }]}
          onPress={takePicture}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Icon name="camera" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#05668D' }]}
          onPress={pickImage}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Icon name="images" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#02C39A',
    ...Platform.select({
      ios: {
        shadowColor: '#00786A',
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
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginLeft: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1, 
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  placeholderText: {
    marginTop: 20,
    marginBottom: 24,
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 16,
  },
  placeholderIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  placeholderIcon: {
    marginHorizontal: 6,
  },
  imageContainer: {
    width: width * 0.9,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
    backgroundColor: '#FFFFFF',
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    marginLeft: 10,
    color: '#B91C1C',
    flex: 1,
    fontSize: 14,
  },
  dismissButton: {
    padding: 4,
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resultBox: {
    padding: 20,
    width: '100%',
    borderRadius: 20,
  },
  resultHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
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
  },
  iconContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  resultDetailsContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 14,
    backgroundColor: 'rgba(254, 226, 226, 0.8)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  warningText: {
    marginLeft: 10,
    color: '#B91C1C',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    width: '48%',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default CounterfeitDetection;