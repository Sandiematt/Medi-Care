import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

interface Prescription {
  id: string;
  imageUri: string;
}

const PrescriptionsScreen: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const navigation = useNavigation(); // Initialize the navigation hook

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets[0].uri) {
        const newPrescription: Prescription = {
          id: Math.random().toString(),
          imageUri: response.assets[0].uri || '', // Default to an empty string if undefined
        };
        setPrescriptions((prevPrescriptions) => [...prevPrescriptions, newPrescription]);
      }
    });
  };
  

  const renderItem = ({ item }: { item: Prescription }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <Text style={styles.cardText}>Prescription {item.id}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hello, Jacob!</Text>
        <Image
          source={{ uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg?semt=ais_hybrid' }} // Replace with user image URL
          style={styles.avatar}
        />
        <Text style={styles.greeting}>Hello, Jacob!</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Icon name="create-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Button to upload prescriptions */}
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>Upload Prescription</Text>
      </TouchableOpacity>

      {prescriptions.length === 0 ? (
        <Text style={styles.text}>No prescriptions yet.</Text>
      ) : (
        <FlatList
          data={prescriptions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    right:120,
  },
  uploadButton: {
    backgroundColor: '#5A9BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  text: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PrescriptionsScreen;
