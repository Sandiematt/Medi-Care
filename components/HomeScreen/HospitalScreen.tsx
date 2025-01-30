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
  StatusBar,
  ScrollView,
  Dimensions, 
  Alert,
  Linking
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HospitalScreen = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'General', 'Neurology', 'Cardiology', 'Pediatrics'];
  const services = [
    {
      id: '1',
      title: 'St Johns Hospital',
      image: 'https://content.jdmagicbox.com/v2/comp/bangalore/y5/080pxx80.xx80.220929233004.t9y5/catalogue/st-john-hospital-bangalore-hospitals-MXDhWWs4Tm.jpg',
      specialty: 'General Medicine',
      rating: 4.5,
      reviews: 128,
      address: '123 Health St, City Center',
      phone: '+1234567890',
      category: 'General',
      description: 'Comprehensive medical care for all age groups',
      workingHours: '24/7',
      emergency: true,
      website: 'https://www.stjohns.in'
    },
    {
      id: '2',
      title: 'Sagar Hospital',
      image: 'https://www.easytoken.in/uploads/2eff77f995ff8399b178b1710bb47288.jpeg',
      specialty: 'Neurology',
      rating: 4.8,
      reviews: 95,
      address: '456 Neuro Rd, City Center',
      phone: '+0987654321',
      category: 'Neurology',
      description: 'Advanced neurological treatments and diagnostics',
      workingHours: '8:00 AM - 10:00 PM',
      emergency: true,
      website: 'https://www.sagarhospitals.in'
    },
    {
      id: '3',
      title: 'Manipal Hospital',
      image: 'https://static.wixstatic.com/media/c3430c_2d5ebd3a715b4c1e8271c76fce1bf5ef~mv2.jpg/v1/fill/w_560,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/c3430c_2d5ebd3a715b4c1e8271c76fce1bf5ef~mv2.jpg',
      specialty: 'Cardiology',
      rating: 4.6,
      reviews: 156,
      address: '789 Heart Ave, City Center',
      phone: '+1122334455',
      category: 'Cardiology',
      description: 'Specialized cardiac care and prevention',
      workingHours: '24/7',
      emergency: true,
      website: 'https://www.manipalhospitals.com'
    },
    {
      id: '4',
      title: 'Apollo Hospital',
      image: 'https://cdn.apollohospitals.com/bangalore/2021/07/Apollo-bannerghattaroad.jpg',
      specialty: 'Pediatrics',
      rating: 4.7,
      reviews: 112,
      address: '101 Kids Lane, City Center',
      phone: '+5566778899',
      category: 'Pediatrics',
      description: 'Comprehensive child healthcare services',
      workingHours: '8:00 AM - 8:00 PM',
      emergency: false,
      website: 'https://www.apollohospitals.com'
    }
  ];
  const filteredServices = services.filter(service => 
    (selectedCategory === 'All' || service.category === selectedCategory) &&
    service.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FFD700' : '#CBD5E0'}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const renderCategoryChip = (category: string | number | bigint | boolean | ((prevState: string) => string) | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined) => (
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

  const handleAppointment = async (website: any) => {
    console.log("Opening website: ", website);  // Log the website URL
    try {
      const supported = await Linking.openURL(website);
      if (supported) {
        await Linking.openURL(website);
      } else {
        Alert.alert("Error", "Sorry, we couldn't open the hospital website.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while opening the website.");
    }
  };
  
  

  const handlePhoneCall = async (phone: any) => {
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      Alert.alert("Error", "Couldn't initiate phone call.");
    }
  };

  const renderServiceCard = ({ item }) => (
    <TouchableOpacity style={styles.cardContainer}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      {item.emergency && (
        <View style={styles.emergencyBadge}>
          <Text style={styles.emergencyText}>24/7 Emergency</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.ratingRow}>
            {renderRatingStars(item.rating)}
            <Text style={styles.reviewCount}>({item.reviews})</Text>
          </View>
        </View>

        <View style={styles.specialtyContainer}>
          <Ionicons name="medical" size={18} color="#38B2AC" />
          <Text style={styles.cardSpecialty}>{item.specialty}</Text>
        </View>

        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={18} color="#4A5568" />
            <Text style={styles.contactText}>{item.address}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={18} color="#4A5568" />
            <Text style={styles.contactText}>{item.phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="time-outline" size={18} color="#4A5568" />
            <Text style={styles.contactText}>{item.workingHours}</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>{item.description}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.appointmentButton}
            onPress={()=>handleAppointment(item.website)}
          >
            <Text style={styles.appointmentButtonText}>Book Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => handlePhoneCall(item.phone)}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospital Services</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#2D3748" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospitals..."
          placeholderTextColor="#A0AEC0"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map(renderCategoryChip)}
        </ScrollView>
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
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
  },
  filterButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#2D3748',
    fontSize: 16,
    marginLeft: 10,
  },
  searchIcon: {
    color: '#4A5568',
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginRight: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategoryChip: {
    backgroundColor: '#38B2AC',
    borderColor: '#38B2AC',
  },
  categoryChipText: {
    color: '#4A5568',
    fontWeight: '600',
    fontSize: 15,
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  emergencyBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#E53E3E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    marginLeft: 5,
    color: '#718096',
    fontSize: 14,
  },
  specialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardSpecialty: {
    fontSize: 16,
    color: '#38B2AC',
    fontWeight: '600',
    marginLeft: 8,
  },
  contactInfo: {
    backgroundColor: '#F7FAFC',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 12,
    color: '#4A5568',
    fontSize: 14,
    flex: 1,
  },
  cardDescription: {
    color: '#718096',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentButton: {
    flex: 1,
    backgroundColor: '#38B2AC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 10,
  },
  appointmentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  callButton: {
    backgroundColor: '#4A5568',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HospitalScreen;