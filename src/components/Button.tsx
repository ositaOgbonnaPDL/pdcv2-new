/**
 * Button Component
 * Wraps React Native Paper Button with custom styling and animations
 */

import React, {ComponentProps} from 'react';
import {StyleSheet} from 'react-native';
import {Button as PaperButton} from 'react-native-paper';
import {radius} from '../theme';
import Touchable from './Touchable';

type PaperButtonProps = ComponentProps<typeof PaperButton>;

type ButtonProps = PaperButtonProps & {
  animated?: boolean;
};

function Button({
  icon,
  mode = 'contained',
  style,
  children,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  return (
    <Touchable onPress={onPress} disabled={disabled}>
      <PaperButton
        {...props}
        mode={mode}
        icon={icon}
        disabled={disabled}
        style={[styles.container, style]}
        theme={{roundness: radius}}>
        {children}
      </PaperButton>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 25,
  },
});

export default Button;
