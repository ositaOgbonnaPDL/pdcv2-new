import {motify} from '@motify/core';
import {flow} from 'fp-ts/lib/function';
import {useAnimationState} from 'moti';
import React, {ReactNode, useCallback} from 'react';
import {
  TouchableNativeFeedback,
  TouchableNativeFeedbackProps,
} from 'react-native';

const Motified = motify(TouchableNativeFeedback)();

type Touchable = TouchableNativeFeedbackProps & {
  children: ReactNode;
};

const noop = () => {};

export default function Touchable({
  children,
  onPressIn = noop,
  onPressOut = noop,
  ...props
}: Touchable) {
  const animation = useAnimationState({
    from: {
      scale: 1,
    },
    down: {
      opacity: 1,
      scale: 0.8,
    },
  });

  const animateUp = useCallback(() => animation.transitionTo('from'), []);
  const animateDown = useCallback(() => animation.transitionTo('down'), []);

  return (
    <Motified
      {...props}
      state={animation}
      onPressIn={flow(onPressIn, animateDown)}
      onPressOut={flow(onPressOut, animateUp)}
      transition={{damping: 100, type: 'spring', stiffness: 200}}>
      {children}
    </Motified>
  );
}
