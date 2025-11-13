/**
 * PDCollector V2 - Main App Entry Point
 * React Native 0.81.5 with React Navigation 6
 *
 * @format
 */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClientProvider} from '@tanstack/react-query';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigation';
import {queryClient} from './src/api/queryClient';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
