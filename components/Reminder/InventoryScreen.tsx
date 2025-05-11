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
  Modal,
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

interface Filters {
  type: string | null;
  stockLevel: 'all' | 'high' | 'medium' | 'low' | 'out';
  minPrice: number | null;
  maxPrice: number | null;
}

const InventoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalItems: 0, lowStock: 0, outOfStock: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    type: null,
    stockLevel: 'all',
    minPrice: null,
    maxPrice: null,
  });
  const [itemTypes, setItemTypes] = useState<string[]>([]);

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
      const response = await fetch(`http://10.0.2.2:5000/inventory?username=${encodeURIComponent(parsedUsername)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }
      const data = await response.json();
      setInventoryItems(data);
      setFilteredItems(data);
      
      // Extract unique item types
      const types = Array.from(new Set(data.map((item: InventoryItem) => item.type)));
      setItemTypes(types);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/stats'); // Replace with your server's URL
      if (!response.ok) {
        throw new Error('Failed to fetch inventory stats');
      }
      const data = await response.json();
      setStats(data); // Update stats with fetched data
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
    }
  };

  // Apply filters and search
  const applyFilters = useCallback(() => {
    let result = [...inventoryItems];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.type.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (filters.type) {
      result = result.filter(item => item.type === filters.type);
    }
    
    // Apply stock level filter
    if (filters.stockLevel !== 'all') {
      switch (filters.stockLevel) {
        case 'high':
          result = result.filter(item => item.inStock > 30);
          break;
        case 'medium':
          result = result.filter(item => item.inStock > 10 && item.inStock <= 30);
          break;
        case 'low':
          result = result.filter(item => item.inStock > 0 && item.inStock <= 10);
          break;
        case 'out':
          result = result.filter(item => item.inStock === 0);
          break;
      }
    }
    
    // Apply price range filter
    if (filters.minPrice !== null) {
      result = result.filter(item => item.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      result = result.filter(item => item.price <= filters.maxPrice!);
    }
    
    setFilteredItems(result);
  }, [inventoryItems, searchQuery, filters]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      type: null,
      stockLevel: 'all',
      minPrice: null,
      maxPrice: null,
    });
    setSearchQuery('');
  };

  useEffect(() => {
    fetchInventoryItems();
    fetchStats();
  }, []);

  // Apply filters whenever filters or search query changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters, searchQuery, filters]);

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
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            (filters.type !== null || filters.stockLevel !== 'all' || 
             filters.minPrice !== null || filters.maxPrice !== null) ? 
            styles.filterButtonActive : {}
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="sliders" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter indicator */}
      {(filters.type !== null || filters.stockLevel !== 'all' || 
        filters.minPrice !== null || filters.maxPrice !== null) && (
        <View style={styles.filterIndicator}>
          <Text style={styles.filterIndicatorText}>
            Filters applied
          </Text>
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.clearFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

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
        {filteredItems.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Icon name="inbox" size={48} color="#CBD5E1" />
            <Text style={styles.noResultsText}>No items found</Text>
            <Text style={styles.noResultsSubText}>Try adjusting your filters</Text>
          </View>
        ) : (
          filteredItems.map((item, index) => (
            <TouchableOpacity
              key={item.name + index}
              style={[styles.itemCard, index === filteredItems.length - 1 && styles.lastCard]}
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
          ))
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Inventory</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="x" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Item Type Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Item Type</Text>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      filters.type === null && styles.optionButtonSelected,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, type: null }))}
                  >
                    <Text style={[
                      styles.optionText,
                      filters.type === null && styles.optionTextSelected,
                    ]}>All</Text>
                  </TouchableOpacity>
                  {itemTypes.map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        filters.type === type && styles.optionButtonSelected,
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, type }))}
                    >
                      <Text style={[
                        styles.optionText,
                        filters.type === type && styles.optionTextSelected,
                      ]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Stock Level Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Stock Level</Text>
                <View style={styles.optionsContainer}>
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'High (>30)', value: 'high' },
                    { label: 'Medium (11-30)', value: 'medium' },
                    { label: 'Low (1-10)', value: 'low' },
                    { label: 'Out of Stock', value: 'out' },
                  ].map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        filters.stockLevel === option.value && styles.optionButtonSelected,
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, stockLevel: option.value as any }))}
                    >
                      <Text style={[
                        styles.optionText,
                        filters.stockLevel === option.value && styles.optionTextSelected,
                      ]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceRangeContainer}>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceInputLabel}>Min ($)</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={filters.minPrice !== null ? String(filters.minPrice) : ''}
                      onChangeText={(text) => {
                        const value = text.trim() === '' ? null : parseFloat(text);
                        setFilters(prev => ({ ...prev, minPrice: value }));
                      }}
                    />
                  </View>
                  <View style={styles.priceRangeDivider} />
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceInputLabel}>Max ($)</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="999+"
                      keyboardType="numeric"
                      value={filters.maxPrice !== null ? String(filters.maxPrice) : ''}
                      onChangeText={(text) => {
                        const value = text.trim() === '' ? null : parseFloat(text);
                        setFilters(prev => ({ ...prev, maxPrice: value }));
                      }}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#4b90e2',
    padding: 10,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#4b90e2',
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
    backgroundColor: '#4b90e2',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#4b90e2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterButtonActive: {
    backgroundColor: '#3a72b4', // Darker shade of #4b90e2
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: -8,
  },
  filterIndicatorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#64748B',
  },
  clearFiltersText: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#4b90e2',
    fontWeight: '500',
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
    color: '#4b90e2',
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
    backgroundColor: '#EFF6FF', // Light blue background that complements #4b90e2
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
  },
  modalContent: {
    padding: 20,
    maxHeight: '70%',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  optionButtonSelected: {
    borderColor: '#4b90e2',
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#64748B',
  },
  optionTextSelected: {
    color: '#4b90e2',
    fontWeight: '500',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#64748B',
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Normal',
    color: '#0F172A',
  },
  priceRangeDivider: {
    width: 20,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Normal',
    color: '#64748B',
    fontWeight: '500',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#4b90e2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4b90e2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#0F172A',
    marginTop: 16,
  },
  noResultsSubText: {
    fontSize: 14,
    fontFamily: 'Poppins-Normal',
    color: '#64748B',
    marginTop: 8,
  },
});

export default InventoryApp;