import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Caption, Colors, IconButton, Subheading} from 'react-native-paper';
import ArrowClockwise from '../../../assets/svg/sf/arrow.clockwise.svg';
import Microphone from '../../../assets/svg/sf/mic.fill.svg';
import {Asset} from '../../../contexts/TaskManager/types';
import {primary} from '../../colors';
import useSettings, {colorSchemeSelector} from '../../stores/settings';
import {NotFound, placeholder} from '../../utils';
import Spacer from '../Spacer';
import Progress from './Progress';

const styles = StyleSheet.create({
  container: {
    padding: 10,
    minHeight: 60, // to prevent excessive layout shifts due to toggling of retry icon which causes a change in the container height
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  wrapper: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: Colors.grey400,
  },
});

function AssetViewer({
  asset,
  // actor,
  error,
  onRetry,
}: {
  asset: Asset;
  error?: Error;
  onRetry(): void;
  // actor: ActorRef<Events, States>;
}) {
  const {uri, type, fileName, progress} = asset;
  const colorScheme = useSettings(colorSchemeSelector);

  const hasError = Boolean(error);
  const _progress = hasError ? 100 : progress;
  const isNotFoundError = error instanceof NotFound;

  return (
    <View style={styles.wrapper}>
      <Progress
        {...{progress: _progress}}
        style={StyleSheet.absoluteFillObject}
        contentStyle={hasError && {backgroundColor: Colors.redA700}}
      />

      <View style={styles.container}>
        <Spacer horizontal>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <Spacer horizontal>
              {type === 'mp4' ? (
                <Microphone
                  width={25}
                  height={25}
                  color={colorScheme === 'dark' ? 'white' : primary}
                />
              ) : (
                <Image
                  style={styles.image}
                  source={{uri: isNotFoundError ? placeholder : uri}}
                />
              )}

              <View style={{flex: 1}}>
                <Subheading numberOfLines={1}>{fileName}</Subheading>
                {isNotFoundError && <Caption>Not Found</Caption>}
              </View>
            </Spacer>
          </View>

          {hasError && !isNotFoundError && (
            <IconButton
              onPress={onRetry}
              icon={({size, color}) => (
                <ArrowClockwise width={size} height={size} color={color} />
              )}
            />
          )}
        </Spacer>
      </View>
    </View>
  );
}

export default AssetViewer;
