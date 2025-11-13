/**
 * ErrorLabel Component
 * Displays error messages with icon
 */

import React from 'react';
import {View, StyleProp, ViewStyle, StyleSheet, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import Spacer from './Spacer';

function ErrorLabel({
  style,
  message,
  labelStyle,
}: {
  message: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={[styles.container, style]}>
      <Spacer horizontal>
        <Text style={[styles.errorText, labelStyle]}>{message}</Text>
      </Spacer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
});

export default ErrorLabel;
