import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

const HealthVitalsScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const navigation = useNavigation(); // Initialize the navigation hook

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hello, Jacob!</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Icon name="create-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Heart Health Section */}
      <View style={styles.card}>
        <Text style={styles.title}>Heart Health</Text>
        <View style={styles.infoSection}>
          <View style={styles.heartIconContainer}>
            <Icon name="pulse" size={60} color="#FF6F61" />
          </View>
          <View style={styles.details}>
            <Text style={styles.subTitle}>Health</Text>
            <Text style={styles.description}>Last Diagnosis of Heart: 1 week ago</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Diagnose</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.vitals}>
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>Blood Pressure</Text>
            <Text style={styles.vitalValue}>123 / 80</Text>
          </View>
          <View style={styles.vitalCard}>
            <Text style={styles.vitalLabel}>Heart Rate</Text>
            <Text style={styles.vitalValue}>67 / min</Text>
          </View>
        </View>
      </View>

      {/* Additional Vitals */}
      <View style={styles.card1}>
        <Text style={styles.title}>Additional Health Data</Text>
        <View style={styles.vitals}>
          <View style={styles.vitalCard}>
            <Icon name="body-outline" size={30} color="#6A1B9A" />
            <Text style={styles.vitalLabel}>Height</Text>
            <Text style={styles.vitalValue}>5'8"</Text>
          </View>
          <View style={styles.vitalCard}>
            <Icon name="barbell-outline" size={30} color="#1E88E5" />
            <Text style={styles.vitalLabel}>Weight</Text>
            <Text style={styles.vitalValue}>70 kg</Text>
          </View>
          <View style={styles.vitalCard}>
            <Icon name="water-outline" size={30} color="#D84315" />
            <Text style={styles.vitalLabel}>Blood Group</Text>
            <Text style={styles.vitalValue}>O+</Text>
          </View>
        </View>
      </View>

      {/* Doctor Contact Section */}
      <View style={styles.contactCard}>
        <Image
          source={{
            uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg?semt=ais_hybrid',
          }} // Replace with doctor image URL
          style={styles.contactAvatar}
        />
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>Robert Fox</Text>
          <Text style={styles.contactRole}>Emergency Contact</Text>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity>
            <Icon name="chatbox-ellipses-outline" size={24} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="call-outline" size={24} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
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
  },
  card: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  card1: {
    backgroundColor: '#F7E5EC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  heartIconContainer: {
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FF6F61',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  vitals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  vitalCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
  },
  vitalLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFECB3',
    borderRadius: 12,
    padding: 15,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactRole: {
    fontSize: 14,
    color: '#555',
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 80,
  },
});

export default HealthVitalsScreen;
