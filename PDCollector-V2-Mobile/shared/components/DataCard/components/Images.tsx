import React, {ReactNode} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Image from 'react-native-fast-image';
import {Asset} from '../../../../contexts/TaskManager/types';
import {radius} from '../../../theme';

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  wrapper: {
    margin: 3,
    width: 50,
    height: 50,
    overflow: 'hidden',
    borderRadius: radius,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default function Images({
  data,
  style,
  renderItem,
}: {
  data: Asset[];
  style?: StyleProp<ViewStyle>;
  renderItem?: (id: Asset['id']) => ReactNode;
}) {
  return (
    <View style={[style, styles.container]}>
      {data.map(({id, uri}) => {
        return (
          <View key={`${id}-${uri}`} style={styles.wrapper}>
            <Image
              style={styles.image}
              source={{uri, priority: Image.priority.high}}
            />
            {renderItem?.(id)}
          </View>
        );
      })}
    </View>
  );
}
