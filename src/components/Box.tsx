/**
 * Box Component
 * Simple View wrapper with style props
 */

import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

type BoxProps = ViewStyle & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function Box({children, style, ...props}: BoxProps) {
  return <View style={[style, props]}>{children}</View>;
}

export default Box;
