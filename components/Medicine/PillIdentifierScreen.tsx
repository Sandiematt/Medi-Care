import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown'; // Dropdown component
import { launchCamera } from 'react-native-image-picker'; // Image picker for camera
import Icon from 'react-native-vector-icons/FontAwesome'; // Camera icon

const colorData = [
  { label: 'None Selected', value: 'None', color: '#D3D3D3' },
  { label: 'Orange', value: 'Orange', color: '#FFA500' },
  { label: 'White', value: 'White', color: '#FFFFFF' },
  { label: 'Yellow', value: 'Yellow', color: '#FFFF00' },
  { label: 'Green', value: 'Green', color: '#00FF00' },
  { label: 'Blue', value: 'Blue', color: '#0000FF' },
  { label: 'Pink', value: 'Pink', color: '#FFC0CB' },
];

const shapeData = [
  { label: 'None Selected', value: 'None', shape: null },
  { label: 'Round', value: 'Round', shape: { borderRadius: 20, width: 40, height: 40 } },
  { label: 'Oval', value: 'Oval', shape: { borderRadius: 20, width: 50, height: 30 } },
  { label: 'Square', value: 'Square', shape: { width: 40, height: 40 } },
  { label: 'Rectangle', value: 'Rectangle', shape: { width: 60, height: 30 } },
  { label: 'Diamond', value: 'Diamond', shape: { transform: [{ rotate: '45deg' }], width: 30, height: 30 } },
];

const PillIdentifierScreen: React.FC = () => {
  const [imprint, setImprint] = useState('');
  const [color, setColor] = useState('None');
  const [shape, setShape] = useState('None');
  const [results, setResults] = useState([
    {
      id: '1',
      name: 'Diphedryl',
      strength: '25 mg',
      imprint: '44 329',
    },
    {
      id: '2',
      name: 'Diphenhydramine',
      strength: '50 mg',
      imprint: '25 L479',
    },
    {
      id: '3',
      name: 'Clindamycin',
      strength: '300 mg',
      imprint: '44 107 44 107',
    },
  ]);

  const handleSearch = () => {
    // Placeholder logic for search functionality
    console.log('Searching for:', imprint, color, shape);
  };

  const handleCameraScan = () => {
    launchCamera({ mediaType: 'photo' }, (response) => {
      if (response.assets) {
        // Here you can send the image for text or shape recognition.
        console.log('Camera scan result:', response.assets[0].uri);
      } else {
        console.log('User canceled the scan');
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>FIND PILL</Text>
      </View>

      {/* Input Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Imprint or Pill Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Imprint or Pill Name"
          placeholderTextColor="#BEBEBE"
          value={imprint}
          onChangeText={setImprint}
        />

        {/* Color Dropdown */}
        <Text style={styles.label}>Pill Color</Text>
        <Dropdown
          style={styles.dropdown}
          data={colorData}
          labelField="label"
          valueField="value"
          value={color}
          onChange={(item) => setColor(item.value)}
          renderItem={(item) => (
            <View style={styles.dropdownItem}>
              <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
              <Text style={styles.dropdownText}>{item.label}</Text>
            </View>
          )}
          placeholder="Select Color"
        />

        {/* Shape Dropdown */}
        <Text style={styles.label}>Pill Shape</Text>
        <Dropdown
          style={styles.dropdown}
          data={shapeData}
          labelField="label"
          valueField="value"
          value={shape}
          onChange={(item) => setShape(item.value)}
          renderItem={(item) => (
            <View style={styles.dropdownItem}>
              {item.shape ? (
                <View style={[styles.shape, item.shape, { backgroundColor: '#D3D3D3' }]} />
              ) : null}
              <Text style={styles.dropdownText}>{item.label}</Text>
            </View>
          )}
          placeholder="Select Shape"
        />

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* 'OR' Text */}
      <Text style={styles.orText}>OR</Text>

      {/* Camera Scan Button - Separate from the form */}
      <TouchableOpacity style={styles.scanButton} onPress={handleCameraScan}>
        <Icon name="camera" size={30} color="#FFFFFF" />
        <Text style={styles.scanButtonText}>Scan Pill</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold', // Use Poppins-Bold font
    color: '#000',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    elevation: 4,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold', // Use Poppins-SemiBold font
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#000',
    fontFamily: 'Poppins-SemiBold', // Use Poppins-SemiBold font
  },
  dropdown: {
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dropdownItem: {
    flexDirection: 'row',
    
    padding: 8,
    justifyContent: 'center', // This ensures proper spacing between the shape and text
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold', // Use Poppins-SemiBold font
    color: '#000',
  },
  searchButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold', // Use Poppins-Bold font
  },
  orText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold', // Use Poppins-SemiBold font
    color: '#000',
    textAlign: 'center',
    marginVertical: 16,
  },
  scanButton: {
    backgroundColor: '#FF5733',
    borderRadius: 8,
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold', // Use Poppins-SemiBold font
    marginLeft: 8,
  },
  shape: {
    width: 40,
    height: 40,
    marginRight: 12,
    backgroundColor: '#D3D3D3',
  },
});

export default PillIdentifierScreen;
