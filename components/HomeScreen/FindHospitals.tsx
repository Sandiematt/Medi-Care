import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
  PermissionsAndroid
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBt2CpliWDqNGoSJdgGP_4OoOlp3xu_ATk';

// Filter options
const filterOptions = [
  'All',
  'Emergency',
  'Cardiology',
  'Pediatrics',
  'Surgery',
  'Orthopedics'
];

// Define types for hospital data
interface Location {
  latitude: number;
  longitude: number;
}

interface Hospital {
  id: string;
  name: string;
  rating: number;
  distance: string;
  address: string;
  specialties: string[];
  image: any;
  hasImage: boolean;
  contact: string;
  website: string;
  hours: string;
  location: Location;
}

const FindHospitals = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Create refs to hold temporary filter values
  const tempSortByRef = useRef(sortBy);
  const tempActiveFilterRef = useRef(activeFilter);

  // Hide tab bar on focus, show on blur
  useFocusEffect(
    React.useCallback(() => {
      // Get all parent navigators
      let parent = navigation.getParent();
      
      // Attempt to make tab bar invisible at the component level that renders it
      while (parent) {
        // Set options to completely hide the tab bar
        parent.setOptions({
          tabBarVisible: false,
          tabBarStyle: { display: 'none' },
          tabBarShowLabel: false,
          tabBarIconStyle: { display: 'none' },
          isFindHospitalsScreen: true // Special flag for TabBar component
        });
        parent = parent.getParent();
      }
      console.log('FindHospitals: Tab bar completely hidden');

      return () => {
        // Reset all the navigation parents to show tab bar again
        let parentRestore = navigation.getParent();
        while (parentRestore) {
          parentRestore.setOptions({
            tabBarVisible: true,
            tabBarStyle: undefined,
            tabBarShowLabel: true,
            tabBarIconStyle: undefined,
            isFindHospitalsScreen: false // Reset the special flag
          });
          parentRestore = parentRestore.getParent();
        }
        console.log('FindHospitals: Tab bar restored');
      };
    }, [navigation])
  );

  // Utility function to convert degrees to radians
  const deg2rad = useCallback((deg: number) => {
    return deg * (Math.PI / 180);
  }, []);

  // Calculate distance using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }, [deg2rad]);

  // Fetch nearby hospitals using Google Places API
  const fetchNearbyHospitals = useCallback(async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=15000&type=hospital&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        const hospitalsData = await Promise.all(
          data.results.map(async (place: any) => {
            // Get more details for each place
            const detailsResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website,opening_hours,photos&key=${GOOGLE_MAPS_API_KEY}`
            );
            const detailsData = await detailsResponse.json();
            const details = detailsData.result || {};
            
            // Calculate distance
            const distance = calculateDistance(
              latitude, 
              longitude, 
              place.geometry.location.lat, 
              place.geometry.location.lng
            );
            
            // Get photo reference if available
            let photoUrl = null;
            if (place.photos && place.photos.length > 0) {
              photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;
            }
            
            // Default image if no photo is available
            const defaultImages = [
              require('../../assets/images/banner1.png'),
              require('../../assets/images/banner2.png'),
              require('../../assets/images/bannerr2.png'),
              require('../../assets/images/bannerr3.png'),
              require('../../assets/images/banner3.jpg'),
            ];
            
            // Determine specialties based on types or just set default ones
            let specialties = ['Hospital'];
            if (place.types) {
              if (place.types.includes('hospital')) specialties.push('General');
              if (place.types.includes('doctor')) specialties.push('Medicine');
              if (place.name.toLowerCase().includes('emergency')) specialties.push('Emergency');
              if (place.name.toLowerCase().includes('cardio')) specialties.push('Cardiology');
              if (place.name.toLowerCase().includes('pediatric')) specialties.push('Pediatrics');
              if (place.name.toLowerCase().includes('ortho')) specialties.push('Orthopedics');
              if (place.name.toLowerCase().includes('surgery')) specialties.push('Surgery');
            }
            
            // Remove duplicates
            specialties = [...new Set(specialties)];
            
            return {
              id: place.place_id,
              name: place.name,
              rating: place.rating || 0,
              distance: `${distance.toFixed(1)} km`,
              address: place.vicinity,
              specialties: specialties,
              image: photoUrl ? { uri: photoUrl } : defaultImages[Math.floor(Math.random() * defaultImages.length)],
              hasImage: !!photoUrl,
              contact: details.formatted_phone_number || 'N/A',
              website: details.website || 'N/A',
              hours: details.opening_hours?.weekday_text ? details.opening_hours.weekday_text[0] : '24/7',
              location: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng
              }
            };
          })
        );
        
        setHospitals(hospitalsData);
        setFilteredHospitals(hospitalsData);
      } else {
        throw new Error('Failed to fetch hospitals');
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      Alert.alert('Error', 'Unable to fetch nearby hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [calculateDistance]);

  // Get location for Android
  const getAndroidLocation = useCallback(() => {
    try {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          fetchNearbyHospitals(latitude, longitude);
        },
        (error) => {
          console.log('Geolocation error:', error.code, error.message);
          setLoading(false);
          
          if (error.code === 1) {
            Alert.alert('Permission Denied', 'Location permission was denied.');
          } else if (error.code === 2) {
            Alert.alert('Location Unavailable', 'Your location is currently unavailable. Please check your device settings.');
          } else if (error.code === 3) {
            Alert.alert('Timeout', 'Getting location timed out. Please try again.');
          } else {
            Alert.alert('Error', 'Unable to get your location. Please try again.');
          }
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000,
          forceRequestLocation: true
        }
      );
    } catch (error) {
      console.error('Geolocation general error:', error);
      setLoading(false);
      Alert.alert('Error', 'Something went wrong while accessing your location.');
    }
  }, [fetchNearbyHospitals]);
  
  // Get location for iOS
  const getiOSLocation = useCallback(() => {
    try {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          fetchNearbyHospitals(latitude, longitude);
        },
        (error) => {
          console.log('Geolocation error:', error.code, error.message);
          setLoading(false);
          Alert.alert('Error', 'Unable to get your location. Please check your location settings.');
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000
        }
      );
    } catch (error) {
      console.error('Geolocation general error:', error);
      setLoading(false);
      Alert.alert('Error', 'Something went wrong while accessing your location.');
    }
  }, [fetchNearbyHospitals]);

  const checkLocationPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location to show nearby hospitals',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK'
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getAndroidLocation();
          } else {
            setLoading(false);
            Alert.alert(
              'Location Permission Denied',
              'Please enable location services to find hospitals near you.',
              [{ text: 'OK' }]
            );
          }
        } catch (err) {
          console.error('Error requesting location permission:', err);
          setLoading(false);
          Alert.alert('Error', 'Failed to request location permission.');
        }
      } else {
        // iOS
        const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        
        if (result === RESULTS.GRANTED) {
          getiOSLocation();
        } else if (result === RESULTS.DENIED) {
          const requestResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          if (requestResult === RESULTS.GRANTED) {
            getiOSLocation();
          } else {
            setLoading(false);
            Alert.alert(
              'Location Permission Denied', 
              'Please enable location services to find hospitals near you.',
              [{ text: 'OK' }]
            );
          }
        } else {
          setLoading(false);
          Alert.alert(
            'Location Permission Blocked', 
            'Please enable location permissions in your device settings to use this feature.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Permission check error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to check location permissions.');
    }
  }, [getAndroidLocation, getiOSLocation]);

  // Request location permission
  useEffect(() => {
    // Reset loading state when component mounts
    setLoading(true);
    checkLocationPermission();
  }, [checkLocationPermission]);

  // Filter hospitals based on search and filter selection
  const filterHospitals = useCallback(() => {
    let filteredData = hospitals;
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filteredData = filteredData.filter(hospital => {
        const nameMatch = hospital.name.toLowerCase().includes(query);
        const specialtyMatch = hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(query)
        );
        const addressMatch = hospital.address.toLowerCase().includes(query);
        
        return nameMatch || specialtyMatch || addressMatch;
      });
    }
    
    // Apply category filter
    if (activeFilter !== 'All') {
      filteredData = filteredData.filter(hospital => 
        hospital.specialties.includes(activeFilter)
      );
    }
    
    // Apply sorting
    if (sortBy === 'rating') {
      filteredData = [...filteredData].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'distance') {
      filteredData = [...filteredData].sort((a, b) => {
        const distA = parseFloat(a.distance.split(' ')[0]);
        const distB = parseFloat(b.distance.split(' ')[0]);
        return distA - distB;
      });
    }
    
    setFilteredHospitals(filteredData);
  }, [searchQuery, activeFilter, sortBy, hospitals]);

  // Apply filters when dependencies change
  useEffect(() => {
    filterHospitals();
  }, [filterHospitals]);
  
  // Update filtered hospitals when search query changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      filterHospitals();
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [filterHospitals]);

  // Open maps app with navigation to hospital
  const navigateToHospital = (hospital: Hospital) => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.select({
      ios: `${scheme}?q=${hospital.name}&ll=${hospital.location.latitude},${hospital.location.longitude}`,
      android: `${scheme}${hospital.location.latitude},${hospital.location.longitude}?q=${hospital.name}`
    });
    
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open maps application.');
      });
    }
  };

  // Open hospital website
  const openWebsite = (url: string) => {
    if (url === 'N/A') {
      Alert.alert('Information', 'Website not available for this hospital.');
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open website.');
    });
  };

  // Call hospital
  const callHospital = (phoneNumber: string) => {
    if (phoneNumber === 'N/A') {
      Alert.alert('Information', 'Phone number not available for this hospital.');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Could not initiate call.');
    });
  };

  // Hospital detail modal
  const HospitalDetailModal = () => {
    if (!selectedHospital) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            
            {selectedHospital.hasImage ? (
              <Image 
                source={selectedHospital.image} 
                style={styles.modalImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.modalImage, styles.noImageContainer]}>
                <Ionicons name="image-outline" size={50} color="#189a8e" />
                <Text style={styles.noImageText}>No Image Available</Text>
              </View>
            )}
            
            <Text style={styles.modalTitle}>{selectedHospital.name}</Text>
            
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{selectedHospital.rating.toFixed(1)}</Text>
              <Text style={styles.distanceText}>{selectedHospital.distance}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#189a8e" />
              <Text style={styles.detailText}>{selectedHospital.address}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#189a8e" />
              <Text style={styles.detailText}>{selectedHospital.hours}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={20} color="#189a8e" />
              <Text 
                style={[styles.detailText, styles.link]}
                onPress={() => callHospital(selectedHospital.contact)}
              >
                {selectedHospital.contact}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="globe-outline" size={20} color="#189a8e" />
              <Text 
                style={[styles.detailText, styles.link]}
                onPress={() => openWebsite(selectedHospital.website)}
              >
                {selectedHospital.website === 'N/A' ? 'Website not available' : selectedHospital.website}
              </Text>
            </View>
            
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.specialtiesModalContainer}>
              {selectedHospital.specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#189a8e' }]}
                onPress={() => {
                  setModalVisible(false);
                  navigateToHospital(selectedHospital);
                }}
              >
                <Ionicons name="navigate-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#189a8e' }]}
                onPress={() => callHospital(selectedHospital.contact)}
              >
                <Ionicons name="call-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Filter modal
  const FilterModal = () => {
    // Local state for the modal
    const [localSortBy, setLocalSortBy] = useState(sortBy);
    const [localFilter, setLocalFilter] = useState(activeFilter);
    
    // Reset local state when modal opens
    useEffect(() => {
      if (filterModalVisible) {
        setLocalSortBy(sortBy);
        setLocalFilter(activeFilter);
        // Also update refs as backup
        tempSortByRef.current = sortBy;
        tempActiveFilterRef.current = activeFilter;
      }
    }, [filterModalVisible]);
    
    // Apply filters function
    const applyFilters = () => {
      setSortBy(localSortBy);
      setActiveFilter(localFilter);
      setFilterModalVisible(false);
      // We don't need to manually call filterHospitals here because
      // it will be triggered by the dependency changes in useEffect
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { paddingTop: 20 }]}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.sortOptions}>
              <TouchableOpacity 
                style={[
                  styles.sortOption,
                  localSortBy === 'distance' && styles.activeSortOption
                ]}
                onPress={() => setLocalSortBy('distance')}
              >
                <Ionicons 
                  name="location-outline" 
                  size={20} 
                  color={localSortBy === 'distance' ? "#fff" : "#189a8e"} 
                />
                <Text 
                  style={[
                    styles.sortOptionText,
                    localSortBy === 'distance' && styles.activeSortOptionText
                  ]}
                >
                  Distance
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.sortOption,
                  localSortBy === 'rating' && styles.activeSortOption
                ]}
                onPress={() => setLocalSortBy('rating')}
              >
                <Ionicons 
                  name="star-outline" 
                  size={20} 
                  color={localSortBy === 'rating' ? "#fff" : "#189a8e"} 
                />
                <Text 
                  style={[
                    styles.sortOptionText,
                    localSortBy === 'rating' && styles.activeSortOptionText
                  ]}
                >
                  Rating
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.filterOptionsContainer}>
              {filterOptions.map((filter, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalFilterOption,
                    localFilter === filter && styles.activeFilterOption
                  ]}
                  onPress={() => setLocalFilter(filter)}
                >
                  <Text 
                    style={[
                      styles.filterText, 
                      localFilter === filter && styles.activeFilterText
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Hospital card component
  const HospitalCard = ({ item }: { item: Hospital }) => (
    <TouchableOpacity 
      style={styles.hospitalCard}
      onPress={() => {
        setSelectedHospital(item);
        setModalVisible(true);
      }}
    >
      {item.hasImage ? (
        <Image source={item.image} style={styles.hospitalImage} />
      ) : (
        <View style={[styles.hospitalImage, styles.noImageContainer]}>
          <Ionicons name="image-outline" size={30} color="#189a8e" />
        </View>
      )}
      <View style={styles.hospitalInfo}>
        <Text style={styles.hospitalName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>
        <Text style={styles.addressText}>{item.address}</Text>
        <View style={styles.specialtiesContainer}>
          {item.specialties.slice(0, 2).map((specialty: string, index: number) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
          {item.specialties.length > 2 && (
            <View style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>+{item.specialties.length - 2}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity 
        style={styles.directionButton}
        onPress={() => navigateToHospital(item)}
      >
        <Ionicons name="navigate" size={24} color="#189a8e" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Map modal
  const MapModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#189a8e" />
            </TouchableOpacity>
            <Text style={styles.mapHeaderTitle}>Nearby Hospitals</Text>
          </View>
          
          {userLocation && (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {filteredHospitals.map((hospital) => (
                <Marker
                  key={hospital.id}
                  coordinate={{
                    latitude: hospital.location.latitude,
                    longitude: hospital.location.longitude,
                  }}
                  title={hospital.name}
                  description={hospital.address}
                  onPress={() => {
                    setSelectedHospital(hospital);
                    setModalVisible(true);
                    setMapModalVisible(false);
                  }}
                >
                  <View style={styles.markerContainer}>
                    <Ionicons name="medical" size={24} color="#189a8e" />
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#189a8e" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Find Hospitals</Text>
          <Text style={styles.headerSubtitle}>Find the best medical care near you</Text>
        </View>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => {
            if (filteredHospitals.length > 0 && userLocation) {
              setMapModalVisible(true);
            } else if (!userLocation) {
              Alert.alert('Location Required', 'Please enable location services to view hospitals on the map.');
            } else {
              Alert.alert('No Hospitals', 'No hospitals are currently available to view on map.');
            }
          }}
        >
          <Ionicons name="map-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospitals or specialties"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Loading indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#189a8e" />
          <Text style={styles.loadingText}>Finding hospitals near you...</Text>
        </View>
      ) : (
        /* Hospital List */
        <FlatList
          data={filteredHospitals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HospitalCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No hospitals found</Text>
              <Text style={styles.emptySubText}>Try a different search or filter</Text>
            </View>
          )}
        />
      )}
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setFilterModalVisible(true)}
      >
        <Ionicons name="filter-outline" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Modals */}
      <HospitalDetailModal />
      <FilterModal />
      <MapModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#189a8e',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#70757a',
    marginTop: 4,
  },
  mapButton: {
    backgroundColor: '#189a8e',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterOption: {
    backgroundColor: '#189a8e',
    borderColor: '#189a8e',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  hospitalCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  hospitalImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  hospitalInfo: {
    flex: 1,
    marginLeft: 15,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 14,
    color: '#70757a',
    marginLeft: 10,
  },
  addressText: {
    fontSize: 14,
    color: '#70757a',
    marginBottom: 8,
  },
  specialtiesContainer: {
    flexDirection: 'row',
  },
  specialtyTag: {
    backgroundColor: '#e6f7f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  specialtyText: {
    fontSize: 12,
    color: '#189a8e',
  },
  directionButton: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f7f5',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#70757a',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#189a8e',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginTop: 10,
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginVertical: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  link: {
    color: '#189a8e',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  specialtiesModalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#e6f7f5',
    marginRight: 10,
    width: '48%',
  },
  activeSortOption: {
    backgroundColor: '#189a8e',
  },
  sortOptionText: {
    color: '#189a8e',
    fontWeight: '500',
    marginLeft: 8,
  },
  activeSortOptionText: {
    color: '#fff',
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  modalFilterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: '#189a8e',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginTop: 10,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  mapHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#189a8e',
    marginLeft: 10,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#189a8e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  searchButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  noImageContainer: {
    backgroundColor: '#e6f7f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 14,
    color: '#189a8e',
    marginTop: 10,
  },
});

export default FindHospitals;