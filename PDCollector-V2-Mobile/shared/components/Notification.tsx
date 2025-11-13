import {AnimatePresence, View as MotifView} from 'moti';
import React, {useMemo, useState, useRef, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Colors, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Notification = {
  message: string;
  visible: boolean;
  onDismiss(): void;
  duration?: number;
  status: 'success' | 'warning' | 'error';
};

function Notification({
  status,
  message,
  visible,
  onDismiss,
  duration = 2000,
}: Notification) {
  const color =
    status === 'success'
      ? Colors.green500
      : status === 'warning'
      ? Colors.yellow700
      : status === 'error'
      ? Colors.red500
      : Colors.blue500;

  const insets = useSafeAreaInsets();

  const timeout = useRef<NodeJS.Timeout>();

  // set initial height value to a large value to avoid
  // flickering due to change in the offset top calculation
  // when we get rendered.
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
        <MotifView
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
        </MotifView>
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
    color: Colors.white,
  },
});

export default Notification;
