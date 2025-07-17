import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  Platform,
  Dimensions,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const faqData = [
  {
    id: '1',
    question: 'What is a healthy diet?',
    answer: 'A healthy diet includes a variety of foods like vegetables, fruits, lean proteins, and whole grains.',
  },
  {
    id: '2',
    question: 'How often should I exercise?',
    answer: 'At least 30 minutes of moderate-intensity exercise five days a week is recommended.',
  },
  {
    id: '3',
    question: 'What are the benefits of drinking water?',
    answer: 'Water helps keep your body hydrated, supports digestion, and maintains healthy skin.',
  },
  {
    id: '4',
    question: 'How can I manage stress?',
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
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleTab = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleFAQ = (faqId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFAQs(current => 
      current.includes(faqId) 
        ? current.filter(id => id !== faqId)
        : [...current, faqId]
    );
  };

  const renderFAQContent = () => {
    return (
      <FlatList
        key="faq-list"
        data={faqData}
        renderItem={({ item }) => {
          const isExpanded = expandedFAQs.includes(item.id);
          
          return (
            <TouchableOpacity 
              style={styles.faqItem}
              onPress={() => toggleFAQ(item.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Icon 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#199A8E" 
                />
              </View>
              
              {isExpanded && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => `faq-${item.id}`}
        contentContainerStyle={styles.faqListContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderDiseaseContent = () => {
    return (
      <FlatList
        key="disease-grid"
        data={diseases}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.diseaseCard} 
            onPress={() => setSelectedDisease(item)}
          >
            <View style={styles.diseaseIconContainer}>
              <Image 
                source={item.icon} 
                style={styles.diseaseIcon} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.diseaseCardText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => `disease-${item.id}`}
        numColumns={2}
        contentContainerStyle={styles.diseaseList}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleGoBack}
        >
          <Icon name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Guide</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => toggleTab('disease')}
          style={[
            styles.tab, 
            activeTab === 'disease' && styles.activeTab
          ]}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'disease' && styles.activeTabText
          ]}>
            Diseases
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleTab('faq')}
          style={[
            styles.tab, 
            activeTab === 'faq' && styles.activeTab
          ]}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'faq' && styles.activeTabText
          ]}>
            FAQ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'faq' ? renderFAQContent() : renderDiseaseContent()}

      {/* Disease Details Modal */}
      {selectedDisease && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDisease.name}</Text>
              <TouchableOpacity 
                onPress={() => setSelectedDisease(null)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" color="#333" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalDescription}>
                {selectedDisease.details}
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              onPress={() => setSelectedDisease(null)} 
              style={styles.modalFooterButton}
            >
              <Text style={styles.modalFooterButtonText}>Close</Text>
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
    backgroundColor: '#F4F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E2433',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#E9F0FF',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#199A8E',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A6475',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  diseaseList: {
    paddingTop: 16,
  },
  diseaseCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  diseaseIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F4F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  diseaseIcon: {
    width: 48,
    height: 48,
  },
  diseaseCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E2433',
    textAlign: 'center',
  },
  faqItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqCheckContainer: {
    marginRight: 12,
    backgroundColor: '#E9F0FF',
    borderRadius: 20,
    padding: 6,
  },
  faqTextContainer: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2433',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    color: '#5A6475',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9F0FF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E2433',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalScrollView: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: '#5A6475',
  },
  modalFooterButton: {
    backgroundColor: '#199A8E',
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalFooterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  faqListContainer: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E2433',
    flex: 1,
    marginRight: 10,
  },
  faqAnswerContainer: {
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#5A6475',
    lineHeight: 22,
  },
});

export default SymptomCheckerScreen;