import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, TouchableWithoutFeedback, Dimensions, TextInput, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

interface Prescription {
  _id: string;
  name: string;
  medication: string;
  dosage: string;
  duration: string;
  doctor: string;
  date: string;
  hospital: string;
  description: string;
  image?: string;
}

const PrescriptionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPrescription, setNewPrescription] = useState({
    name: '',
    doctor: '',
    date: '',
    hospital: '',
    medication: '',
    description: '',
    image: '',
  });

  // Hide tab bar on focus, show on blur
  useFocusEffect(
    React.useCallback(() => {
      // Get all navigation parents to ensure we find the tab navigator
      let parent = navigation;
      
      // Attempt to make tab bar invisible at the component level that renders it
      while (parent) {
        // Set options to hide the tab bar and mark as special screen
        parent.setOptions({ 
          tabBarVisible: false,
          tabBarStyle: { display: 'none' },
          tabBarShowLabel: false,
          tabBarIconStyle: { display: 'none' },
          isPrescriptionsScreen: true // Special flag for TabBar component
        });
        
        // Try to navigate to parent
        parent = parent.getParent();
      }
      
      // Log for debugging
      console.log('PrescriptionsScreen: Tab bar should be completely hidden now');
      
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
            isPrescriptionsScreen: false // Reset the special flag
          });
          parent = parent.getParent();
        }
        
        console.log('PrescriptionsScreen: Tab bar should be visible again');
      };
    }, [navigation])
  );

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPrescriptions(prescriptions);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = prescriptions.filter(
        prescription => 
          prescription.name.toLowerCase().includes(lowercasedQuery) ||
          prescription.doctor.toLowerCase().includes(lowercasedQuery) ||
          prescription.medication.toLowerCase().includes(lowercasedQuery) ||
          prescription.hospital.toLowerCase().includes(lowercasedQuery) ||
          prescription.description.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredPrescriptions(filtered);
    }
  }, [searchQuery, prescriptions]);

  const fetchPrescriptions = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) {
        throw new Error('Username not found');
      }
      
      const response = await axios.get(
        `http://10.0.2.2:5000/prescriptions/${username}`,
        {
          timeout: 10000 // Add timeout to prevent infinite loading
        }
      );
      
      setPrescriptions(response.data);
      setFilteredPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      
      // More specific error messages
      if (error.response) {
        Alert.alert('Server Error', `Error code: ${error.response.status}`);
      } else if (error.request) {
        Alert.alert('Network Error', 'Server is unreachable. Check your connection.');
      } else {
        Alert.alert('Error', 'Failed to fetch prescriptions');
      }
    }
  };
  
  const handleImagePick = async () => {
    try {
      Alert.alert(
        'Upload Prescription',
        'Choose an option',
        [
          { 
            text: 'Take Photo', 
            onPress: () => takePhoto() 
          },
          { 
            text: 'Choose from Gallery', 
            onPress: () => selectFromGallery() 
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error with image selection:', error);
      Alert.alert('Error', 'Failed to open image options');
    }
  };
  
  const processImageResult = (result) => {
    if (result.didCancel || !result.assets?.[0]) return;
      
    const imageUri = result.assets[0].uri;
    const imageBase64 = result.assets[0].base64;
    
    if (!imageBase64) {
      throw new Error('No image data received');
    }
    
    // Check image size - large base64 strings can cause issues
    if (imageBase64.length > 5000000) { // ~5MB
      Alert.alert('Image Too Large', 'Please select a smaller image or reduce the quality.');
      return;
    }
    
    setNewPrescription(prev => ({
      ...prev,
      image: `data:image/jpeg;base64,${imageBase64}`
    }));
    
    setSelectedImage(imageUri);
  };
  
  const takePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.5,
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800,
        saveToPhotos: true
      });
      
      processImageResult(result);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };
  
  const selectFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5,
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800
      });
      
      processImageResult(result);
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const handleUpload = async () => {
    try {
      // Validate required fields
      const requiredFields = ['name', 'doctor', 'medication'];
      const missingFields = requiredFields.filter(field => !newPrescription[field]);
      
      if (missingFields.length > 0) {
        Alert.alert('Missing Information', `Please fill in: ${missingFields.join(', ')}`);
        return;
      }
      
      // Validate image
      if (!newPrescription.image) {
        Alert.alert('Missing Image', 'Please add a prescription image');
        return;
      }
      
      setIsUploading(true);
      const username = await AsyncStorage.getItem('username');
      
      if (!username) {
        throw new Error('Username not found');
      }
      
      const prescriptionData = {
        username,
        ...newPrescription,
      };
      
      // Add proper headers and increase timeout
      const response = await axios.post(
        'http://10.0.2.2:5000/prescriptions', 
        prescriptionData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout for large uploads
        }
      );
      
      if (response.status === 200) {
        setUploadModalVisible(false);
        setNewPrescription({
          name: '',
          doctor: '',
          hospital: '',
          medication: '',
          description: '',
          date: '',
          image: '',
        });
        setSelectedImage(null); // Clear selected image
        await fetchPrescriptions();
        Alert.alert('Success', 'Prescription uploaded successfully');
      }
    } catch (error) {
      console.error('Error posting prescription:', error);
      
      // More specific error messages
      if (error.response) {
        if (error.response.status === 413) {
          Alert.alert('Upload Failed', 'Image file is too large. Please use a smaller image.');
        } else {
          Alert.alert('Server Error', `Error code: ${error.response.status}`);
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'Server is unreachable. Check your connection.');
      } else {
        Alert.alert('Error', 'Failed to upload prescription');
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      Alert.alert(
        'Delete Prescription',
        'Are you sure you want to delete this prescription?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const response = await axios.delete(
                  `http://10.0.2.2:5000/prescriptions/${id}`,
                  {
                    timeout: 10000
                  }
                );
                
                if (response.status === 200) {
                  setPrescriptions(prev => prev.filter(prescription => prescription._id !== id));
                  setFilteredPrescriptions(prev => prev.filter(prescription => prescription._id !== id));
                  Alert.alert('Success', 'Prescription deleted successfully');
                }
              } catch (error) {
                console.error('Error deleting prescription:', error);
                Alert.alert('Error', 'Failed to delete prescription');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in delete dialog:', error);
      Alert.alert('Error', 'Failed to process delete request');
    }
  };

  const renderItem = ({ item }: { item: Prescription }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={styles.prescriptionIconContainer}>
            <Icon name="medical" size={24} color="#1e948b" />
          </View>
          {/* Three dots menu removed */}
        </View>

        <View style={styles.prescriptionInfo}>
          <Text style={styles.prescriptionName}>{item.name} Prescription</Text>
          <View style={styles.infoRow}>
            <Icon name="medical-outline" size={16} color="#1e948b" />
            <Text style={styles.detailText}>{item.medication}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="business-outline" size={16} color="#1e948b" />
            <Text style={styles.detailText}>{item.hospital} Hospital</Text>
          </View>
          <View style={styles.doctorInfo}>
            <View style={styles.infoRow}>
              <Icon name="person" size={16} color="#1e948b" />
              <Text style={styles.doctorText}>Dr. {item.doctor}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="document-text" size={16} color="#1e948b" />
              <Text style={styles.dateText}>{item.description}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.prescriptionIconContainer}
            onPress={() => {
              setSelectedPrescription(item);
              if (item.image) {
                setSelectedImage(item.image);
                setModalVisible(true);
              }
            }}
          >
            <Icon name="eye" size={24} color="#1e948b" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => handleDelete(item._id)}
          >
            <Icon name="trash-outline" size={20} color="#eb4034" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => {
    if (searchVisible) {
      return (
        <View style={styles.searchHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setSearchVisible(false);
              setSearchQuery('');
            }}
          >
            <Icon name="arrow-back" size={24} color="#1e948b" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setSearchQuery('')}
            >
              <Icon name="close-circle" size={20} color="#1e948b" />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#1e948b" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Prescriptions</Text>
          <Text style={styles.headerSubtitle}>View your medical prescriptions</Text>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => setSearchVisible(true)}
        >
          <Icon name="search-outline" size={24} color="#1e948b" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            {searchVisible 
              ? `Results (${filteredPrescriptions.length})` 
              : 'Recent Prescriptions'}
          </Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setUploadModalVisible(true)}
          >
            <Icon name="add" size={24} color="#1e948b" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredPrescriptions}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="document-text-outline" size={60} color="#1e948b" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No prescriptions found' : 'No prescriptions added yet'}
              </Text>
            </View>
          }
        />
      </View>

      <Modal 
        visible={modalVisible} 
        transparent={true} 
        animationType="fade" 
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedImage && (
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.modalImage} 
                  resizeMode="contain" 
                />
              )}
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal 
        visible={uploadModalVisible} 
        transparent={true} 
        animationType="slide" 
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.uploadModalContainer}>
          <View style={styles.uploadModalContent}>
            <View style={styles.uploadModalHeader}>
              <Text style={styles.uploadModalTitle}>Add New Prescription</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <Icon name="close" size={24} color="#1e948b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.uploadForm}>
              <TouchableOpacity 
                style={styles.imageUploadButton}
                onPress={handleImagePick}
                disabled={isUploading}
              >
                <Icon name="camera" size={24} color="#1e948b" />
                <Text style={styles.imageUploadText}>
                  {selectedImage ? 'Change Prescription Image' : 'Upload Prescription Image'}
                </Text>
              </TouchableOpacity>
              
              {selectedImage && (
                <View style={styles.previewContainer}>
                  <Image 
                    source={{ uri: selectedImage }} 
                    style={styles.previewImage} 
                    resizeMode="contain"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Prescription Name</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.name}
                  onChangeText={(text) => setNewPrescription(prev => ({ ...prev, name: text }))}
                  placeholder="Enter prescription name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Doctor Name</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.doctor}
                  onChangeText={(text) => setNewPrescription(prev => ({ ...prev, doctor: text }))}
                  placeholder="Enter doctor's name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Hospital</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.hospital}
                  onChangeText={(text) => setNewPrescription(prev => ({ ...prev, hospital: text }))}
                  placeholder="Enter hospital name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Medications</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.medication}
                  onChangeText={(text) => setNewPrescription(prev => ({ ...prev, medication: text }))}
                  placeholder="Enter medications"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newPrescription.description}
                  onChangeText={(text) => setNewPrescription(prev => ({ ...prev, description: text }))}
                  placeholder="Enter prescription details"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleUpload}>
                <Text style={styles.submitButtonText}>Save Prescription</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Poppins-Regular',
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  searchButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  headerTextContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Poppins-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Poppins-SemiBold',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e6f5f3', // Lighter version of #1e948b
  },
  list: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 16,
    fontFamily: 'Poppins-Regular',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardContent: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prescriptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f5f3', // Lighter version of #1e948b
    justifyContent: 'center',
    alignItems: 'center',
  },
  prescriptionInfo: {
    marginBottom: 12,
  },
  prescriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  detailText: {
    marginLeft: 8,
    color: '#475569',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  doctorInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 12,
  },
  doctorText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
    borderRadius: 8,
    backgroundColor: '#e6f5f3', // Lighter version of #1e948b
  },
  deleteButton: {
    backgroundColor: '#FEE2E2', // Keeping red for delete
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: width * 1.2,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  uploadModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  uploadModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  uploadModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  uploadModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Poppins-SemiBold',
  },
  uploadForm: {
    padding: 20,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6f5f3', // Lighter version of #1e948b
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1e948b', // New primary color
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  imageUploadText: {
    color: '#1e948b', // New primary color
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    fontFamily: 'Poppins-Medium',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Poppins-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1e948b', // New primary color
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  previewContainer: {
    marginBottom: 16,
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8FAFC',
  },
});

export default PrescriptionsScreen;