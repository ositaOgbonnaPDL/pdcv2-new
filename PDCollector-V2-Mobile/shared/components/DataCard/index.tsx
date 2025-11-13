import {useActor} from '@xstate/react';
import {formatDistanceToNow} from 'date-fns';
import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  Caption,
  Colors,
  ProgressBar,
  Subheading,
  Title,
} from 'react-native-paper';
import {FlatGrid} from 'react-native-super-grid';
import CheckCloud from '../../../assets/svg/sf/checkmark.icloud.fill.svg';
import {Asset, TaskRef, TaskState} from '../../../contexts/TaskManager/types';
import {primary, primaryDark} from '../../colors';
import useSettings, {colorSchemeSelector} from '../../stores/settings';
import {Field} from '../../types/project';
import {groupByType} from '../../utils';
import Box from '../Box';
import Spacer from '../Spacer';
import Audios from './components/Audios';
import Images from './components/Images';
// @ts-ignore
import {Col, Cols} from 'react-native-cols';

export default function DataCard({
  actor,
  style,
  fields,
  show = ['image', 'audio'],
}: {
  actor: TaskRef;
  show?: ('image' | 'audio')[];
  style?: StyleProp<ViewStyle>;
  fields: Record<string, Field>;
}) {
  const [current] = useActor(actor);
  const colorScheme = useSettings(colorSchemeSelector);

  const {
    id,
    data,
    state,
    collectedOn,
    assetUploader,
    error,
    retries,
  } = current.context;

  // console.log(error, retries /** (error as any)?.response?.data **/);

  const [{context}] = useActor(assetUploader);

  const {assets} = context;

  const dataKeys = Object.keys(data);

  const mappedData = useMemo(() => {
    return dataKeys.map((key) => fields[key]).filter(Boolean);
  }, [fields, dataKeys]);

  const hasPendingAssets = [...assets.values()].some(
    (asset) => asset.state !== TaskState.DONE,
  );

  const {image = [], audio = [], other = []} = useMemo(() => {
    return groupByType(mappedData);
  }, [mappedData]);

  const images = useMemo(() => {
    return image.map(({id}) => {
      const uri = data[id];
      const asset = assets.get(String(id));
      return {...asset, uri: uri ?? asset?.uri} as Asset;
    });
  }, [assets, data, image]);

  return (
    <View style={style}>
      <Spacer gap={17}>
        <Box
          top={15}
          right={15}
          position="absolute"
          flexDirection="row"
          justifyContent="flex-end">
          {state === TaskState.PENDING &&
            (hasPendingAssets ? (
              <Caption>waiting for files to upload</Caption>
            ) : (
              <Caption>pending</Caption>
            ))}

          {state === TaskState.UPLOADING && (
            <ActivityIndicator
              color={colorScheme === 'dark' ? 'white' : primaryDark}
            />
          )}

          {state === TaskState.DONE && (
            <CheckCloud
              width={20}
              height={20}
              strokeWidth={3}
              color={Colors.green500}
            />
          )}
        </Box>

        {other.length > 0 ? (
          <View>
            <FlatGrid
              spacing={3}
              key={`other-${id}`}
              data={other.slice(0, 3)}
              keyExtractor={(item) => `${item.id}-${id}`}
              renderItem={({item}) => {
                const {id, name} = item;

                return (
                  <View>
                    <Subheading>{name}</Subheading>
                    <Caption>{data[id]}</Caption>
                  </View>
                );
              }}
            />
          </View>
        ) : (
          <Title>No data</Title>
        )}

        <View>
          <Spacer>
            {show.includes('image') && images?.length > 0 ? (
              <Images
                data={images}
                renderItem={(id) => {
                  const asset = assets.get(id);

                  return (
                    asset?.state !== TaskState.DONE && (
                      <Box
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor="rgba(0, 0, 0, 0.4)"
                        style={StyleSheet.absoluteFillObject}>
                        <ActivityIndicator size="small" color="white" />
                      </Box>
                    )
                  );
                }}
              />
            ) : null}

            {show.includes('audio') && audio?.length > 0 ? (
              <Audios
                data={audio}
                renderItem={(id) => {
                  const asset = assets.get(String(id));
                  return asset?.state !== TaskState.DONE ? (
                    <ActivityIndicator size="small" color={primary} />
                  ) : null;
                }}
              />
            ) : null}
          </Spacer>
        </View>

        <Caption>
          Collected{' '}
          {formatDistanceToNow(new Date(collectedOn), {addSuffix: true})}
        </Caption>
      </Spacer>
    </View>
  );
}
