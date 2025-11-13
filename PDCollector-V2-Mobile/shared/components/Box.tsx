import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

type Box = ViewStyle & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function Box({children, style, ...props}: Box) {
  return <View style={[style, props]}>{children}</View>;
}

export default Box;
