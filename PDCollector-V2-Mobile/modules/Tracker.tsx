import BottomSheet, {
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {formatDistanceToNow} from 'date-fns';
import {AnimatePresence, MotiSafeAreaView, MotiView} from 'moti';
import {keys} from 'ramda';
import React, {createRef, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  LayoutRectangle,
  StyleSheet,
  View,
} from 'react-native';
import MapViewRef, {Marker, Polyline} from 'react-native-maps';
import {Colors, Title, useTheme} from 'react-native-paper';
import {useQuery} from 'react-query';
import Stop from '../assets/svg/sf/stop.fill.svg';
import {PointTuple} from '../contexts/TaskManager/types';
import {useTracker} from '../contexts/TrackManager';
import {primary} from '../shared/colors';
import Button from '../shared/components/Button';
import MapView from '../shared/components/Map';
import StatusBar from '../shared/components/MapStatusBar';
import Spacer from '../shared/components/Spacer';
import {get} from '../shared/http';
import {TRACKS} from '../shared/query';
import authStore from '../shared/stores/auth';
import {Project} from '../shared/types/project';
import {pointToLatLng} from '../shared/utils';
import {initialRegion} from '../shared/utils/map';

let maxTries = 1000;

const LETTERS = '0123456789ABCDEF';

let generatedColors: string[] = [];

const randomColor = () => {
  let tries = 0;
  let color = '#';

  for (let i = 0; i < 6; i++) {
    color += LETTERS[Math.floor(Math.random() * 16)];
  }

  while (generatedColors.includes(color) && tries < maxTries) {
    color = randomColor();
    tries++;
  }

  return color;
};

type Track = {
  id: number;
  startDate: string;
  geometry: {
    type: 'LineString';
    coordinates: PointTuple[];
  };
};

const getTracks = async (id: Project['id']): Promise<Track[]> => {
  const {data} = await get(`/mobile/tracks/list/?projectId=${id}`);
  return data;
};

const initialSnapPoints = ['17%', 'CONTENT_HEIGHT'];

export default function Tracker() {
  const ref = useRef<MapViewRef>();
  const isFocused = useIsFocused();
  const {background} = useTheme().colors;
  const layout = useRef<LayoutRectangle>();
  const actionSheetRef = createRef<BottomSheet>();
  let [userActive, setUserActive] = useState(false);
  const {track, enabled, setTracking} = useTracker();
  const {project: id} = useRoute().params ?? ({} as any);

  const [selected, setSelectedTrack] = useState<Track['id'] | null>();

  const {
    animatedSnapPoints,
    handleContentLayout,
    animatedHandleHeight,
    animatedContentHeight,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const isAuth = authStore((s) => s.isAuthenticated);

  const {data: tracks = [], isFetching} = useQuery(
    [TRACKS, id],
    () => getTracks(id),
    {
      keepPreviousData: true,
      refetchInterval: false,
      enabled: isAuth && isFocused,
    },
  );

  const _tracks = useMemo(() => {
    return Object.fromEntries(tracks.map((t) => [t.id, t]));
  }, [tracks]);

  const selectedTrack = selected ? _tracks[selected] : null;

  const coords = useMemo(() => {
    return Object.fromEntries(
      tracks.map((t) => [
        t.id,
        t.geometry.coordinates
          ?.map(([y, x]) => [x, y] as PointTuple)
          .map(pointToLatLng),
      ]),
    );
  }, [tracks]);

  const colors = useMemo(() => {
    return Object.fromEntries(tracks.map((t) => [t.id, randomColor()]));
  }, [tracks]);

  const coordinates = track.map(pointToLatLng);

  const point = [...coordinates].pop();

  useEffect(() => {
    return () => {
      // clear generated colors before exit to avoid colors accumulating
      // which will in turn increase how long it take to generate new random colors
      generatedColors = [];
    };
  }, []);

  useEffect(() => {
    if (point && !userActive) {
      ref.current?.animateCamera({center: point}, {duration: 2000});
    }
  }, [ref, point, userActive]);

  useEffect(() => {
    if (!userActive) {
      ref.current?.fitToCoordinates(coordinates, {animated: true});
    }
  }, [ref, coordinates, userActive]);

  return (
    <>
      <StatusBar />

      <View style={StyleSheet.absoluteFillObject}>
        <MapView
          ref={ref as any}
          style={styles.map}
          initialRegion={initialRegion}
          onPanDrag={() => setUserActive(true)}>
          {point && <Marker coordinate={point} />}

          {keys(coords).map((k) => {
            const {id} = _tracks[k];
            const coordinates = coords[k];
            return !coordinates ? null : (
              <Polyline
                key={k}
                tappable
                strokeWidth={3}
                strokeColor={colors[k]}
                coordinates={coordinates}
                onPress={() => setSelectedTrack(id)}
              />
            );
          })}

          <Polyline
            strokeWidth={3}
            strokeColor="red"
            coordinates={coordinates}
          />
        </MapView>

        <MotiSafeAreaView
          pointerEvents="box-none"
          style={styles.container}
          onLayout={(e) => {
            layout.current = e.nativeEvent.layout;
          }}
          animate={{
            translateY: selectedTrack
              ? -(animatedContentHeight.value + (layout.current?.height ?? 0))
              : 0,
          }}>
          <Spacer>
            {point && (
              <AnimatePresence>
                {userActive && (
                  <MotiView
                    exit={{scale: 0.6, opacity: 0}}
                    from={{scale: 0.6, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}>
                    <Button
                      style={styles.btn}
                      color={Colors.white}
                      onPress={() => setUserActive(false)}
                      labelStyle={{color: primary, fontSize: 12}}>
                      Recenter
                    </Button>
                  </MotiView>
                )}
              </AnimatePresence>
            )}

            <View style={styles.hCenter}>
              {isFetching && (
                <ActivityIndicator
                  size="small"
                  color={Colors.red600}
                  style={{marginRight: 10}}
                />
              )}

              <Button
                style={styles.btn}
                disabled={!enabled}
                color={Colors.red600}
                onPress={() => setTracking({enable: false})}
                icon={({size, color}) => (
                  <Stop width={size} height={size} color={color} />
                )}>
                Stop
              </Button>
            </View>
          </Spacer>
        </MotiSafeAreaView>

        {selectedTrack && (
          <BottomSheet
            enablePanDownToClose
            ref={actionSheetRef}
            snapPoints={animatedSnapPoints}
            handleHeight={animatedHandleHeight}
            contentHeight={animatedContentHeight}
            onClose={() => setSelectedTrack(null)}
            backgroundStyle={{backgroundColor: background}}>
            <View style={styles.sheet} onLayout={handleContentLayout}>
              <Spacer>
                <View style={styles.hCenter}>
                  <Title>Color: </Title>
                  <View
                    style={[
                      styles.color,
                      {backgroundColor: colors[selectedTrack.id]},
                    ]}
                  />
                </View>

                <Title>
                  Collected{' '}
                  {formatDistanceToNow(new Date(selectedTrack.startDate), {
                    addSuffix: true,
                  })}
                </Title>
              </Spacer>
            </View>
          </BottomSheet>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  container: {
    right: 0,
    bottom: 0,
    margin: 10,
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  hCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    borderRadius: 100,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  sheet: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  color: {
    width: 20,
    height: 20,
    marginStart: 10,
  },
});
