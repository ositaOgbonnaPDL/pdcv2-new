/**
 * TextInput Component
 * Custom text input with label and error handling
 */

import React, {ComponentProps, forwardRef, useCallback, useState} from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputFocusEventData,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import useSettingsStore, {colorSchemeSelector} from '../stores/settingsStore';
import {radius, primaryDark} from '../theme';
import ErrorLabel from './ErrorLabel';
import Spacer from './Spacer';

type TextInputProps = ComponentProps<typeof RNTextInput> & {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  labelStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<TextStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  render?: (props: any) => React.ReactElement;
};

type EventFn = (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;

const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      style,
      error,
      render,
      onBlur,
      onFocus,
      labelStyle,
      errorMessage,
      contentStyle,
      contentContainerStyle,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const colorScheme = useSettingsStore(colorSchemeSelector);
    const theme = useTheme();

    const isDark = colorScheme === 'dark';
    const labelColor = isDark ? theme.colors.onSurface : '#686775';

    const _onBlur = useCallback(
      (e: any) => {
        onBlur?.(e);
        setFocused(false);
      },
      [onBlur],
    );

    const _onFocus = useCallback(
      (e: any) => {
        onFocus?.(e);
        setFocused(true);
      },
      [onFocus],
    );

    const newProps = {
      ...props,
      onBlur: _onBlur as any,
      onFocus: _onFocus as any,
    };

    return (
      <View style={style}>
        <Spacer>
          <View>
            {label && (
              <Text
                variant="bodySmall"
                style={[styles.label, {color: labelColor}, labelStyle]}>
                {label}
              </Text>
            )}
            <View
              style={[
                styles.container,
                error && styles.error,
                {
                  borderRadius: radius,
                  backgroundColor: isDark ? '#B5B5B5' : 'white',
                  borderColor: focused
                    ? isDark
                      ? 'white'
                      : primaryDark
                    : '#d0d2d6',
                },
                contentContainerStyle,
              ]}>
              {render ? (
                render({
                  ...newProps,
                  ref,
                  focused,
                  style: [styles.field, contentStyle],
                } as any)
              ) : (
                <RNTextInput
                  {...newProps}
                  ref={ref}
                  style={[
                    styles.field,
                    {color: isDark ? '#000' : '#000'},
                    contentStyle,
                  ]}
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
              )}
            </View>
          </View>
          {error && errorMessage ? <ErrorLabel message={errorMessage} /> : null}
        </Spacer>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
  },
  field: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    marginLeft: 7,
    marginBottom: 7,
  },
  error: {
    borderColor: '#C62828',
  },
});

export default TextInput;
