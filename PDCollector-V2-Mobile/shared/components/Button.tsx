import {motify} from 'moti';
import React, {ComponentProps} from 'react';
import {
  StyleSheet,
  TouchableNativeFeedback,
  TouchableNativeFeedbackProps,
} from 'react-native';
import {Button as PaperButton} from 'react-native-paper';
import {radius} from '../theme';
import Touchable from './Touchable';

const Motified = motify(TouchableNativeFeedback)();

type Button = TouchableNativeFeedbackProps &
  ComponentProps<typeof PaperButton> & {
    animated?: boolean;
    // contentContainerStyle?: StyleProp<ViewStyle>;
  };

// const Button = ({
//   style,
//   children,
//   mode = 'contained',
//   contentContainerStyle,
//   ...props
// }: Button) => {
//   const {colors} = useTheme();

//   const animation = useAnimationState({
//     from: {transform: [{scale: 1}]},
//     down: {transform: [{scale: 0.8}]},
//   });

//   return (
//     <Touchable {...props}>
//       <PaperButton
//         {...{mode}}
//         color={colors.primaryDark}
//         style={[styles.container, style]}>
//         {children}
//       </PaperButton>
//     </Touchable>
//   );
// };

const MotifiedPressable = motify(TouchableNativeFeedback)();

const noop = () => {};

function Button({
  icon,
  dark,
  theme,
  color,
  style,
  compact,
  loading,
  children,
  disabled,
  uppercase,
  labelStyle,
  contentStyle,
  mode = 'contained',
  // contentContainerStyle,
  ...props
}: Button) {
  return (
    <Touchable {...props} disabled={disabled}>
      <PaperButton
        {...{
          icon,
          dark,
          mode,
          color,
          loading,
          compact,
          disabled,
          uppercase,
          labelStyle,
          contentStyle,
        }}
        style={[styles.container, style]}
        theme={{roundness: radius, ...theme}}>
        {children}
      </PaperButton>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    // borderRadius: radius,
    paddingHorizontal: 25,
  },
});

export default Button;
