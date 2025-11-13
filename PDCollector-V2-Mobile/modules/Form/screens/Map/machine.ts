import {some} from 'lodash/fp';
import {GeoCoordinates} from 'react-native-geolocation-service';
import {LatLng} from 'react-native-maps';
import {map} from 'rxjs/operators';
import {assign, createMachine} from 'xstate';
import watchPosition from '../../../../observables/watchPosition';
import {Feature} from '../../../../shared/types/project';
import {checkPermission} from '../../../../shared/utils/permission';

type Context = {
  error?: Error;
  mocked: boolean;
  feature: Feature;
  coordinates: LatLng[];
  point: GeoCoordinates;
  distanceFilter?: number;
};

type States =
  | {value: 'inactive'; context: Context}
  | {value: 'error'; context: Context & {error: Error}}
  | {
      value:
        | 'active'
        | {active: 'done'}
        | {
            active:
              | 'idle'
              | {idle: 'point'}
              | {idle: 'polygon'}
              | {idle: 'polyline'};
          };
      context: Context;
    };

export type Events =
  | {type: 'DONE' | 'CLEAR' | 'RETRY' | 'COMPLETE' | 'POINT:CAPTURE'}
  | {type: 'COORDS'; coords: LatLng; mocked: boolean};

const isLatLngEqual = (a: LatLng) => (b: LatLng) => {
  return a.latitude === b.latitude && a.longitude === b.longitude;
};

const isValidPolygon = (polygon: LatLng[]) => {
  const {length} = polygon;

  if (length <= 0) return false;

  const [head] = polygon;
  const tail = [...polygon].pop();
  const middle = polygon.slice(1, length - 1);

  if (!tail || middle.length < 2) return false;

  const headMatch = some(isLatLngEqual(head), middle);
  const tailMatch = some(isLatLngEqual(tail), middle);

  return headMatch || tailMatch ? false : true;
};

const machine = createMachine<Context, Events, States>(
  {
    id: 'collector',
    initial: 'inactive',
    states: {
      inactive: {
        invoke: {
          src: checkPermission,

          onError: {
            target: 'error',
            actions: assign({error: (_, {data}) => data}),
          },

          onDone: [
            {
              cond: 'isPointFeature',
              target: 'active.idle.point',
            },
            {
              cond: 'isPolygonFeature',
              target: 'active.idle.polygon',
            },
            {
              cond: 'isLineStringFeature',
              target: 'active.idle.polyline',
            },
          ],
        },
      },
      active: {
        initial: 'idle',
        states: {
          idle: {
            initial: 'point',

            invoke: {
              src: ({distanceFilter}) => {
                return watchPosition({
                  interval: 400,
                  distanceFilter,
                  fastestInterval: 200,
                  enableHighAccuracy: true,
                  accuracy: {
                    android: 'high',
                    ios: 'bestForNavigation',
                  },
                }).pipe(
                  map(({coords, mocked}) => ({type: 'COORDS', mocked, coords})),
                );
              },
            },

            on: {
              DONE: {
                target: 'done',
                actions: 'onDone',
              },

              CLEAR: {
                actions: ['clearCoords', 'resetMocked'],
              },

              COORDS: {
                actions: [
                  'setCoords',
                  // set mocked if we find the user has mocked any other
                  // during this session
                  assign({
                    mocked: (_, {mocked}) => (_.mocked ? _.mocked : mocked),
                  }),
                ],
              },

              'POINT:CAPTURE': {
                actions: 'capturePoint',
              },
            },

            states: {
              point: {
                on: {
                  'POINT:CAPTURE': {
                    actions: 'capturePoint',
                    target: '#collector.active.done',
                  },

                  DONE: {
                    actions: 'notifyPointError',
                    cond: (ctx) => ctx.coordinates.length <= 0,
                  },
                },
              },
              polygon: {
                on: {
                  DONE: [
                    {
                      actions: 'notifyPolygonError',
                      cond: ({coordinates}) => {
                        return !isValidPolygon(coordinates);
                      },
                    },
                    {
                      actions: 'onDone',
                      target: '#collector.active.done',
                    },
                  ],

                  COMPLETE: [
                    {
                      actions: 'notifyPolygonError',
                      cond: ({coordinates}) => {
                        // complete the polygon and check if it is valid
                        return !isValidPolygon([
                          ...coordinates,
                          coordinates[0],
                        ]);
                      },
                    },
                    {
                      actions: 'completePolygon',
                      target: '#collector.active.done',
                    },
                  ],
                },
              },
              polyline: {
                on: {
                  DONE: [
                    {
                      cond: 'incompletePolyline',
                      actions: 'notifyPolylineError',
                    },
                    {
                      actions: 'onDone',
                      target: '#collector.active.done',
                    },
                  ],
                  COMPLETE: [
                    {
                      cond: 'incompletePolyline',
                      actions: 'notifyPolylineError',
                    },
                    {
                      target: '#collector.active.done',
                    },
                  ],
                },
              },
            },
          },
          done: {
            on: {
              CLEAR: {
                target: '#collector.inactive',
                actions: ['clearCoords', 'resetMocked'],
              },

              DONE: {
                actions: 'onDone',
              },
            },
          },
        },
      },

      error: {
        on: {
          RETRY: {
            target: 'inactive',
            actions: assign({error: (_) => undefined}),
          },
        },
      },
    },
  },
  {
    guards: {
      isPointFeature: ({feature}) => feature === 'POINT',
      isPolygonFeature: ({feature}) => feature === 'POLYGON',
      isLineStringFeature: ({feature}) => feature === 'LINESTRING',

      incompletePolyline: ({coordinates}) => coordinates.length < 2,

      // incompletePolygon: ({coordinates}) => {
      //   const {length} = coordinates;

      //   const [head] = coordinates;
      //   const tail = [...coordinates].pop();
      //   const middle = coordinates.slice(1, length - 1);

      //   if (!tail || middle.length < 2) return true;

      //   const headMatch = reject(isLatLngEqual(head), middle);
      //   const tailMatch = reject(isLatLngEqual(tail), middle);

      //   console.log(head, tail, middle, headMatch, tailMatch);

      //   return headMatch.length > 0 || tailMatch.length > 0;
      // },
    },
    actions: {
      clearCoords: assign({coordinates: (_) => []}),

      resetMocked: assign({mocked: (_) => false}),

      setCoords: assign({point: (_, {coords}: any) => coords}),

      completePolygon: assign({
        coordinates: ({coordinates}) => [...coordinates, coordinates[0]],
      }),

      capturePoint: assign({
        coordinates: ({point, coordinates}) => {
          return [...coordinates, point];
        },
      }),
    },
  },
);

export default machine;
