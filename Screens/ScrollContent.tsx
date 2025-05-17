import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface ScrollContentProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  scrollThreshold?: number;
}

const ScrollContent = ({
  children,
  contentContainerStyle,
  style,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
  scrollThreshold = 20,
}: ScrollContentProps) => {
  const navigation = useNavigation();
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Handle scroll to show/hide tab bar
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      
      // Show tab bar when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        // Scrolling down - hide tab bar
        if (isTabBarVisible) {
          setIsTabBarVisible(false);
        }
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - show tab bar
        if (!isTabBarVisible) {
          setIsTabBarVisible(true);
        }
      }
      
      // Update last scroll position
      lastScrollY.current = currentScrollY;
    },
    [isTabBarVisible, scrollThreshold]
  );

  // Update tab bar visibility in the navigator
  useEffect(() => {
    // Set the tabBarVisible option for this screen
    // @ts-ignore - tabBarVisible is a custom property we're using
    navigation.setOptions({
      tabBarVisible: isTabBarVisible,
    });
  }, [isTabBarVisible, navigation]);

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      onScroll={handleScroll}
      scrollEventThrottle={16} // Important for smooth scroll event handling
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScrollContent; 