import AsyncStorage from '@react-native-async-storage/async-storage';
import {TransitionPresets} from '@react-navigation/stack';
import Geolocation, {GeoPosition} from 'react-native-geolocation-service';
import {
  StackNavigationOptions,
  TransitionSpec,
} from '@react-navigation/stack/lib/typescript/src/types';
import {groupBy} from 'ramda';
import {Field, Project} from '../types/project';
import {LatLng} from 'react-native-maps';
import {PointTuple} from '../../contexts/TaskManager/types';
import prettyBytes from 'pretty-bytes';

export const baseURL = 'https://35.239.236.136';

// export const baseURL = 'http://34.89.56.255:8000';

export const CREDENTIALS = 'credentials';

// export const PROJECTS = 'projects';

// export const ASSIGNED = 'assigned';

export const TASKS = 'tasks';

// export const PREFERENCE = 'preference';

export const DISCLOSURE = 'disclosure';

export const FAILED_TRACKS = 'failed_tracks';

export const TRACKER_PREFERENCE = 'trakcer_preference';

export const NOTIFICATION_CHANNEL = 'pdc';

export const NAVIGATION_STATE = 'navigation';

// 20MB
export const FILE_SIZE_LIMIT = 20000000;

export const TASK_ID = 'com.transistorsoft.datauploader';

export class NotFound extends Error {}

export let placeholder = 'http://placehold.jp/500x500.png?text=PDCv2';

export const prettySizeLimit = prettyBytes(FILE_SIZE_LIMIT);

export const projectTypes = {
  SV: 'Survey',
  DC: 'Data Collection',
  DV: 'Data Verification',
};

const iosTransitionSpec: TransitionSpec = {
  animation: 'spring',
  config: {
    tension: 180,
    friction: 60,
  },
};

export const sharedElementScreenOptions: StackNavigationOptions = {
  // headerShown: false,
  gestureEnabled: false,
  ...TransitionPresets.ModalSlideFromBottomIOS,
  transitionSpec: {
    open: iosTransitionSpec,
    close: iosTransitionSpec,
  },

  cardStyleInterpolator: ({current: {progress}}) => ({
    cardStyle: {
      opacity: progress,
    },
  }),
};

export const mapToArray = <Key, Value>(x: Map<Key, Value>) => {
  return Array.from(x.values());
};

export const getAsyncItem = async <T>(key: string): Promise<T | undefined> => {
  const item = await AsyncStorage.getItem(key);
  if (item) return JSON.parse(item) as T;
};

export const setAsyncItem = (key: string, value: any) => {
  return AsyncStorage.setItem(key, JSON.stringify(value));
};

export const groupByType = groupBy<Field>(({inputType}) => {
  switch (inputType) {
    case 'image':
    case 'audio':
      return inputType;

    default:
      return 'other';
  }
});

export const getLocation = () => {
  return new Promise<GeoPosition>((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      maximumAge: 0,
      enableHighAccuracy: true,
      showLocationDialog: true,
      forceRequestLocation: true,
      accuracy: {
        android: 'high',
        ios: 'nearestTenMeters',
      },
    });
  });
};

export const latlngToPoint = ({latitude, longitude}: LatLng): PointTuple => [
  latitude,
  longitude,
];

export const pointToLatLng = ([latitude, longitude]: PointTuple): LatLng => {
  return {latitude, longitude};
};

// export const swapPoint = (coords: PointTuple[]): PointTuple[] => {
//   return coords.map(([lat, lng]) => [lng, lat]);
// };

export const isPointTuple = (
  coords: PointTuple | [PointTuple[]],
): coords is PointTuple => {
  const [head, tail] = coords;
  return typeof head === 'number' && typeof tail === 'number';
};

export const createFieldsMap = (
  fields: Project['fields'],
): Record<Field['id'], Field> => {
  const mapped = fields.map((field) => [field.id, field] as const);
  return Object.fromEntries<Field>(mapped);
};
