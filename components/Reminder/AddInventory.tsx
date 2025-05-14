import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddInventoryScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [type, setType] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Get the username of the logged in user when component mounts
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('username');
        if (userData) {
          // Try to parse as JSON first
          try {
            const parsedUserData = JSON.parse(userData);
            setUsername(parsedUserData.username);
          } catch (parseError) {
            // If parsing fails, assume it's a plain string username
            setUsername(userData);
          }
        } else {
          // Handle case where user is not logged in
          Alert.alert('Error', 'Please log in to add inventory items');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Could not retrieve user information');
      }
    };
  
    getUserData();
  }, [navigation]);

  const validateForm = () => {
    if (!name.trim()) return 'Item name is required';
    if (!price.trim()) return 'Price is required';
    if (!stock.trim()) return 'Stock quantity is required';
    if (!type.trim()) return 'Item type is required';
    if (isNaN(parseFloat(price))) return 'Price must be a valid number';
    if (isNaN(parseInt(stock))) return 'Stock must be a valid number';
    if (!username) return 'User authentication required';
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }
  
    setLoading(true);
    try {
      // Get auth token if you're using token-based authentication
      const token = await AsyncStorage.getItem('authToken'); // Change this to the correct key for your token
      
      const response = await fetch('http://20.193.156.237:5000/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization header if using token-based auth
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name,
          price,
          stock,
          type,
          // Include the username in the request body
          username,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item');
      }
  
      Alert.alert(
        'Success',
        'Item added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={22} color="#4b90e2" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Item</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="package" size={20} color="#4b90e2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter item name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price</Text>
            <View style={styles.inputWrapper}>
              <Icon name="dollar-sign" size={20} color="#4b90e2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="$0.00"
                placeholderTextColor="#94A3B8"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stock</Text>
            <View style={styles.inputWrapper}>
              <Icon name="box" size={20} color="#4b90e2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                placeholderTextColor="#94A3B8"
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.inputWrapper}>
              <Icon name="tag" size={20} color="#4b90e2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Select item type"
                placeholderTextColor="#94A3B8"
                value={type}
                onChangeText={setType}
              />
            </View>
          </View>

          {/* Optional: Display the username */}
          {username && (
            <View style={styles.userInfoContainer}>
              <Icon name="user" size={16} color="#4b90e2" />
              <Text style={styles.userInfoText}>Adding as: {username}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="check" size={20} color="#FFFFFF" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>Save Item</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom:84 ,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#4b90e2',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#6D28D9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  userInfoText: {
    fontSize: 14,
    color: '#64748B',
  },
  saveIcon: {
    marginRight: 5,
  },
});

export default AddInventoryScreen;