/**
 * Notification Component
 * Animated toast notification using Moti
 */

import {AnimatePresence, View as MotiView} from 'moti';
import React, {useMemo, useState, useRef, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type NotificationProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  status: 'success' | 'warning' | 'error';
};

function Notification({
  status,
  message,
  visible,
  onDismiss,
  duration = 2000,
}: NotificationProps) {
  const color =
    status === 'success'
      ? '#4CAF50'
      : status === 'warning'
      ? '#FBC02D'
      : status === 'error'
      ? '#F44336'
      : '#2196F3';

  const insets = useSafeAreaInsets();
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [height, setHeight] = useState<number>(100);

  const insetTop = useMemo(() => {
    return -(insets.top * 2 + height);
  }, [height, insets.top]);

  useEffect(() => {
    const id = timeout.current;
    return () => {
      if (id) clearTimeout(id);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <MotiView
          style={styles.wrapper}
          from={{transform: [{translateY: insetTop}]}}
          exit={{transform: [{translateY: insetTop}]}}
          animate={{transform: [{translateY: insets.top}]}}
          onDidAnimate={(_, __, ___, {attemptedValue}) => {
            const [{translateY}] = attemptedValue as any;

            const isInfinity =
              duration === Number.POSITIVE_INFINITY ||
              duration === Number.NEGATIVE_INFINITY;

            if (translateY === insets.top && !isInfinity) {
              if (timeout.current) clearTimeout(timeout.current);
              timeout.current = setTimeout(onDismiss, duration);
            }
          }}
          onLayout={({nativeEvent: {layout}}) => setHeight(layout.height)}>
          <View
            style={[
              styles.container,
              {shadowColor: color, backgroundColor: color},
            ]}>
            <Text style={styles.message}>{message}</Text>
          </View>
        </MotiView>
      ) : null}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    left: 0,
    right: 0,
    zIndex: 100000,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '90%',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    shadowRadius: 20,
    shadowOpacity: 0.4,
    shadowOffset: {width: 0, height: 15},
  },
  message: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Notification;
