import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const SplashScreen = ({ navigation }) => {
  const animationRef = useRef(null);
  
  useEffect(() => {
    // Play the animation
    if (animationRef.current) {
      animationRef.current.play();
    }
    
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [navigation]);
  
  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/logo_animation.json')}
        style={styles.animation}
        autoPlay={false}
        loop={false}
        onAnimationFinish={() => {
          navigation.replace('Login');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1d958b',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;