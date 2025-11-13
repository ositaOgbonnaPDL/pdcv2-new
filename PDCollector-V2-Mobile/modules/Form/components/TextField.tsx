// @ts-ignore
import {color, lightness} from 'kewler';
import React from 'react';
import {KeyboardTypeOptions, StyleSheet} from 'react-native';
import {Colors} from 'react-native-paper';
import {primary} from '../../../shared/colors';
import PasswordInput from '../../../shared/components/PasswordInput';
import TextInput from '../../../shared/components/TextInput';

type AllowedTypes = 'text' | 'number' | 'email' | 'password';

type TextField = TextInput & {
  inputType: AllowedTypes;
};

const dark = color(primary);
const darkLight = dark(lightness(-16));

const TYPES: Record<AllowedTypes, KeyboardTypeOptions> = {
  text: 'default',
  password: 'default',
  number: 'number-pad',
  email: 'email-address',
};

function TextField({inputType, ...props}: TextField) {
  const isPassword = inputType === 'password';
  const Field = isPassword ? PasswordInput : TextInput;

  return (
    <Field
      {...props}
      maskColor="white"
      keyboardType={TYPES[inputType]}
      contentStyle={{color: Colors.white}}
      contentContainerStyle={styles.textInput}
    />
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 0,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: darkLight(),
  },
});

export default TextField;
