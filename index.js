/**
 * @format
 */
import 'react-native-gesture-handler'; // Required for React Navigation

import { AppRegistry } from 'react-native';
import App from './App'; // Import the main App component
import { name as appName } from './app.json'; // Import the application name from app.json

// Register the App component with the AppRegistry
AppRegistry.registerComponent(appName, () => App);
