import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const PrescriptionPage: React.FC = () => {
  const navigation = useNavigation();
  const [image, setImage] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // State to handle modal visibility
  const [tempLink, setTempLink] = useState(''); // Temporary state to hold the link from user input

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Function to handle image picking
  const handleUpload = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.error('ImagePicker Error: ', response.errorMessage);
        } else {
          setImage(response.assets && response.assets[0].uri ? response.assets[0].uri : null);
        }
      }
    );
  };

  // Function to handle sharing the link
  const handleShareLink = () => {
    setIsModalVisible(true); 
  };

  // Function to handle saving the link
  const handleSaveLink = () => {
    if (tempLink) {
      setLink(tempLink); // Save the link
      console.log('Link saved:', tempLink);
      setIsModalVisible(false); // Close modal
    } else {
      console.log('No link entered');
    }
  };

  const handleSave = () => {
    if (image && link) {
      console.log('Image and Link saved:', image, link);
      Alert.alert('Saved', 'Both image and link have been saved successfully!');
    } else if (image) {
      console.log('Image saved:', image);
      Alert.alert('Image Saved', 'The image has been saved successfully!');
    } else if (link) {
      console.log('Link saved:', link);
      Alert.alert('Link Saved', 'The link has been saved successfully!');
    } else {
      Alert.alert('No Content', 'Please upload an image or paste a link before saving.');
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.backIconContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
      </View>
      <Text style={styles.locationText}>📍 Bengaluru, Karnataka</Text>

      <Text style={styles.sectionTitle}>Pharmacy Nearby</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pharmacyList}>
        <View style={styles.pharmacyCard}>
          <Image
            source={{ uri: 'https://img.freepik.com/free-photo/female-pharmacist-checking-medicine-with-clipboard_23-2150359116.jpg?semt=ais_hybrid' }}
            style={styles.pharmacyImage}
          />
          <Text style={styles.pharmacyName}>Virgo Pharma</Text>
          <Text style={styles.pharmacyDetails}>2km away - ⭐ 4.5 (17 reviews)</Text>
        </View>
        <View style={styles.pharmacyCard}>
          <Image
            source={{ uri: 'https://cdn.apollohospitals.com/apollohospitals/apollo-prohealth/ah/explore-mobile.jpg' }}
            style={styles.pharmacyImage}
          />
          <Text style={styles.pharmacyName}>Virgo Pharma</Text>
          <Text style={styles.pharmacyDetails}>2km away - ⭐ 4.5 (17 reviews)</Text>
        </View>
        <View style={styles.pharmacyCard}>
          <Image
            source={{ uri: 'https://web-assets.bcg.com/71/52/147fa0a94684b7568266ecaa4763/ooking-ahead-the-outlook-for-australias-private-hospitals.jpg' }}
            style={styles.pharmacyImage}
          />
          <Text style={styles.pharmacyName}>Virgo Pharma</Text>
          <Text style={styles.pharmacyDetails}>2km away - ⭐ 4.5 (17 reviews)</Text>
        </View>
      </ScrollView>

      <Text style={styles.uploadTitle}>Upload Prescription</Text>
      <Text style={styles.uploadSubtitle}>
        We will show the pharmacy that got all the medicine.
      </Text>

      {/* Display uploaded image or link description */}
      {image && (
        <Text style={styles.uploadedDescription}>Image selected: {image}</Text>
      )}

      {link && (
        <Text style={styles.uploadedDescription}>Link: {link}</Text>
      )}

      <View style={styles.uploadOptions}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleShareLink}>
          <Text style={styles.uploadButtonText}>🔗 Share Link</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.uploadButtonText}>📤 Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Continue button will only be enabled if there's either an image or a link */}
      <TouchableOpacity
        style={[styles.continueButton, { opacity: image || link ? 1 : 0.5 }]}
        onPress={handleSave}
        disabled={!image && !link}>
        <Text style={styles.continueButtonText}>Save</Text>
      </TouchableOpacity>

      {/* Modal for inputting link */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Link</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Paste your link here"
              value={tempLink}
              onChangeText={setTempLink}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
              <Button title="Add" onPress={handleSaveLink} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  backIconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    marginBottom: 40,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    top: 20,
    left: 60,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 60,
  },
  pharmacyList: {
    flexDirection: 'row',
  },
  pharmacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    width: 150,
    height: 180,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pharmacyImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  pharmacyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  pharmacyDetails: {
    fontSize: 12,
    color: '#6C757D',
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
    top: 20,
  },
  uploadedDescription: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    bottom: 40,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 90,
    top: 20,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default PrescriptionPage;
