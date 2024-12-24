import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { useNavigation } from '@react-navigation/native';

const HospitalScreen = () => {
  const navigation = useNavigation();

  const [search, setSearch] = useState('');

  const services = [
    {
      id: '1',
      title: 'General Care',
      image: 'https://img.freepik.com/free-photo/clean-empty-hospital-ward-ready-receive-patients-reflecting-modern-medical-care_91128-4460.jpg',
      specialty: 'General Medicine',
      address: '123 Health St, City Center',
      phone: '+1234567890',
      rating: 4.5,
    },
    {
      id: '2',
      title: 'Neurology Clinic',
      image: 'https://img.freepik.com/free-photo/clean-empty-hospital-ward-ready-receive-patients-reflecting-modern-medical-care_91128-4460.jpg',
      specialty: 'Neurology',
      address: '456 Neuro Rd, City Center',
      phone: '+0987654321',
    },
    {
      id: '3',
      title: 'Cardiology Clinic',
      image: 'https://img.freepik.com/free-photo/clean-empty-hospital-ward-ready-receive-patients-reflecting-modern-medical-care_91128-4460.jpg',
      specialty: 'Cardiology',
      address: '789 Heart Ave, City Center',
      phone: '+1122334455',
    },
  ];

  const renderItem = ({ item }: { item: { id: string; title: string; image: string; specialty: string; address: string; phone: string; rating?: number; } }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="medkit-outline" size={18} color="#2563EB" />
            <Text style={styles.detailText}>{item.specialty}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={18} color="#2563EB" />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={18} color="#2563EB" />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backIconContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={30} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hospital Services</Text>
      </View>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for services"
          value={search}
          onChangeText={setSearch}
        />
        <Ionicons 
          name="search-outline" 
          size={20} 
          color="#2563EB" 
          style={styles.searchIcon}
        />
      </View>
      <Text style={styles.subHeader}>Find the best care near you</Text>
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backIconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 20,
    color: 'black',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  searchBar: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    fontFamily: 'Poppins-Regular',
  },
  searchIcon: {
    position: 'absolute',
    right: 30,
    top: 15,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 16,
    marginTop: 5,
  },
  list: {
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
  details: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
});

export default HospitalScreen;
