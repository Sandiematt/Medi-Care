import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from './BottomTabs';

const Stack = createStackNavigator();

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen
        name="Main"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
