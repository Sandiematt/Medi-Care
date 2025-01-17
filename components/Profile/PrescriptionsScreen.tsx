import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

interface Prescription {
  id: string;
  imageUri: string;
  name: string;
  date: string;
  doctor: string;
  medication: string;
  dosage: string;
  duration: string;
}

const { width } = Dimensions.get('window');

const PrescriptionsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [prescriptions] = useState<Prescription[]>([
    {
      id: '1',
      imageUri: 'https://img.freepik.com/free-vector/formal-a4-doctor-prescription-notepad-paper-template-design_1017-56467.jpg',
      name: 'General Checkup Prescription',
      date: 'Jan 15, 2025',
      doctor: 'Dr. Sarah Johnson',
      medication: 'Amoxicillin',
      dosage: '500mg',
      duration: '7 days'
    },
    {
      id: '2',
      imageUri: 'https://img.freepik.com/free-vector/formal-a4-doctor-prescription-notepad-paper-template-design_1017-56467.jpg',
      name: 'Follow-up Prescription',
      date: 'Jan 10, 2025',
      doctor: 'Dr. Michael Chen',
      medication: 'Ibuprofen',
      dosage: '400mg',
      duration: '5 days'
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderItem = ({ item }: { item: Prescription }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => setModalVisible(true)}
      activeOpacity={0.9}
    >
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
          <Text style={styles.prescriptionName}>{item.name}</Text>
          
          <View style={styles.medicationDetails}>
            <View style={styles.detailBox}>
              <Icon name="medical-outline" size={16} color="#4F46E5" />
              <Text style={styles.detailText}>{item.medication}</Text>
            </View>
            <View style={styles.detailBox}>
              <Icon name="timer-outline" size={16} color="#4F46E5" />
              <Text style={styles.detailText}>{item.dosage}</Text>
            </View>
            <View style={styles.detailBox}>
              <Icon name="calendar-outline" size={16} color="#4F46E5" />
              <Text style={styles.detailText}>{item.duration}</Text>
            </View>
          </View>

          <View style={styles.doctorInfo}>
            <View style={styles.infoRow}>
              <Icon name="person" size={16} color="#4F46E5" />
              <Text style={styles.doctorText}>{item.doctor}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="time" size={16} color="#4F46E5" />
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="download-outline" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share-social-outline" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
            <Icon name="trash-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const SummaryBox = ({ icon, title, value }: { icon: string; title: string; value: string }) => (
    <View style={styles.summaryBox}>
      <View style={styles.summaryIconContainer}>
        <Icon name={icon} size={20} color="#4F46E5" />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryTitle}>{title}</Text>
    </View>
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

      <View style={styles.summaryContainer}>
        <SummaryBox icon="calendar" title="This Month" value="3" />
        <SummaryBox icon="medical" title="Medications" value="5" />
        <SummaryBox icon="pulse" title="Next Refill" value="2d" />
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Recent Prescriptions</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="options-outline" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={prescriptions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
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
              <Image source={{ uri: prescriptions[0].imageUri }} style={styles.modalImage} resizeMode="contain" />
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#FFF" />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 5,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  summaryTitle: {
    fontSize: 12,
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
  filterButton: {
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
  medicationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailText: {
    marginLeft: 6,
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
  },
  doctorInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
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
});

export default PrescriptionsScreen;