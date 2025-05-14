import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { useLinkBuilder } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Define icon mapping for tab routes
const getIconName = (routeName: string) => {
  // You can customize these icons based on your app's routes
  switch (routeName) {
    case 'Home':
      return 'home-outline';
    case 'Medicine':
      return 'medkit-outline';
    case 'Reminders':
      return 'alarm-outline';
    default:
      return 'apps-outline';
  }
};

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // IMPORTANT: All hooks must be called at the top level before any conditional returns
  const { buildHref } = useLinkBuilder();
  
  // Create animated values for tab indicator position
  const indicatorPosition = React.useRef(new Animated.Value(0)).current;
  
  // Create ref for each tab's scale animation
  const scaleAnimations = React.useRef(
    state.routes.map((_, i) => new Animated.Value(i === state.index ? 1 : 0))
  ).current;
  
  // Check if the current screen should hide the tab bar
  const currentRoute = state.routes[state.index];
  const { options } = descriptors[currentRoute.key];
  // @ts-ignore - tabBarVisible is a custom option we're using
  const tabBarVisible = options.tabBarVisible !== false;
  
  // Animation for tab bar visibility
  const translateY = React.useRef(new Animated.Value(0)).current;
  const [isHidden, setIsHidden] = React.useState(false);
  
  // Animate the tab bar visibility
  useEffect(() => {
    // Check if the route name is a screen that should hide the tab bar
    const currentRoute = state.routes[state.index];
    const shouldHideImmediately = 
      currentRoute.name === 'CounterfeitDetection' || 
      (currentRoute.params && currentRoute.params.isCounterfeitScreen) ||
      currentRoute.name === 'PrescriptionsScreen' ||
      (currentRoute.params && currentRoute.params.isPrescriptionsScreen) ||
      currentRoute.name === 'AI_ChatBot' ||
      (currentRoute.params && currentRoute.params.isAIChatBotScreen) ||
      currentRoute.name === 'InventoryScreen' ||
      (currentRoute.params && currentRoute.params.isInventoryScreen) ||
      
      options.isPrescriptionsScreen || 
      options.isCounterfeitScreen ||
      options.isAIChatBotScreen ||
      options.isInventoryScreen;
    
    if (tabBarVisible) {
      // Show the tab bar if it should be visible
      setIsHidden(false);
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else if (shouldHideImmediately) {
      // For screens that should hide tab bar immediately, don't animate
      setIsHidden(true);
      translateY.setValue(100); // Immediately set position without animation
    } else {
      // For normal scrolling behavior, animate smoothly
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        // Only set isHidden after animation completes
        setIsHidden(true);
      });
    }
  }, [tabBarVisible, translateY, state.routes, state.index, options]);
  
  // Update indicator position whenever the active tab changes
  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: state.index,
      friction: 10,
      tension: 60,
      useNativeDriver: true,
    }).start();
    
    // Update scale animations for all tabs
    state.routes.forEach((_, i) => {
      Animated.spring(scaleAnimations[i], {
        toValue: i === state.index ? 1 : 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index, indicatorPosition, scaleAnimations, state.routes]);
  
  // Don't render anything if the tab bar is hidden and animation is complete
  if (isHidden && !tabBarVisible) {
    return null;
  }

  // Optimize for exactly 3 tabs
  const tabWidth = 33.33;

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ translateY }] }
    ]}>
      <View style={styles.tabBarContainer}>
        {/* Animated pill indicator */}
        <Animated.View 
          style={[
            styles.activeTabIndicator,
            {
              transform: [{ 
                translateX: indicatorPosition.interpolate({
                  inputRange: [0, state.routes.length - 1],
                  outputRange: [0, (state.routes.length - 1) * tabWidth], 
                  extrapolate: 'clamp',
                })
              }],
              width: `${tabWidth}%`,
            }
          ]}
        />
        
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Get the scale animation for this tab
          const scaleAnimation = scaleAnimations[index];

          // Derive the icon color based on focus state
          const iconColor = isFocused ? '#FFFFFF' : '#222222';

          return (
            <PlatformPressable
              key={route.key}
              href={buildHref(route.name, route.params)}
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              android_ripple={null}
              pressOpacity={1}
              pressColor="transparent"
              unstable_pressDelay={0}
            >
              <View style={styles.tabContentWrapper}>
                <Animated.View style={styles.tabContent}>
                  {/* The purple circle background for active tab */}
                  <Animated.View 
                    style={[
                      styles.iconBackground,
                      {
                        opacity: scaleAnimation,
                        transform: [
                          { scale: scaleAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                          })},
                        ],
                      }
                    ]}
                  />
                  
                  {/* Icon */}
                  <Animated.View 
                    style={[
                      styles.iconContainer,
                      {
                        transform: [
                          { scale: scaleAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.85, 1],
                          })},
                        ],
                      }
                    ]}
                  >
                    <Ionicons
                      name={getIconName(route.name.toString())}
                      size={20}
                      color={iconColor}
                    />
                  </Animated.View>
                </Animated.View>
                
                {/* Label - only show for unfocused tabs */}
                {!isFocused && (
                  <Text style={styles.tabLabel}>
                    {route.name}
                  </Text>
                )}
              </View>
            </PlatformPressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 15,
    paddingTop: 5,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 60,
    width: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  activeTabIndicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 32,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5, // Add horizontal padding for better spacing with 3 tabs
  },
  tabContentWrapper: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 42, // Slightly smaller for 3 tabs
    height: 42, // Slightly smaller for 3 tabs
  },
  iconBackground: {
    position: 'absolute',
    width: 42, // Slightly smaller for 3 tabs
    height: 42, // Slightly smaller for 3 tabs
    borderRadius: 21, // Half of width/height
    backgroundColor: '#1f948b', // Teal color
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: -10,
    color: '#222222',
    textAlign: 'center',
  },
});

export default MyTabBar;