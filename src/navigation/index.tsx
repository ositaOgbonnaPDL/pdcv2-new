import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import RootNavigator from './RootNavigator';
import {getAsyncItem, setAsyncItem} from '../utils/storage';
import {NAVIGATION_STATE} from '../utils/constants';
import {primary} from '../theme/colors';

// TODO: Replace with actual auth store integration in Phase 2 (State Management)
const useAuth = () => {
  // Placeholder auth state
  // This will be replaced with actual Zustand store in Phase 2
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeLoggedIn, setIsFirstTimeLoggedIn] = useState(false);

  return {
    isAuthenticated,
    isFirstTimeLoggedIn,
  };
};

const AppNavigator = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const {isAuthenticated, isFirstTimeLoggedIn} = useAuth();

  useEffect(() => {
    const restoreState = async () => {
      try {
        // Restore navigation state from AsyncStorage
        const savedState = await getAsyncItem(NAVIGATION_STATE);

        // Only restore state if user is authenticated and no deep link
        if (savedState && isAuthenticated) {
          setInitialState(savedState as any);
        }
      } catch (error) {
        console.error('Failed to restore navigation state:', error);
      } finally {
        setIsReady(true);
      }
    };

    restoreState();
  }, [isAuthenticated]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={state => {
        // Persist navigation state to AsyncStorage
        if (state) {
          setAsyncItem(NAVIGATION_STATE, state);
        }
      }}>
      <RootNavigator
        isAuthenticated={isAuthenticated}
        isFirstTimeLoggedIn={isFirstTimeLoggedIn}
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
