/* eslint-disable react-native/no-inline-styles */
import {useMachine} from '@xstate/react';
import {MotiView} from 'moti';
import React, {
  createRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {Alert, AlertButton, BackHandler, StyleSheet, View} from 'react-native';
import MapView, {LatLng, Marker, Polygon, Polyline} from 'react-native-maps';
import {Caption, Colors, Text} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {match} from 'ts-pattern';
import AlertIcon from '../../../../assets/svg/sf/exclamationmark.circle.fill.svg';
import {PointTuple} from '../../../../contexts/TaskManager/types';
import {primary} from '../../../../shared/colors';
import Button from '../../../../shared/components/Button';
import Map from '../../../../shared/components/Map';
import StatusBar from '../../../../shared/components/MapStatusBar';
import Spacer from '../../../../shared/components/Spacer';
import {Feature, Project} from '../../../../shared/types/project';
import {latlngToPoint, pointToLatLng} from '../../../../shared/utils';
import {initialRegion} from '../../../../shared/utils/map';
import machine from './machine';
import {pointInPolygon} from './utils';

const initialLatLng = {
  latitude: 0,
  longitude: 0,
};

const accuracyLevelMsg = (accuracyLevel: number) => {
  return `Accuracy level must be below ${accuracyLevel}m to capture any point`;
};

const cancelBtn: AlertButton = {text: 'Cancel', style: 'cancel'};

const invalidPolygonMsg = `Point(s) captured do not make a valid polygon, a valid polygon should contain at least three distinct points`;

const invalidPolylineMsg = `Point(s) captured do not make a valid polyline, a valid polyline should contain at least two distinct points`;

const geofenceMsg = 'Points collected must be with this region';

const redHex = '#ff5a5a';
const lightRedHex = '#ff5a5a36';

const useGeofences = (point: LatLng, polygons: LatLng[][]) => {
  let [inFence, setInFence] = useState<boolean>();

  useEffect(() => {
    (async () => {
      const all = await Promise.all(
        polygons.map((poly) => {
          return pointInPolygon(poly.map(latlngToPoint), latlngToPoint(point));
        }),
      );

      // if the point falls within at least one polygon
      setInFence(all.some((n) => n));
    })();
  }, [point, polygons]);

  return inFence;
};

export default function FeaturePicker({
  feature,
  onDismiss,
  geofence = [],
  distanceFilter,
  showAccuracyLevelAlert,
}: {
  feature: Feature;
  distanceFilter?: number;
  geofence: Project['geofence'];
  showAccuracyLevelAlert: boolean;
  onDismiss(
    args: {
      mocked: boolean;
      coordinates: LatLng[];
    } | null,
  ): void;
}) {
  const ref = createRef<MapView>();

  let [ready, setReady] = useState(false);

  const fence = useMemo(() => {
    return geofence.map(({geometry}) => {
      return geometry.coordinates[0]
        .map(([y, x]) => [x, y] as PointTuple)
        .map(pointToLatLng);
    });
  }, [geofence]);

  const [state, send] = useMachine(machine, {
    context: {
      feature,
      mocked: false,
      distanceFilter,
      coordinates: [],
      point: initialLatLng as any,
    },
    actions: {
      onDone: ({mocked, coordinates}) => {
        onDismiss(coordinates.length <= 0 ? null : {mocked, coordinates});
      },

      notifyPointError: ({mocked, coordinates}) => {
        Alert.alert(feature, 'No point captured', [
          cancelBtn,
          {
            text: 'Continue',
            onPress: () => {
              onDismiss(coordinates.length <= 0 ? null : {mocked, coordinates});
            },
          },
        ]);
      },

      notifyPolygonError: ({mocked, coordinates}) => {
        Alert.alert(feature, invalidPolygonMsg, [
          cancelBtn,
          {
            text: 'Continue',
            onPress: () => {
              onDismiss(coordinates.length <= 0 ? null : {mocked, coordinates});
            },
          },
        ]);
      },

      notifyPolylineError: ({mocked, coordinates}) => {
        Alert.alert(feature, invalidPolylineMsg, [
          cancelBtn,
          {
            text: 'Continue',
            onPress: () => {
              onDismiss(coordinates.length <= 0 ? null : {mocked, coordinates});
            },
          },
        ]);
      },
    },
  });

  const {error, point, mocked, coordinates} = state.context;

  const isPoint = feature === 'POINT';

  const isPolyline = feature === 'LINESTRING';

  const isDone = state.matches({active: 'done'});

  const disabledAll = state.matches('error') || state.matches('inactive');

  const inAnyFence = useGeofences(point ?? initialLatLng, fence);

  const hasGeofence = geofence.length > 0;

  const clearBtn = (
    <Button
      color={Colors.red400}
      disabled={disabledAll}
      onPress={() => send('CLEAR')}
      labelStyle={{color: 'white'}}
      style={(isPoint || isPolyline) && [styles.btn, styles.btnContent]}>
      Clear
    </Button>
  );

  const pickBtn = (
    <Button
      onPress={() => send('POINT:CAPTURE')}
      style={[styles.btnContent, styles.btn]}
      disabled={
        isDone ||
        disabledAll ||
        (hasGeofence && !inAnyFence) ||
        (point.latitude === 0 && point.longitude === 0) ||
        Boolean(distanceFilter && point.accuracy > distanceFilter)
      }>
      ({coordinates.length}) Capture
    </Button>
  );

  useLayoutEffect(() => {
    if (ready && distanceFilter && showAccuracyLevelAlert) {
      Alert.alert(
        'Accuracy level',
        accuracyLevelMsg(distanceFilter),
        undefined,
        {cancelable: true},
      );
    }
  }, [ready, distanceFilter, showAccuracyLevelAlert]);

  useLayoutEffect(() => {
    if (state.matches('error')) {
      Alert.alert('Location error', error?.message, [
        {
          text: 'RETRY',
          onPress: () => send('RETRY'),
        },
      ]);
    }
  }, [error, send, state]);

  useEffect(() => {
    if (ready) {
      const map = ref.current;

      map?.getCamera().then((camera) => {
        camera.center = point;
        map?.animateCamera(camera);
      });
    }
  }, [ref, point, ready]);

  useEffect(() => {
    if (!ready) return;

    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onDismiss(coordinates.length <= 0 ? null : {mocked, coordinates});
      return true;
    });

    return () => {
      handler.remove();
    };
  }, [ready, coordinates]);

  return (
    <View style={{flex: 1}}>
      <StatusBar />

      <Map
        ref={ref}
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={() => {
          const map = ref.current;
          let fences = [...geofence];

          const rec = () => {
            let fence = fences.shift();

            if (fence) {
              const coords = fence.geometry.coordinates[0];

              map?.fitToCoordinates(
                coords.map(([longitude, latitude]) => ({latitude, longitude})),
                {animated: true},
              );

              setTimeout(() => {
                Alert.alert('Geofence', geofenceMsg, [
                  {
                    style: 'default',
                    onPress: () => {
                      if (fences.length > 0) {
                        rec();
                      } else {
                        setReady(true);
                      }
                    },
                  },
                ]);
              }, 1200);
            }
          };

          if (fences.length > 0) {
            rec();
          } else {
            setReady(true);
          }
        }}>
        <Marker coordinate={point} />

        <Polyline strokeWidth={3} strokeColor="red" coordinates={coordinates} />

        {fence.length > 0 &&
          fence.map((coordinates, i) => (
            <Polygon
              key={i}
              strokeWidth={2}
              strokeColor={redHex}
              fillColor={lightRedHex}
              coordinates={coordinates}
            />
          ))}
      </Map>

      <SafeAreaView pointerEvents="box-none" style={styles.container}>
        <View style={styles.header}>
          <Button
            style={styles.doneBtn}
            onPress={() => send('DONE')}
            labelStyle={{color: 'white'}}>
            Done
          </Button>

          {hasGeofence && (
            <View
              style={[styles.geoFenceIndicator, inAnyFence && styles.green]}>
              {!inAnyFence && (
                <MotiView
                  key={Math.random()}
                  from={{opacity: 0.2}}
                  animate={{opacity: 1}}
                  style={[StyleSheet.absoluteFill, styles.geofenceAlert]}
                  transition={{loop: true, type: 'timing', duration: 1000}}
                />
              )}
              <Text style={styles.geofenceLabel}>Geofence</Text>
            </View>
          )}
        </View>

        <View>
          <Spacer>
            <View style={styles.accuracyWrapper}>
              <Spacer horizontal>
                <AlertIcon width={15} height={15} color="white" />

                <Caption style={{color: 'white'}}>
                  Accuracy level:{' '}
                  <Text style={{color: 'white', fontWeight: 'bold'}}>
                    {point ? `${(point.accuracy ?? 0).toFixed(3)}m` : 'unknown'}
                  </Text>
                </Caption>
              </Spacer>
            </View>

            {match(feature)
              .with('POINT', 'LINESTRING', () => (
                <View style={styles.footerActions}>
                  <Spacer horizontal>
                    {clearBtn}
                    {pickBtn}
                  </Spacer>
                </View>
              ))
              .with('POLYGON', () => (
                <View>
                  <Spacer>
                    <View style={styles.footerActions}>
                      <Spacer horizontal>
                        <Button
                          onPress={() => send('COMPLETE')}
                          disabled={isDone || disabledAll}
                          style={[styles.btn, styles.btnContent]}>
                          Complete
                        </Button>
                        {pickBtn}
                      </Spacer>
                    </View>

                    {clearBtn}
                  </Spacer>
                </View>
              ))
              .exhaustive()}

            {/* {isPoint ? (
              <View style={styles.container}>
                <Spacer horizontal>
                  {clearBtn}
                  {pickBtn}
                </Spacer>
              </View>
            ) : (
              <View>
                <Spacer>
                  <View style={styles.container}>
                    <Spacer horizontal>
                      <Button
                        onPress={() => send('COMPLETE')}
                        disabled={isDone || disabledAll}
                        style={[styles.btn, styles.btnContent]}>
                        Complete
                      </Button>
                      {pickBtn}
                    </Spacer>
                  </View>

                  {clearBtn}
                </Spacer>
              </View>
            )} */}
          </Spacer>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  btn: {
    flex: 1,
  },
  btnContent: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  btnContainer: {
    paddingVertical: 7,
  },
  footerActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  geoFenceIndicator: {
    borderRadius: 100,
    overflow: 'hidden',
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  green: {
    backgroundColor: Colors.green700,
  },
  geofenceAlert: {
    borderRadius: 100,
    backgroundColor: Colors.red700,
  },
  geofenceLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  accuracyWrapper: {
    borderRadius: 100,
    paddingVertical: 3,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  doneBtn: {
    borderRadius: 100,
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignSelf: 'flex-end',
    backgroundColor: primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    margin: 10,
    justifyContent: 'space-between',
  },
});
