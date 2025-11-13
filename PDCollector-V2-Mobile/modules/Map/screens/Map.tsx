import {useNavigation, useRoute} from '@react-navigation/core';
import {formatDistanceToNow} from 'date-fns';
import * as A from 'fp-ts/Array';
import {flow, pipe} from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import React, {createRef, useEffect, useMemo, useState} from 'react';
import {Dimensions, FlatList, Platform, StyleSheet, View} from 'react-native';
import MapViewRef, {
  LatLng,
  Marker,
  Polygon,
  Polyline,
  SnapshotOptions,
} from 'react-native-maps';
import {useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SharedElement} from 'react-navigation-shared-element';
import {match} from 'ts-pattern';
import {useTaskManager} from '../../../contexts/TaskManager';
import {Task, TaskRef} from '../../../contexts/TaskManager/types';
import {primary} from '../../../shared/colors';
import Card from '../../../shared/components/DataCard';
import MapView from '../../../shared/components/Map';
import StatusBar from '../../../shared/components/MapStatusBar';
import Touchable from '../../../shared/components/Touchable';
import useSettings, {
  colorSchemeSelector,
} from '../../../shared/stores/settings';
import {Field, Project} from '../../../shared/types/project';
import {isPointTuple, pointToLatLng} from '../../../shared/utils';
import {getRegion} from '../../../shared/utils/map';

type Params = {
  index: number;
  tasks: Task[];
  project: Project;
  fields: Record<Field['id'], Field>;
};

const {width} = Dimensions.get('screen');

const itemWidth = width - 50;

const options: SnapshotOptions = {width, quality: 0.8, format: 'png'};

const styles = StyleSheet.create({
  overlay: {
    // flex: 1,
    left: 0,
    bottom: 0,
    position: 'absolute',
    alignSelf: 'flex-end',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  container: {
    padding: 20,
    borderRadius: 10,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowRadius: 15,
        shadowOpacity: 0.4,
        shadowOffset: {width: 0, height: 7},
      },
    }),
  },
  task: {
    width: itemWidth,
    paddingHorizontal: 10,
  },
  tasks: {
    padding: 20,
    alignItems: 'center',
  },
});

export default function Map() {
  const nav = useNavigation();
  const {colors} = useTheme();
  const {params = {}} = useRoute();
  const ref = createRef<MapViewRef>();
  const {spawnedTasks} = useTaskManager();
  const colorScheme = useSettings(colorSchemeSelector);

  const {index = 0, project, tasks, fields} = params as Params;

  const [currentIndex, setIndex] = useState(index);

  const {id: taskId} = tasks?.[currentIndex];

  const mappedCoords = useMemo(() => {
    return pipe(
      tasks,
      O.fromNullable,
      O.chainNullableK(
        A.map(
          flow(
            O.fromNullable,
            O.map(({id, geometry}) => {
              const {coordinates} = geometry;

              const coords = isPointTuple(coordinates)
                ? pointToLatLng(coordinates)
                : coordinates[0].map(pointToLatLng);

              return [id, coords] as const;
            }),
            O.getOrElse(() => [] as any),
          ),
        ),
      ),
      O.fold(() => ({}), Object.fromEntries),
    );
  }, [tasks]);

  const currentGeometry = mappedCoords[taskId];

  useEffect(() => {
    const map = ref.current;

    const geometry = currentGeometry as undefined | LatLng | LatLng[];

    if (geometry) {
      if (Array.isArray(geometry)) {
        map?.fitToCoordinates(geometry);
      } else {
        map?.getCamera().then((camera) => {
          camera.zoom = 8;
          camera.center = geometry;
          map?.animateCamera(camera);
        });
      }
    }
  }, [currentGeometry]);

  return (
    <>
      <StatusBar />

      <SharedElement id={`map-${taskId}`} style={StyleSheet.absoluteFillObject}>
        <MapView ref={ref} style={styles.map}>
          {tasks?.map(({id, geometry, collectedOn}) => {
            const {type} = geometry;

            let _coords = mappedCoords[id as any];

            const attr = {
              key: id,
              strokeWidth: 3,
              strokeColor: 'red',
              coordinates: _coords,
            };

            return match(type)
              .with('Polygon', () => <Polygon {...attr} />)
              .with('LineString', () => <Polyline {...attr} />)
              .with('Point', () => (
                <Marker
                  key={id}
                  coordinate={_coords}
                  {...{
                    title:
                      collectedOn &&
                      `Capture ${formatDistanceToNow(
                        new Date(collectedOn),
                      )} ago`,
                  }}
                />
              ))
              .exhaustive();
          })}
        </MapView>
      </SharedElement>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <FlatList
          horizontal
          data={tasks}
          pagingEnabled
          snapToEnd={false}
          snapToStart={false}
          initialNumToRender={3}
          decelerationRate="fast"
          snapToInterval={itemWidth}
          keyExtractor={({id}) => id}
          contentContainerStyle={styles.tasks}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={({nativeEvent: {contentOffset}}) => {
            setIndex(Math.round(contentOffset.x / itemWidth));
          }}
          renderItem={({item: task}) => {
            const {id, geometry} = task;
            const actor = spawnedTasks.get(id);

            return (
              <Touchable
                onPress={async () => {
                  const point =
                    geometry.type === 'Point'
                      ? geometry.coordinates
                      : ([] as any);

                  const polygon =
                    geometry.type !== 'Point'
                      ? geometry.coordinates[0].map(pointToLatLng)
                      : undefined;

                  const region = getRegion(point, polygon);

                  const snapshot = await ref.current?.takeSnapshot({
                    ...options,
                    region,
                  });

                  nav.navigate('Details', {project, snapshot, task});
                }}>
                <View style={styles.task}>
                  <View
                    style={[
                      styles.container,
                      {
                        shadowColor: colors.surface,
                        backgroundColor:
                          colorScheme === 'dark' ? primary : 'white',
                      },
                    ]}>
                    {/* <SharedElement id={`header-${ctx?.id}`}>
                        <View>
                          <Title>{name}</Title>
                          <Caption>{projectTypes[type]}</Caption>
                        </View>
                      </SharedElement> */}

                    <SharedElement id={`content-${id}`}>
                      <Card
                        show={[]}
                        fields={fields}
                        actor={actor as TaskRef}
                      />
                    </SharedElement>
                  </View>
                </View>
              </Touchable>
            );
          }}
        />
      </SafeAreaView>
    </>
  );
}
