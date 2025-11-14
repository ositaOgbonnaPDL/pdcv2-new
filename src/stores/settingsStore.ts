/**
 * Settings Store (Zustand v4)
 * Manages app settings with AsyncStorage persistence
 */

import {ColorSchemeName} from 'react-native';
import {create, StateCreator} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PREFERENCE = 'preference';

export type Themes = ColorSchemeName | 'system';

export enum ImageQuality {
  LOW = 0.4,
  MEDIUM = 0.7,
  HIGH = 1,
}

export type SettingsState = {
  theme: {
    system?: boolean;
    colorScheme?: ColorSchemeName;
  };
  media: {
    canSave: boolean;
    quality: ImageQuality;
  };
  tracking: {
    accuracyEnabled: boolean;
  };
};

export type SettingsActions = {
  setTheme: (theme: SettingsState['theme']) => void;
  setColorScheme: (colorScheme: ColorSchemeName) => void;
  setSystemTheme: (system: boolean) => void;
  setMedia: (media: Partial<SettingsState['media']>) => void;
  setMediaQuality: (quality: ImageQuality) => void;
  setCanSaveMedia: (canSave: boolean) => void;
  setTracking: (tracking: Partial<SettingsState['tracking']>) => void;
};

export type SettingsStore = SettingsState & SettingsActions;

// Custom AsyncStorage middleware for settings
const createAsyncStorageMiddleware = (config: StateCreator<SettingsStore>) => (
  set: any,
  get: any,
  api: any,
) => {
  return config(
    async (args) => {
      set(args);

      // Save to AsyncStorage after state update
      try {
        const state = get();
        await AsyncStorage.setItem(PREFERENCE, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    },
    get,
    api,
  );
};

const useSettingsStore = create<SettingsStore>(
  createAsyncStorageMiddleware((set, get) => ({
    // Initial state
    theme: {
      system: true,
      colorScheme: 'dark',
    },
    media: {
      canSave: false,
      quality: ImageQuality.LOW,
    },
    tracking: {
      accuracyEnabled: true,
    },

    // Actions
    setMedia: (media) => {
      set({media: {...get().media, ...media}});
    },

    setMediaQuality: (quality) => {
      set({media: {...get().media, quality}});
    },

    setCanSaveMedia: (canSave) => {
      set({media: {...get().media, canSave}});
    },

    setTracking: (tracking) => {
      set({tracking: {...get().tracking, ...tracking}});
    },

    setTheme: (theme) => {
      set({theme: {...get().theme, ...theme}});
    },

    setColorScheme: (colorScheme) => {
      set({theme: {...get().theme, colorScheme}});
    },

    setSystemTheme: (system) => {
      set({theme: {...get().theme, system}});
    },
  })),
);

// Selectors
export const colorSchemeSelector = (state: SettingsStore) =>
  state.theme.colorScheme;

export default useSettingsStore;
