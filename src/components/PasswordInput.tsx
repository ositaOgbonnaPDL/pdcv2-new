/**
 * PasswordInput Component
 * Text input with show/hide password toggle
 */

import React, {forwardRef, useCallback, useState} from 'react';
import {TextInput as RNTextInput, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import useSettingsStore, {colorSchemeSelector} from '../stores/settingsStore';
import TextInput from './TextInput';

type PasswordInputProps = React.ComponentProps<typeof TextInput> & {
  maskColor?: string;
};

const PasswordInput = forwardRef<RNTextInput, PasswordInputProps>(
  ({maskColor, ...props}, ref) => {
    const colorScheme = useSettingsStore(colorSchemeSelector);
    const [isSecureEntry, setIsSecureEntry] = useState(true);

    const iconColor = maskColor ?? (colorScheme === 'dark' ? '#000' : '#666');
    const iconName = isSecureEntry ? 'eye' : 'eye-off';

    const toggle = useCallback(() => {
      setIsSecureEntry((isSecure) => !isSecure);
    }, []);

    return (
      <TextInput
        {...props}
        secureTextEntry={isSecureEntry}
        render={({style, ...renderProps}: any) => {
          return (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <RNTextInput {...renderProps} ref={ref} style={[style, {flex: 1}]} />
              <IconButton icon={iconName} onPress={toggle} iconColor={iconColor} size={20} />
            </View>
          );
        }}
      />
    );
  },
);

export default PasswordInput;
