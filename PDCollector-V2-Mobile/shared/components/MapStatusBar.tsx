import React from 'react';
import {Platform, StatusBar as RNStatusBar} from 'react-native';
import useSettings, {colorSchemeSelector} from '../stores/settings';

// We have to change the statusbar color to make
// the content visible given the map component doesn't support
// dark mode on android
export default function StatusBar() {
  const colorScheme = useSettings(colorSchemeSelector);

  return (
    <RNStatusBar
      translucent
      backgroundColor="transparent"
      barStyle={
        Platform.OS === 'android'
          ? 'dark-content'
          : colorScheme === 'dark'
          ? 'light-content'
          : 'dark-content'
      }
    />
  );
}
