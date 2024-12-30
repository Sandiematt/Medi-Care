import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker'; // Image picker for camera
import TextRecognition from '@react-native-ml-kit/text-recognition'; // Firebase ML Kit for OCR
import Icon from 'react-native-vector-icons/FontAwesome'; // Camera icon

const PillIdentifierScreen = () => {
  const [imprint, setImprint] = useState('');
  const [ocrResult, setOcrResult] = useState('');

  const handleCameraScan = async () => {
    launchCamera({ mediaType: 'photo' }, async (response) => {
      if (response.assets && response.assets[0].uri) {
        const imageUri = response.assets[0].uri;

        try {
          const result = await TextRecognition.recognize(imageUri);
          const recognizedText = result.text || '';

          console.log('OCR Result:', recognizedText);
          setOcrResult(recognizedText);
          setImprint(recognizedText);
        } catch (error) {
          console.error('OCR Error:', error);
        }
      } else {
        console.log('User canceled the scan');
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon  style={styles.medkiticon} name="medkit" size={40} color="#6200EE" /> 
        <Text style={styles.headerText}>Pill Identifier</Text>
      </View>

      {/* Input Form Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Enter Pill Details</Text>
      
        <TextInput
          style={styles.input}
          placeholder="Enter Imprint or Pill Name"
          placeholderTextColor="#BEBEBE"
          value={imprint}
          onChangeText={setImprint}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => console.log('Search Logic Here')}>
          <Icon name="search" size={20} color="#FFF" style={styles.icon} />
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* OR Divider */}
      <Text style={styles.orText}>OR</Text>

      {/* Camera Scan Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Scan Pill Using Camera</Text>
        <TouchableOpacity style={styles.scanButton} onPress={handleCameraScan}>
          <Icon name="camera" size={24} color="#FFF" style={styles.icon} />
          <Text style={styles.buttonText}>Scan Now</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions for Camera Scan */}
      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Step-by-Step Instructions</Text>
        <View style={styles.stepsContainer}>
          <Text style={styles.instructionText}>1. Hold your phone steady and point it at the pill.</Text>
          <Text style={styles.instructionText}>2. Make sure the pill is centered within the camera frame.</Text>
          <Text style={styles.instructionText}>3. Ensure the imprint on the pill is clearly visible.</Text>
          <Text style={styles.instructionText}>4. Tap the "Scan Now" button to capture the image.</Text>
          <Text style={styles.instructionText}>5. Wait for the text recognition to process and display the result.</Text>
        </View>
      </View>

      {/* OCR Result Section */}
      {ocrResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>OCR Result</Text>
          <Text style={styles.resultText}>{ocrResult}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    flexDirection: 'row',  // Align icon and text in a row
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'center',  // Center the content
  },
  medkiticon: {
    bottom:4,  // Add space between the icon and text
  },
  headerText: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginLeft: 10,  // Add space between the icon and text
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#555',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    padding: 12,
    color: '#333',
    fontFamily: 'Poppins-Normal',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scanButton: {
    backgroundColor: '#24BAAC',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
  },
  orText: {
    fontSize: 16,
    fontFamily: 'Poppins-Normal',
    color: '#777',
    textAlign: 'center',
    marginVertical: 12,
  },
  resultContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#555',
  },
  icon: {
    marginRight: 1,
    bottom: 2,
  },
  instructionCard: {
    backgroundColor: '#F1F1F1',  // Light Gray background for better contrast
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  instructionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#24BAAC',  // Cyan Green color for the title
    marginBottom: 12,
  },
  stepsContainer: {
    marginLeft: 10,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#24BAAC',  // Cyan Green color for instructions
    marginVertical: 5,
  },
});

export default PillIdentifierScreen;
