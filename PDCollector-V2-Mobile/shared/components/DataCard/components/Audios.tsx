import React, {ReactElement} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Colors, Text} from 'react-native-paper';
import Mic from '../../../../assets/svg/sf/mic.fill.svg';
import {primary} from '../../../colors';
import useSettings, {colorSchemeSelector} from '../../../stores/settings';
import {Field} from '../../../types/project';
import Spacer from '../../Spacer';

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  audio: {
    margin: 3,
    borderWidth: 1,
    borderRadius: 100,
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderColor: Colors.grey300,
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default function Audios({
  data,
  style,
  renderItem,
}: {
  data: Field[];
  style?: StyleProp<ViewStyle>;
  renderItem?: (id: Field['id']) => ReactElement | null;
}) {
  const colorScheme = useSettings(colorSchemeSelector);

  return (
    <View style={[styles.container, style]}>
      {data.map(({id, name}) => {
        return (
          <View key={`${id}-${name}`} style={styles.audio}>
            <Spacer horizontal>
              <View style={styles.wrapper}>
                <Spacer gap={5} horizontal>
                  <Mic
                    width={20}
                    height={20}
                    color={colorScheme === 'dark' ? 'white' : primary}
                  />
                  <Text>{name}</Text>
                </Spacer>
              </View>

              {renderItem?.(id)}
            </Spacer>
          </View>
        );
      })}
    </View>
  );
}
