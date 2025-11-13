import React from 'react';
import {View, StyleProp, ViewStyle, StyleSheet, TextStyle} from 'react-native';
import {Text, Colors} from 'react-native-paper';

import ExclamationMark from '../../assets/svg/sf/exclamationmark.circle.fill.svg';
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
        <ExclamationMark width={20} height={20} color={Colors.red600} />
        <Text style={[{color: Colors.red600}, labelStyle]}>{message}</Text>
      </Spacer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ErrorLabel;
