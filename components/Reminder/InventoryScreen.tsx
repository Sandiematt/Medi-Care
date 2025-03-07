import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';
import AddInventoryScreen from './AddInventory';
import { useFocusEffect } from '@react-navigation/native';

const Stack = createStackNavigator();

const InventoryApp = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InventoryMainScreen" component={InventoryScreen} />
      <Stack.Screen name="AddInventoryItemScreen" component={AddInventoryScreen} />
    </Stack.Navigator>
  );
};

interface InventoryItem {
  name: string;
  price: number;
  inStock: number;
  type: string;
}

interface Stats {
  totalItems: number;
  lowStock: number;
  outOfStock: number;
}

const InventoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalItems: 0, lowStock: 0, outOfStock: 0 });

  // Fetch items from database
  // Fetch items from database
const fetchInventoryItems = async () => {
  setLoading(true);
  try {
    // Get username from AsyncStorage
    const username = await AsyncStorage.getItem('username');
    let parsedUsername;
    
    // Try to parse username if it's stored as JSON
    try {
      const parsedUserData = JSON.parse(username);
      parsedUsername = parsedUserData.username;
    } catch (parseError) {
      // If parsing fails, assume it's a plain string
      parsedUsername = username;
    }
    
    if (!parsedUsername) {
      console.error('No username found');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    // Use the username as a query parameter
    const response = await fetch(`http://20.193.156.237:5000/inventory?username=${encodeURIComponent(parsedUsername)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch inventory items');
    }
    const data = await response.json();
    setInventoryItems(data);
  } catch (error) {
    console.error('Error fetching inventory:', error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const fetchStats = async () => {
    try {
      const response = await fetch('http://20.193.156.237:5000/stats'); // Replace with your server's URL
      if (!response.ok) {
        throw new Error('Failed to fetch inventory stats');
      }
      const data = await response.json();
      setStats(data); // Update stats with fetched data
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
    fetchStats();
  }, []);

  // Refresh inventory on returning to this screen
  useFocusEffect(
    useCallback(() => {
      fetchInventoryItems();
      fetchStats();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0EA5E9" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Inventory</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddInventoryItemScreen')}
          >
            <Icon name="plus" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.lowStock}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.outOfStock}</Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inventory..."
            placeholderTextColor="#94A3B8"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="sliders" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.section}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchInventoryItems();
              fetchStats();
            }}
          />
        }
      >
        {inventoryItems.map((item, index) => (
          <TouchableOpacity
            key={item.name}
            style={[styles.itemCard, index === inventoryItems.length - 1 && styles.lastCard]}
          >
            <View style={styles.itemLeft}>
              <View style={styles.itemIconContainer}>
                <Icon name="box" size={18} color="#0EA5E9" />
              </View>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemType}>{item.type}</Text>
              </View>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <View
                style={[
                  styles.stockBadge,
                  item.inStock > 30
                    ? styles.stockHigh
                    : item.inStock > 10
                    ? styles.stockMedium
                    : styles.stockLow,
                ]}
              >
                <Text
                  style={[
                    styles.stockText,
                    item.inStock > 30
                      ? styles.stockTextHigh
                      : item.inStock > 10
                      ? styles.stockTextMedium
                      : styles.stockTextLow,
                  ]}
                >
                  {item.inStock} left
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
    header: {
      padding: 16,
      backgroundColor: '#FFFFFF',
      ...Platform.select({
        ios: {
          shadowColor: '#64748B',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Poppins-Bold',
      color: '#0F172A',
    },
    addButton: {
      backgroundColor: '#0EA5E9',
      padding: 10,
      borderRadius: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#0EA5E9',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#F1F5F9',
      borderRadius: 16,
      padding: 16,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      backgroundColor: '#E2E8F0',
      height: '100%',
    },
    statValue: {
      fontSize: 20,
      fontFamily: 'Poppins-Bold',
      color: '#0F172A',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Poppins-Normal',
      color: '#64748B',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#64748B',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Poppins-Normal',
      color: '#0F172A',
    },
    filterButton: {
      padding: 12,
      backgroundColor: '#0EA5E9',
      borderRadius: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#0EA5E9',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    section: {
      flex: 1,
      padding: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Poppins-Bold',
      color: '#0F172A',
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    viewAllText: {
      fontSize: 14,
      fontFamily: 'Poppins-Normal',
      color: '#0EA5E9',
      fontWeight: '500',
    },
    itemCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#64748B',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    lastCard: {
      marginBottom: 0,
    },
    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    itemIconContainer: {
      width: 40,
      height: 40,
      backgroundColor: '#F0F9FF',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemName: {
      fontSize: 16,
      fontFamily: 'Poppins-Bold',
      color: '#0F172A',
      marginBottom: 4,
    },
    itemType: {
      fontSize: 14,
      fontFamily: 'Poppins-Normal',
      color: '#64748B',
      marginBottom: 2,
    },
    itemRight: {
      alignItems: 'flex-end',
    },
    sku: {
      fontSize: 12,
      fontFamily: 'Poppins-Normal',
      color: '#94A3B8',
    },
    price: {
      fontSize: 18,
      fontFamily: 'Poppins-Bold',
      color: '#0F172A',
      marginBottom: 6,
    },
    stockBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    stockHigh: {
      backgroundColor: '#DCFCE7',
    },
    stockMedium: {
      backgroundColor: '#FEF3C7',
    },
    stockLow: {
      backgroundColor: '#FEE2E2',
    },
    stockText: {
      fontSize: 12,
      fontFamily: 'Poppins-Normal',
      fontWeight: '500',
    },
    stockTextHigh: {
      color: '#059669',
    },
    stockTextMedium: {
      color: '#D97706',
    },
    stockTextLow: {
      color: '#DC2626',
    },
    loader:{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }
  });
  
  
export default InventoryApp;