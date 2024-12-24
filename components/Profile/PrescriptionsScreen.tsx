import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

interface Prescription {
  id: string;
  imageUri: string;
  name: string;
}

const PrescriptionsScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: '1',
      imageUri: 'https://img.freepik.com/free-vector/formal-a4-doctor-prescription-notepad-paper-template-design_1017-56467.jpg?t=st=1735021328~exp=1735024928~hmac=3c4d26864fb0659f61dec3e33b376da1a5a468bd023a84995d8f4b70659f1a43&w=740',
      name: 'Prescription 1',
    },
    {
      id: '2',
      imageUri: 'https://img.freepik.com/free-vector/formal-a4-doctor-prescription-notepad-paper-template-design_1017-56467.jpg?t=st=1735021328~exp=1735024928~hmac=3c4d26864fb0659f61dec3e33b376da1a5a468bd023a84995d8f4b70659f1a43&w=740',
      name: 'Prescription 2',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const deletePrescription = (id: string) => {
    setPrescriptions((prevPrescriptions) =>
      prevPrescriptions.filter((prescription) => prescription.id !== id)
    );
  };

  const openImageModal = (imageUri: string) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const renderItem = ({ item }: { item: Prescription }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.cardText}>{item.name}</Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={() => openImageModal(item.imageUri)}>
            <Icon name="eye" size={24} color="#B3E0B3" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deletePrescription(item.id)}>
            <Icon name="trash" size={24} color="#FFB3B3" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleGoBack} >
          <Icon name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescriptions</Text>
      </View>

      {/* Greeting Text */}
      <Image 
    source={{ uri: 'https://img.freepik.com/free-vector/medical-prescription-concept-illustration_114360-6595.jpg?t=st=1735021181~exp=1735024781~hmac=1a36d63c82fcaaf327cd9ea2ed456e9217a7278d721644c175bc854d0446ae0e&w=740' }} 
    style={styles.greetingImage} 
  />

      {/* Prescription List */}
      <FlatList
        data={prescriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.sectionHeader}>Your Prescriptions</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.text}>No prescriptions yet.</Text>}
        contentContainerStyle={styles.list}
      />

      {/* Modal for Image Preview */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <TouchableWithoutFeedback onPress={closeImageModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedImage || '' }} style={styles.modalImage} />
              <TouchableOpacity onPress={closeImageModal} style={styles.closeButton}>
                <Icon name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginLeft: 10,
    padding: 5,

    borderRadius: 50,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    color: 'black',
    fontWeight: '600',
    textAlign: 'center',
  },
  greetingImage: {
    width: 300,
    height: 280,
    alignItems:'center',
    left:30, // Adjust according to your design
    borderRadius: 8,
  },
  listHeader: {
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5C6BC0',
  },
  text: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  list: {
    top:40,
    paddingTop: 10,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    shadowColor: '#000',
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
  },
});

export default PrescriptionsScreen;
