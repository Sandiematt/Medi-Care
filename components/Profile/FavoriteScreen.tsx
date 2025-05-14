import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const calculateBMI = (height: number, weight: number) => {
  if (height === 0) return 0;
  return (weight / (height * height)) * 10000;
};

const getHealthTips = (bmi: number) => {
  if (bmi < 18.5) return {
    category: 'Underweight',
    color: '#6366F1',
    accent: '#818CF8',
    bg: '#EEF2FF',
    tips: [
      {
        title: 'Increase Caloric Intake',
        description: 'Aim for 300-500 extra calories daily from nutrient-rich foods.',
        icon: 'restaurant'
      },
      {
        title: 'Protein-Rich Diet',
        description: 'Include eggs, lean meats, dairy, and legumes in your meals.',
        icon: 'nutrition'
      },
      {
        title: 'Strength Training',
        description: 'Focus on resistance exercises to build muscle mass.',
        icon: 'barbell'
      }
    ]
  };
  if (bmi < 24.9) return {
    category: 'Healthy',
    color: '#10B981',
    accent: '#34D399',
    bg: '#ECFDF5',
    tips: [
      {
        title: 'Maintain Balance',
        description: 'Continue your balanced diet and regular exercise routine.',
        icon: 'leaf'
      },
      {
        title: 'Regular Exercise',
        description: 'Mix cardio and strength training for overall fitness.',
        icon: 'fitness'
      },
      {
        title: 'Healthy Habits',
        description: 'Stay hydrated and get adequate sleep to maintain health.',
        icon: 'water'
      }
    ]
  };
  return {
    category: 'Overweight',
    color: '#EF4444',
    accent: '#F87171',
    bg: '#FEF2F2',
    tips: [
      {
        title: 'Calorie Control',
        description: 'Create a moderate caloric deficit of 500-750 calories daily.',
        icon: 'calculator'
      },
      {
        title: 'Regular Exercise',
        description: '150+ minutes of moderate cardio activity weekly.',
        icon: 'walk'
      },
      {
        title: 'Mindful Eating',
        description: 'Practice portion control and eat slowly to feel fuller.',
        icon: 'timer'
      }
    ]
  };
};

interface BMICalculatorProps {
  height: number;
  weight: number;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ height, weight }) => {
  // Only calculate BMI if we have valid height and weight values
  const bmi = (height > 0 && weight > 0) ? calculateBMI(height, weight) : 0;
  const healthInfo = getHealthTips(bmi);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.spring(animation, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Main BMI Card */}
      <Animated.View 
        style={[
          styles.card,
          styles.bmiCard,
          {
            transform: [{
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            }],
          },
        ]}
      >
        <View style={styles.bmiHeader}>
          <View>
            <Text style={styles.bmiTitle}>Your BMI</Text>
            <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: healthInfo.bg }]}>
            <Text style={[styles.categoryText, { color: healthInfo.color }]}>
              {healthInfo.category}
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Icon name="resize" size={20} color="#64748B" />
            <Text style={styles.metricValue}>{height} cm</Text>
            <Text style={styles.metricLabel}>Height</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Icon name="scale" size={20} color="#64748B" />
            <Text style={styles.metricValue}>{weight} kg</Text>
            <Text style={styles.metricLabel}>Weight</Text>
          </View>
        </View>
      </Animated.View>

      {/* Health Tips Section */}
      <View style={[styles.card, styles.tipsCard]}>
        <Text style={styles.tipsTitle}>Personalized Health Tips</Text>
        <View style={styles.tipsContainer}>
          {healthInfo.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={[styles.tipIcon, { backgroundColor: healthInfo.bg }]}>
                <Icon name={tip.icon} size={24} color={healthInfo.color} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* BMI Categories Card */}
      <View style={[styles.card, styles.categoriesCard]}>
        <Text style={styles.categoriesTitle}>BMI Categories</Text>
        <View style={styles.categoriesList}>
          {[
            { label: 'Underweight', range: '< 18.5', color: '#6366F1' },
            { label: 'Healthy', range: '18.5 - 24.9', color: '#10B981' },
            { label: 'Overweight', range: '25 - 29.9', color: '#F59E0B' },
            { label: 'Obese', range: '> 30', color: '#EF4444' }
          ].map((item, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                <Text style={styles.categoryLabel}>{item.label}</Text>
              </View>
              <Text style={styles.categoryRange}>{item.range}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const FavoriteScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({ height: 0, weight: 0 });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (!storedUsername) throw new Error('Username not found');
        const response = await axios.get(`http://20.193.156.237:5000/healthvitals/${storedUsername}`);
        
        // Check if we have valid height and weight data
        if (!response.data || !response.data.height || !response.data.weight) {
          Alert.alert(
            "Missing Health Data",
            "Please update your health vitals in your profile to see BMI insights.",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
          return;
        }
        
        setUserData({
          height: parseFloat(response.data.height),
          weight: parseFloat(response.data.weight)
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert(
          "Health Data Unavailable",
          "Please update your health vitals in your profile to see BMI insights.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    };
    fetchUserData();
  }, [navigation]);

  return (
    <ScrollView 
      style={styles.screenContainer}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BMI Insights</Text>
        <View style={{ width: 40 }} />
      </View>
      <BMICalculator height={userData.height} weight={userData.weight} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    paddingBottom: 84, // Add bottom padding to ensure content is visible above tab bar
  },
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bmiCard: {
    marginTop: 12,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  bmiTitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    right:80,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  tipsCard: {
    padding: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 20,
  },
  tipsContainer: {
    gap: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  categoriesCard: {},
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 20,
  },
  categoriesList: {
    gap: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#0F172A',
  },
  categoryRange: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default FavoriteScreen;