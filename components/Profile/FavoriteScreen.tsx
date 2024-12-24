import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Function to calculate wellness score
const calculateWellnessScore = (heartRate: number, bloodSugar: number, bloodPressure: number): number => {
  let score = 75;

  if (heartRate < 60 || heartRate > 100) score -= 20;
  if (bloodSugar < 70 || bloodSugar > 140) score -= 30;
  if (bloodPressure < 90 || bloodPressure > 140) score -= 25;

  return Math.max(score, 0); // Ensure score is not negative
};

interface WellnessScoreProps {
  heartRate: number;
  bloodSugar: number;
  bloodPressure: number;
}

// Wellness Score Calculator component
const WellnessScoreCalculator: React.FC<WellnessScoreProps> = ({ heartRate, bloodSugar, bloodPressure }) => {
  const wellnessScore = calculateWellnessScore(heartRate, bloodSugar, bloodPressure);

  const circleRadius = 70;
  const circumference = 2 * Math.PI * circleRadius;
  const progress = (wellnessScore / 100) * circumference;

  return (
    <View style={styles.progressContainer}>
      {/* Circular Progress Bar */}
      <View style={{ position: 'relative', width: 150, height: 150 }}>
        <Svg width="150" height="150">
          <Circle
            cx="75"
            cy="75"
            r={circleRadius}
            fill="transparent"
            stroke="#e0e0e0"
            strokeWidth="10"
          />
          <Circle
            cx="75"
            cy="75"
            r={circleRadius}
            fill="transparent"
            stroke="#ff4d4d"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform="rotate(-90 75 75)"
          />
        </Svg>

        <View style={styles.scoreTextContainer}>
          <Text style={styles.scoreText}>{wellnessScore}</Text>
        </View>
      </View>

      {/* Wellness Score description */}
      <Text style={styles.description1}>Your Wellness Score</Text>
    </View>
  );
};

const FavoriteScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Wellness Score</Text>
        <Image
          source={{
            uri: 'https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-623.jpg?semt=ais_hybrid',
          }}
          style={styles.avatar}
        />
      </View>

      {/* WellnessScoreCalculator */}
      <WellnessScoreCalculator heartRate={85} bloodSugar={110} bloodPressure={120} />

      {/* Heart Health Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Heart Health</Text>

        <View style={styles.infoSection}>
          <View style={styles.heartIconContainer}>
            <Icon name="pulse" size={60} color="#FF6F61" />
          </View>
          <View style={styles.details}>
            <Text style={styles.subTitle}>Health Tips</Text>
            <Text style={styles.description}>
              Maintain a healthy lifestyle with a balanced diet and regular exercise to keep your heart healthy.
            </Text>
          </View>
        </View>

        <View style={styles.vitals}>
          {/* Blood Pressure Card */}
          <View style={styles.vitalCard}>
            <View style={styles.iconContainer}>
              <Icon name="medkit" size={24} color="#A8D1D1" />
            </View>
            <Text style={styles.vitalLabel}>Blood Pressure</Text>
            <Text style={styles.vitalValue}>123 / 80</Text>
          </View>

          {/* Heart Rate Card */}
          <View style={styles.vitalCard}>
            <View style={styles.iconContainer}>
              <Icon name="heart" size={24} color="#FD8A8A" />
            </View>
            <Text style={styles.vitalLabel}>Heart Rate</Text>
            <Text style={styles.vitalValue}>67 / min</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Style definitions
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    padding: 15,
  },
  scoreTextContainer: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  description1: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    padding: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FCE5FC',
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
  vitals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vitalCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    width: '45%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  vitalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  vitalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
});

export default FavoriteScreen;
