import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, TouchableWithoutFeedback, Dimensions, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
  description:string;
}

const PrescriptionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false); // Added for upload modal visibility
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newPrescription, setNewPrescription] = useState({
    name: '',
    doctor: '',
    date: '', // Add a date field if you have one
    hospital: '',
    medication: '',
    description: '',
    image: '', // Include image if necessary
  });

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        const response = await fetch(`http://10.0.2.2:5000/prescriptions/${username}`);
        const data = await response.json();
        setPrescriptions(data);
      } else {
        console.error('Username not found');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };


  const handleUpload = async () => {
    try {
      // Prepare the data to be sent
      const prescriptionData = {
        username: await AsyncStorage.getItem('username'),
        name: newPrescription.name,
        date: newPrescription.date, // Add a date field if you have one
        doctor: newPrescription.doctor,
        hospital: newPrescription.hospital,
        medication: newPrescription.medication,
        description: newPrescription.description,
        image: newPrescription.image, // Include image if necessary
      };
      
  
      // Check if username exists
      if (prescriptionData.username) {
        // Send a POST request to the server to save the new prescription using axios
        const response = await axios.post('http://10.0.2.2:5000/prescriptions', prescriptionData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.status === 200) {
          // Successfully posted, close the modal and fetch updated prescriptions
          setUploadModalVisible(false);
          setNewPrescription({
            name: '',
            doctor: '',
            hospital: '',
            medication: '',
            description: '',
            date: '', // Reset date
            image: '', // Reset image
          }); // Reset form fields
          fetchPrescriptions(); // Fetch the updated prescriptions list
        }
      } else {
        console.error('Username not found');
      }
    } catch (error) {
      console.error('Error posting prescription:', error);
    }
  };

  const handleDelete = async (_id: string) => {
    try {
      const response = await axios.delete(`http://10.0.2.2:5000/prescriptions/${_id}`);
      
      
      if (response.status === 200) {
        // Remove the deleted prescription from the state
        setPrescriptions((prevPrescriptions) =>
          prevPrescriptions.filter((prescription) => prescription._id !== _id)
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error deleting prescription:', error.response ? error.response.data : error.message);
      } else {
        console.error('Error deleting prescription:', error);
      }
    }
  };

  const renderItem = ({ item }: { item: Prescription }) => (
    <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)} activeOpacity={0.9}>
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={styles.prescriptionIconContainer}>
            <Icon name="medical" size={24} color="#4F46E5" />
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Icon name="ellipsis-horizontal" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.prescriptionInfo}>
          <Text style={styles.prescriptionName}>{item.name} Prescription</Text>
          <View style={styles.infoRow}>
            <Icon name="medical-outline" size={16} color="#4F46E5" />
            <Text style={styles.detailText}>{item.medication}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="business-outline" size={16} color="#4F46E5" />
            <Text style={styles.detailText}>{item.hospital} Hospital</Text>
          </View>
          <View style={styles.doctorInfo}>
            <View style={styles.infoRow}>
              <Icon name="person" size={16} color="#4F46E5" />
              <Text style={styles.doctorText}>Dr.{item.doctor}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="document-text" size={16} color="#4F46E5" />
              <Text style={styles.dateText}>{item.description}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton} >
            <Icon name="download-outline" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item._id)}>
            <Icon name="trash-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Prescriptions</Text>
          <Text style={styles.headerSubtitle}>View your medical prescriptions</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search-outline" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Recent Prescriptions</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setUploadModalVisible(true)}>
            <Icon name="add" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={prescriptions}
          renderItem={renderItem}
          keyExtractor={(item) => item._id} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </View>

      {/* Image Preview Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedImage || '' }} style={styles.modalImage} resizeMode="contain" />
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Upload Modal */}
      <Modal visible={uploadModalVisible} transparent={true} animationType="slide" onRequestClose={() => setUploadModalVisible(false)}>
        <View style={styles.uploadModalContainer}>
          <View style={styles.uploadModalContent}>
            <View style={styles.uploadModalHeader}>
              <Text style={styles.uploadModalTitle}>Add New Prescription</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <Icon name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.uploadForm}>
              <TouchableOpacity style={styles.imageUploadButton}>
                <Icon name="camera" size={24} color="#4F46E5" />
                <Text style={styles.imageUploadText}>Upload Prescription Image</Text>
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Prescription Name</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.name}
                  onChangeText={(text) => setNewPrescription({ ...newPrescription, name: text })}
                  placeholder="Enter prescription name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Doctor Name</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.doctor}
                  onChangeText={(text) => setNewPrescription({ ...newPrescription, doctor: text })}
                  placeholder="Enter doctor's name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Hospital</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.hospital}
                  onChangeText={(text) => setNewPrescription({ ...newPrescription, hospital: text })}
                  placeholder="Enter hospital name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Medications</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.medication}
                  onChangeText={(text) => setNewPrescription({ ...newPrescription, medication: text })}
                  placeholder="Enter medications"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newPrescription.description}
                  onChangeText={(text) => setNewPrescription({ ...newPrescription, description: text })}
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
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
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  list: {
    paddingBottom: 20,
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
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    padding: 8,
    borderRadius: 20,
  },
  prescriptionInfo: {
    marginBottom: 12,
  },
  prescriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
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
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
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
    backgroundColor: '#EEF2FF',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
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
  },
  uploadForm: {
    padding: 20,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  imageUploadText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
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
  },
});

export default PrescriptionsScreen;