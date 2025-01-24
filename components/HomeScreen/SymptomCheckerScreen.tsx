import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ScrollView, SafeAreaView, Platform } from 'react-native';
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
    <TouchableOpacity 
      style={[styles.card, styles.elevation]} 
      onPress={() => setSelectedDisease(item)}
    >
      <View style={styles.iconContainer}>
        <Image source={item.icon} style={styles.icon} resizeMode="contain" />
      </View>
      <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Medical Help</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => toggleTab('disease')}
          style={[styles.tab, activeTab === 'disease' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'disease' && styles.activeTabText]}>
            DISEASES
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleTab('faq')}
          style={[styles.tab, activeTab === 'faq' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>
            FAQ
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'faq' ? (
        <ScrollView 
          style={styles.mainContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.faqContainer}
        >
          {faqData.map((item, index) => (
            <View key={index} style={[styles.faqItem, styles.elevation]}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={diseases}
          renderItem={renderDisease}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedDisease && (
        <View style={styles.modalOverlay}>
          <View style={[styles.detailContainer, styles.elevation]}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>{selectedDisease.name}</Text>
              <TouchableOpacity 
                onPress={() => setSelectedDisease(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.detailScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.detailText}>{selectedDisease.details}</Text>
            </ScrollView>
            <TouchableOpacity 
              onPress={() => setSelectedDisease(null)} 
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  backButton: {
    padding: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D1E',
    marginLeft: 12,
  },
  elevation: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#199A8E',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    padding: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 36,
    height: 36,
  },
  cardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D1E',
    textAlign: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D1E',
  },
  detailScroll: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4A4A4A',
  },
  closeButton: {
    padding: 16,
    backgroundColor: '#199A8E',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  faqContainer: {
    padding: 16,
  },
  faqItem: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1E',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4A4A4A',
  },
});

export default SymptomCheckerScreen;