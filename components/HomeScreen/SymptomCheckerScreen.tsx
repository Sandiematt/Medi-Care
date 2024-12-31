import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';


const faqData = [
  {
    question: '✅ What is a healthy diet?',
    answer: 'A healthy diet includes a variety of foods like vegetables, fruits, lean proteins, and whole grains.',
  },
  {
    question: '✅ How often should I exercise?',
    answer: 'At least 30 minutes of moderate-intensity exercise five days a week is recommended.',
  },
  {
    question: '✅ What are the benefits of drinking water?',
    answer: 'Water helps keep your body hydrated, supports digestion, and maintains healthy skin.',
  },
  {
    question: '✅ How can I manage stress?',
    answer: 'Meditation, regular physical activity, and proper sleep can help manage stress levels.',
  },
];


const diseases = [
  {
    id: '1',
    name: 'Heart Disease',
    icon: require('../../assets/images/heart.png'),
    details:
      'Heart disease is a range of conditions that affect your heart.\n\n' +
      'Symptoms:\n' +
      '• Pressure, tightness, pain, or squeezing in chest or arms.\n' +
      '• Nausea, indigestion, or abdominal pain.\n' +
      '• Shortness of breath, cold sweat, fatigue, dizziness.\n\n' +
      'What to do:\n' +
      '• Call 911 or your local emergency number.\n' +
      '• Chew and swallow aspirin, take nitroglycerin.\n' +
      '• Begin CPR if unconscious.',
  },
  {
    id: '2',
    name: 'Lungs Disease',
    icon: require('../../assets/images/lungs.png'),
    details:
      'Lung disease includes conditions such as asthma, bronchitis, and COPD.\n\n' +
      'Symptoms:\n' +
      '• Shortness of breath, wheezing, or chronic cough.\n' +
      '• Chest tightness and frequent respiratory infections.\n\n' +
      'What to do:\n' +
      '• Use an inhaler or prescribed medication.\n' +
      '• Seek immediate medical attention if symptoms worsen.',
  },
  {
    id: '3',
    name: 'Covid Disease',
    icon: require('../../assets/images/covid.png'),
    details:
      'COVID-19 is caused by the SARS-CoV-2 virus and primarily affects the respiratory system.\n\n' +
      'Symptoms:\n' +
      '• Fever, chills, dry cough, fatigue.\n' +
      '• Loss of taste or smell, shortness of breath.\n\n' +
      'What to do:\n' +
      '• Isolate yourself from others and consult a healthcare provider.\n' +
      '• Follow CDC guidelines and seek medical help if necessary.',
  },
  {
    id: '4',
    name: 'Eye Disease',
    icon: require('../../assets/images/eye.png'),
    details:
      'Eye diseases include conditions such as glaucoma, cataracts, and macular degeneration.\n\n' +
      'Symptoms:\n' +
      '• Blurred vision, eye pain, and light sensitivity.\n' +
      '• Seeing halos around lights or loss of peripheral vision.\n\n' +
      'What to do:\n' +
      '• Consult an ophthalmologist for eye examination.\n' +
      '• Use prescribed eye drops or medications.',
  },
  {
    id: '5',
    name: 'Fever Disease',
    icon: require('../../assets/images/fever.png'),
    details:
      'Fever is a common symptom of infection or inflammation in the body.\n\n' +
      'Symptoms:\n' +
      '• Elevated body temperature, chills, sweating.\n' +
      '• Headache and muscle aches.\n\n' +
      'What to do:\n' +
      '• Stay hydrated and rest.\n' +
      '• Take fever-reducing medication like acetaminophen.',
  },
  {
    id: '6',
    name: 'Kidney Disease',
    icon: require('../../assets/images/kidney.png'),
    details:
      'Kidney disease affects the kidneys and can lead to kidney failure if untreated.\n\n' +
      'Symptoms:\n' +
      '• Swelling in the legs, ankles, or feet.\n' +
      '• Fatigue, nausea, and changes in urine output.\n\n' +
      'What to do:\n' +
      '• Consult a nephrologist for kidney function tests.\n' +
      '• Follow prescribed treatments and manage underlying conditions like diabetes.',
  },
  {
    id: '7',
    name: 'Liver Disease',
    icon: require('../../assets/images/liver.png'),
    details:
      'Liver disease includes conditions like hepatitis, cirrhosis, and fatty liver disease.\n\n' +
      'Symptoms:\n' +
      '• Yellowing of the skin or eyes (jaundice).\n' +
      '• Abdominal pain and swelling, nausea.\n\n' +
      'What to do:\n' +
      '• Consult a doctor for liver function tests.\n' +
      '• Avoid alcohol and follow dietary recommendations.',
  },
  {
    id: '8',
    name: 'Skin Disease',
    icon: require('../../assets/images/skin.png'),
    details:
      'Skin disease includes conditions such as acne, eczema, and psoriasis.\n\n' +
      'Symptoms:\n' +
      '• Redness, itching, or scaling on the skin.\n' +
      '• Rashes, blisters, or open sores.\n\n' +
      'What to do:\n' +
      '• Use prescribed topical treatments or medications.\n' +
      '• Maintain proper skin hygiene and avoid irritants.',
  },
];

const SymptomCheckerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedDisease, setSelectedDisease] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('disease');

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleTab = (tab: string) => {
    setActiveTab(tab);
  };

  const renderDisease = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedDisease(item)}>
      <Image source={item.icon} style={styles.icon} />
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backIconContainer}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="chevron-back" size={30} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Help</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => toggleTab('disease')}
          style={[styles.tab, activeTab === 'disease' && styles.activeTab]}>
          <Text style={activeTab === 'disease' ? styles.activeTabText : styles.tabText}>DISEASE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleTab('faq')}
          style={[styles.tab, activeTab === 'faq' && styles.activeTab]}>
          <Text style={activeTab === 'faq' ? styles.activeTabText : styles.tabText}>FAQ</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'faq' && (
        <ScrollView style={styles.faqContainer}>
          {faqData.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {activeTab === 'disease' && (
        <FlatList
          data={diseases}
          renderItem={renderDisease}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {selectedDisease && (
        <View style={styles.detailContainer}>
          <Text style={styles.detailTitle}>{selectedDisease.name}</Text>
          <Text style={styles.detailText}>{selectedDisease.details}</Text>
          <TouchableOpacity onPress={() => setSelectedDisease(null)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  backIconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#EDEDED',
    marginTop: 10,
  },
  activeTab: {
    backgroundColor: '#199A8E',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  activeTabText: {
    fontSize: 14,
    color: '#fff',
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
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 14,
    marginVertical: 10,
  },
  closeButton: {
    paddingVertical: 10,
    backgroundColor: '#199A8E',
    borderRadius: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  faqContainer: {
    padding: 16,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  faqAnswer: {
    fontSize: 16,
    marginTop: 5,
    color: '#555',
  },
});

export default SymptomCheckerScreen;
