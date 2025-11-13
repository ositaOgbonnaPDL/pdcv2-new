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
import {Caption, Colors, TextInput as PaperInput} from 'react-native-paper';
import {primaryDark} from '../colors';
import useSettings, {colorSchemeSelector} from '../stores/settings';
import {radius} from '../theme';
import ErrorLabel from './ErrorLabel';
import Spacer from './Spacer';

type PaperInputProps = ComponentProps<typeof PaperInput>;

type TextInput = PaperInputProps & {
  errorMessage?: string;
  labelStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<TextStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

type EventFn = (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;

const TextInput = forwardRef<RNTextInput, TextInput>(
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
    const colorScheme = useSettings(colorSchemeSelector);

    const isDark = colorScheme === 'dark';

    const color = isDark ? Colors.white : '#686775';

    const _onBlur = useCallback<EventFn>(
      (e) => {
        onBlur?.(e);
        setFocused(false);
      },
      [onBlur],
    );

    const _onFocus = useCallback<EventFn>(
      (e) => {
        onFocus?.(e);
        setFocused(true);
      },
      [onFocus],
    );

    const newProps = {
      ...props,
      onBlur: _onBlur,
      onFocus: _onFocus,
    };

    return (
      <View style={style}>
        <Spacer>
          <View>
            {label && (
              <Caption style={[styles.label, {color}, labelStyle]}>
                {label}
              </Caption>
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
                  style={[styles.field, contentStyle]}
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
    // backgroundColor: '#FAFBFC',
  },
  field: {
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 14,
    marginLeft: 7,
    marginBottom: 7,
  },
  error: {
    borderColor: Colors.red600,
  },
});

export default TextInput;
