/**
 * Touchable Component
 * Animated touchable with press feedback using moti
 */

import {MotiView} from 'moti';
import React, {ReactNode, useState} from 'react';
import {
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
} from 'react-native';

type TouchableProps = TouchableWithoutFeedbackProps & {
  children: ReactNode;
};

export default function Touchable({
  children,
  disabled,
  ...props
}: TouchableProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableWithoutFeedback
      {...props}
      disabled={disabled}
      onPressIn={(e) => {
        setIsPressed(true);
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setIsPressed(false);
        props.onPressOut?.(e);
      }}>
      <MotiView
        animate={{
          scale: isPressed ? 0.95 : 1,
          opacity: isPressed ? 0.8 : 1,
        }}
        transition={{
          type: 'timing',
          duration: 150,
        } as any}>
        {children}
      </MotiView>
    </TouchableWithoutFeedback>
  );
}
