import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import RootNavigator from './RootNavigator';
import {linking} from './linking';
import {getAsyncItem, setAsyncItem} from '../utils/storage';
import {NAVIGATION_STATE, PREFERENCE} from '../utils/constants';
import {primary} from '../theme/colors';
import useAuthStore, {CREDENTIALS} from '../stores/authStore';
import useSettingsStore from '../stores/settingsStore';

const AppNavigator = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  // Get auth state from Zustand store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const firstTimeLoggedIn = useAuthStore((state) => state.firstTimeLoggedIn);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const restoreState = async () => {
      try {
        // Load saved preferences and credentials
        const [preferences, credentials] = await Promise.all([
          getAsyncItem(PREFERENCE),
          EncryptedStorage.getItem(CREDENTIALS),
        ]);

        // Restore settings from AsyncStorage
        if (preferences) {
          useSettingsStore.setState(preferences as any);
        }

        // Restore auth from EncryptedStorage
        if (credentials) {
          setAuth(JSON.parse(credentials));
        }

        // Restore navigation state from AsyncStorage
        const savedState = await getAsyncItem(NAVIGATION_STATE);

        // Only restore state if user is authenticated and no deep link
        if (savedState && isAuthenticated) {
          setInitialState(savedState as any);
        }
      } catch (error) {
        console.error('Failed to restore state:', error);
      } finally {
        setIsReady(true);
      }
    };

    restoreState();
  }, [isAuthenticated, setAuth]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={linking}
      initialState={initialState}
      onStateChange={state => {
        // Persist navigation state to AsyncStorage
        if (state) {
          setAsyncItem(NAVIGATION_STATE, state);
        }
      }}>
      <RootNavigator
        isAuthenticated={isAuthenticated}
        isFirstTimeLoggedIn={firstTimeLoggedIn ?? false}
      />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default AppNavigator;
