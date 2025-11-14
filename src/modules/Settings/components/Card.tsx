import React, {ReactNode} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {MD3Colors, useTheme} from 'react-native-paper';

import {Box} from '../../../components';
import useSettingsStore, {colorSchemeSelector} from '../../../stores/settingsStore';
import {radius, primaryDark} from '../../../theme';

type CardProps = {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export default function Card({style, children}: CardProps) {
  const colorScheme = useSettingsStore(colorSchemeSelector);
  const isDark = colorScheme === 'dark';

  return (
    <Box style={style} paddingVertical={10} paddingHorizontal={20}>
      <View style={[styles.card, isDark ? styles.dark : styles.light]} />
      {children}
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
    borderWidth: 2,
    borderRadius: radius,
  },
  light: {
    borderColor: primaryDark,
    backgroundColor: MD3Colors.primary50,
  },
  dark: {
    borderColor: 'grey',
    backgroundColor: 'white',
  },
});
