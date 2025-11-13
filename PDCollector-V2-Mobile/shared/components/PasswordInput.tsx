import React, {forwardRef, useCallback, useState} from 'react';
import {TextInput as RNTextInput, View} from 'react-native';
import {Colors, IconButton} from 'react-native-paper';
import EyeSlash from '../../assets/svg/sf/eye.slash.svg';
import Eye from '../../assets/svg/sf/eye.svg';
import useSettings, {colorSchemeSelector} from '../stores/settings';
import TextInput from './TextInput';

type PasswordInput = TextInput & {
  maskColor?: string;
};

const PasswordInput = forwardRef<RNTextInput, PasswordInput>(
  ({maskColor, ...props}, ref) => {
    const colorScheme = useSettings(colorSchemeSelector);
    const [isSecureEntry, setIsSecureEntry] = useState(true);

    const iconColor =
      maskColor ?? (colorScheme === 'dark' ? Colors.black : Colors.grey400);

    const Icon = isSecureEntry ? Eye : EyeSlash;

    const toggle = useCallback(() => {
      setIsSecureEntry((isSecure) => !isSecure);
    }, []);

    return (
      <TextInput
        {...props}
        secureTextEntry={isSecureEntry}
        render={({error, style, errorMessage, ...props}: any) => {
          return (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <RNTextInput {...props} ref={ref} style={[style, {flex: 1}]} />

              <IconButton
                onPress={toggle}
                color={iconColor}
                icon={(props) => <Icon {...props} />}
              />
            </View>
          );
        }}
      />
    );
  },
);

export default PasswordInput;
