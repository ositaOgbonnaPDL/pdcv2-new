/**
 * PDCollector V2 - Main App Entry Point
 * React Native 0.81.5 with React Navigation 6
 *
 * @format
 */

import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClientProvider} from '@tanstack/react-query';
import {PaperProvider} from 'react-native-paper';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigation';
import {queryClient} from './src/api/queryClient';
import {lightTheme, darkTheme} from './src/theme';
import useSettingsStore, {colorSchemeSelector} from './src/stores/settingsStore';

function App() {
  const systemColorScheme = useColorScheme();
  const userColorScheme = useSettingsStore(colorSchemeSelector);
  const systemEnabled = useSettingsStore((state) => state.theme.system);
  const setTheme = useSettingsStore((state) => state.setTheme);

  // Update settings store when system color scheme changes
  useEffect(() => {
    if (systemEnabled) {
      setTheme({colorScheme: systemColorScheme});
    }
  }, [systemEnabled, systemColorScheme, setTheme]);

  // Determine which theme to use
  const isDarkMode = userColorScheme === 'dark';
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={isDarkMode ? theme.colors.primaryDark : theme.colors.primaryContainer}
          />
          <AppNavigator />
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}

export default App;
