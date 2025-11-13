import React, {ReactElement} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {primary, primaryDark} from '../../../shared/colors';
import Box from '../../../shared/components/Box';
import useSettings, {
  colorSchemeSelector,
} from '../../../shared/stores/settings';
import {radius} from '../../../shared/theme';

export default function Card({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children: ReactElement | ReactElement[];
}) {
  const colorScheme = useSettings(colorSchemeSelector);

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
    backgroundColor: primary,
  },
  dark: {
    borderColor: 'grey',
    backgroundColor: 'white',
  },
});
