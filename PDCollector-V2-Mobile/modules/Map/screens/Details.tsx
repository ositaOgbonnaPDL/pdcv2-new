import {useNavigation, useRoute} from '@react-navigation/core';
import {format} from 'date-fns';
import {pipe} from 'fp-ts/lib/function';
import {values} from 'ramda';
import React, {useMemo} from 'react';
import {Dimensions, FlatList, Image, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Caption,
  Colors,
  Divider,
  Paragraph,
  Subheading,
  Title,
  useTheme,
} from 'react-native-paper';
import {SharedElement} from 'react-navigation-shared-element';
import {Asset, Task} from '../../../contexts/TaskManager/types';
import Audios from '../../../shared/components/DataCard/components/Audios';
import Images from '../../../shared/components/DataCard/components/Images';
import StatusBar from '../../../shared/components/MapStatusBar';
import Spacer from '../../../shared/components/Spacer';
import useSettings, {
  colorSchemeSelector,
} from '../../../shared/stores/settings';
import {Project} from '../../../shared/types/project';
import {
  createFieldsMap,
  groupByType,
  projectTypes,
} from '../../../shared/utils';

const {width} = Dimensions.get('screen');

type Params = {
  task: Task;
  project: Project;
  snapshot: string;
};

const styles = StyleSheet.create({
  header: {
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    position: 'absolute',
  },
});

export default function Details() {
  const nav = useNavigation();
  const {colors} = useTheme();
  const {params = {}} = useRoute();
  const colorScheme = useSettings(colorSchemeSelector);

  const {task, project, snapshot} = params as Params;

  const {type, name, fields} = project;

  const {id, data, assets, collectedOn} = task;

  const isDark = colorScheme === 'dark';

  const mappedFields = useMemo(() => createFieldsMap(fields), [fields]);

  const {image = [], audio = [], other = []} = useMemo(() => {
    return pipe(mappedFields, values, groupByType);
  }, [mappedFields]);

  const _images = useMemo(() => {
    return image.map(({id}) => {
      const uri = data[id];
      const asset = assets.get(String(id));
      return {...asset, uri: uri ?? asset?.uri} as Asset;
    });
  }, [image]);

  return (
    <View style={{flex: 1}}>
      <StatusBar />

      <View style={{height: '40%'}}>
        <SharedElement id={`map-${id}`} style={StyleSheet.absoluteFillObject}>
          <Image
            resizeMode="cover"
            source={{width, uri: snapshot}}
            style={{width: '100%', height: '100%'}}
          />
        </SharedElement>

        {/* <SharedElement id={`header-${id}`}> */}
        <LinearGradient
          style={styles.header}
          colors={['transparent', colors.background]}>
          <Title>{name}</Title>
          <Paragraph>{projectTypes[type]}</Paragraph>
          {/* <Caption>{formatDistanceToNow(new Date(collectedOn))}</Caption> */}
          <Caption>
            Captured on {format(new Date(collectedOn), "dd/MM/yyyy 'at' HH:mm")}
          </Caption>
        </LinearGradient>
        {/* </SharedElement> */}
      </View>

      <SharedElement id={`content-${id}`} style={{flex: 1}}>
        <FlatList
          data={other}
          keyExtractor={({id}) => String(id)}
          contentContainerStyle={{paddingBottom: 50}}
          ItemSeparatorComponent={() => <View style={{height: 10}} />}
          style={{
            flex: 1,
            padding: 20,
            backgroundColor: colors.background,
          }}
          renderItem={({item}) => {
            const {id, name} = item;
            const value = data[id] ?? 'Nil';

            return (
              <View key={id}>
                <Subheading>{name}</Subheading>
                {!!value && <Caption>{value}</Caption>}
              </View>
            );
          }}
          ListFooterComponentStyle={{marginTop: 10}}
          ListFooterComponent={() => {
            return (
              <View>
                {(image.length > 0 || audio.length > 0) && (
                  <Divider
                    style={{
                      backgroundColor: isDark ? Colors.grey600 : Colors.grey400,
                    }}
                  />
                )}

                <View>
                  <Spacer>
                    {image.length > 0 ? (
                      <View>
                        <Spacer>
                          <Subheading>Images</Subheading>
                          <Images data={_images} />
                        </Spacer>
                      </View>
                    ) : null}

                    {audio?.length > 0 ? (
                      <View>
                        <Spacer>
                          <Subheading>Recordings</Subheading>
                          <Audios data={audio} />
                        </Spacer>
                      </View>
                    ) : null}
                  </Spacer>
                </View>
              </View>
            );
          }}
        />
      </SharedElement>
    </View>
  );
}
