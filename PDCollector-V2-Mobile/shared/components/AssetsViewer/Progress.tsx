import React, {useEffect, useRef} from 'react';
import {Animated, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useTheme} from 'react-native-paper';

function Progress({
  style,
  progress,
  contentStyle,
}: {
  progress: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const {primary} = useTheme().colors;
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: progress,
      useNativeDriver: false,
    }).start();
  }, [progress, width]);

  return (
    <View style={style}>
      <Animated.View
        style={[
          styles.progress,
          {
            backgroundColor: primary,
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
          contentStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    opacity: 0.2,
    height: '100%',
  },
});

export default Progress;
