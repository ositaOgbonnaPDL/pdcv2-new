/**
 * AsyncStorage utility functions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAsyncItem = async <T>(key: string): Promise<T | undefined> => {
  try {
    const item = await AsyncStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
    return undefined;
  } catch (error) {
    console.error('Failed to get async item:', error);
    return undefined;
  }
};

export const setAsyncItem = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to set async item:', error);
  }
};

export const removeAsyncItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove async item:', error);
  }
};
