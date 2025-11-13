/**
 * React Native Paper v5 Theme Configuration
 */

import {MD3LightTheme, MD3DarkTheme, configureFonts} from 'react-native-paper';
import {accent, primary, primaryDark, white} from './colors';

// Extend Paper theme colors
declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      primaryDark: string;
    }
  }
}

// Light theme configuration
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: primary,
    primaryContainer: accent,
    secondary: primaryDark,
    background: accent,
    surface: primaryDark,
    surfaceVariant: white,
    primaryDark: primaryDark,
  },
  roundness: 8,
};

// Dark theme configuration
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: primary,
    primaryContainer: primaryDark,
    secondary: accent,
    background: primaryDark,
    surface: '#B5B5B5',
    surfaceVariant: primaryDark,
    primaryDark: primaryDark,
  },
  roundness: 8,
};

export type AppTheme = typeof lightTheme;
