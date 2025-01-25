import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  TextInput, 
  StatusBar 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const HospitalScreen = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'General', 'Neurology', 'Cardiology', 'Pediatrics'];

  const services = [
    {
      id: '1',
      title: 'General Care Center',
      image: 'https://img.freepik.com/free-photo/clean-empty-hospital-ward-ready-receive-patients-reflecting-modern-medical-care_91128-4460.jpg',
      specialty: 'General Medicine',
      address: '123 Health St, City Center',
      phone: '+1234567890',
      category: 'General',
      description: 'Comprehensive medical care for all age groups',
    },
    {
      id: '2',
      title: 'NeuroSync Clinic',
      image: 'https://img.freepik.com/free-photo/clean-empty-hospital-ward-ready-receive-patients-reflecting-modern-medical-care_91128-4460.jpg',
      specialty: 'Neurology',
      address: '456 Neuro Rd, City Center',
      phone: '+0987654321',
      category: 'Neurology',
      description: 'Advanced neurological treatments and diagnostics',
    },
    {
      id: '3',
      title: 'HeartCare Institute',
      image: 'https://img.freepik.com/free-photo/clean-empty-hospital-ward-ready-receive-patients-reflecting-modern-medical-care_91128-4460.jpg',
      specialty: 'Cardiology',
      address: '789 Heart Ave, City Center',
      phone: '+1122334455',
      category: 'Cardiology',
      description: 'Specialized cardiac care and prevention',
    },
    {
      id: '4',
      title: 'PediaCare Center',
      image: 'https://img.freepik.com/free-photo/clean-empty-hospital-ward-ready-receive-patients-reflecting-modern-medical-care_91128-4460.jpg',
      specialty: 'Pediatrics',
      address: '101 Kids Lane, City Center',
      phone: '+5566778899',
      category: 'Pediatrics',
      description: 'Comprehensive child healthcare services',
    }
  ];

  const filteredServices = services.filter(service => 
    (selectedCategory === 'All' || service.category === selectedCategory) &&
    service.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderCategoryChip = (category) => (
    <TouchableOpacity 
      key={category}
      onPress={() => setSelectedCategory(category)}
      style={[
        styles.categoryChip, 
        selectedCategory === category && styles.selectedCategoryChip
      ]}
    >
      <Text style={[
        styles.categoryChipText, 
        selectedCategory === category && styles.selectedCategoryChipText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderServiceCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardDetails}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSpecialty}>{item.specialty}</Text>
        
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={18} color="#4A5568" />
            <Text style={styles.contactText}>{item.address}</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={18} color="#4A5568" />
            <Text style={styles.contactText}>{item.phone}</Text>
          </View>
        </View>
        
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospital Services</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospitals..."
          placeholderTextColor="#A0AEC0"
          value={search}
          onChangeText={setSearch}
        />
        <Ionicons name="search-outline" size={20} style={styles.searchIcon} />
      </View>

      <View style={styles.categoryContainer}>
        {categories.map(renderCategoryChip)}
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  placeholder: {
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#2D3748',
    fontSize: 16,
  },
  searchIcon: {
    color: '#4A5568',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategoryChip: {
    backgroundColor: '#38B2AC',
  },
  categoryChipText: {
    color: '#4A5568',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    alignItems: 'center',
    elevation: 1,
  },
  cardImage: {
    width: 100,
    height: 120,
    borderRadius: 10,
    marginRight: 15,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 5,
  },
  cardSpecialty: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 10,
  },
  contactInfo: {
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  contactText: {
    marginLeft: 10,
    color: '#4A5568',
    fontSize: 14,
  },
  cardDescription: {
    color: '#718096',
    fontSize: 14,
  },
});

export default HospitalScreen;