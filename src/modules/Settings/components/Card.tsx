import React, {ReactNode} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {MD3useTheme} from 'react-native-paper';

import {Box} from '../../../components';
import {useSettingsStore} from '../../../stores';
import {radius, primaryDark} from '../../../theme';

type CardProps = {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export default function Card({style, children}: CardProps) {
  const colorScheme = useSettingsStore((state) => state.colorScheme);
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
    backgroundColor: MD3colors.primary,
  },
  dark: {
    borderColor: 'grey',
    backgroundColor: 'white',
  },
});
