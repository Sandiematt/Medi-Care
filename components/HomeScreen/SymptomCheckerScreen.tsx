import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';

const diseases = [
  { id: '1', name: 'Heart Disease', icon: require('../../assets/images/heart.png') },
  { id: '2', name: 'Lungs Disease', icon: require('../../assets/images/lungs.png') },
  { id: '3', name: 'Covid Disease', icon: require('../../assets/images/covid.png') },
  { id: '4', name: 'Eye Disease', icon: require('../../assets/images/eye.png') },
  { id: '5', name: 'Fever Disease', icon: require('../../assets/images/fever.png') },
  { id: '6', name: 'Kidney Disease', icon: require('../../assets/images/kidney.png') },
  { id: '7', name: 'Liver Disease', icon: require('../../assets/images/liver.png') },
  { id: '8', name: 'Skin Disease', icon: require('../../assets/images/skin.png') },
];



const SymptomCheckerScreen: React.FC = () => {
  const renderDisease = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <Image source={item.icon} style={styles.icon} />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Help</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}><Text style={styles.activeTabText}>DISEASE</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tab}><Text style={styles.tabText}>FAQ</Text></TouchableOpacity>
      </View>

      <FlatList
        data={diseases}
        renderItem={renderDisease}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#EDEDED',
  },
  activeTab: {
    backgroundColor: '#C7F2E5',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  activeTabText: {
    fontSize: 14,
    color: '#000',
  },
  listContainer: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SymptomCheckerScreen;
