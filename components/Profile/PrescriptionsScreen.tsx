import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

interface Prescription {
  id: string;
  imageUri: string;
}

const PrescriptionsScreen: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets[0].uri) {
        const newPrescription: Prescription = {
          id: Math.random().toString(),
          imageUri: response.assets[0].uri || '',
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
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hello, Jacob!</Text>
        <Image
          source={{
            uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg?semt=ais_hybrid',
          }}
          style={styles.avatar}
        />
      </View>

      {/* Upload Prescription Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadButtonText}>Upload Prescription</Text>
      </TouchableOpacity>

      {/* Prescription List or Placeholder */}
      {prescriptions.length === 0 ? (
        <Text style={styles.text}>No prescriptions yet.</Text>
      ) : (
        <FlatList
          data={prescriptions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
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
  backButton: {
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10,
  },
  uploadButton: {
    backgroundColor: '#5A9BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
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
    marginTop: 20,
  },
  list: {
    paddingTop: 10,
  },
  card: {
    width: '100%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
});

export default PrescriptionsScreen;
