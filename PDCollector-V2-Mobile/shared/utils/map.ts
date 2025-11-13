import {Dimensions} from 'react-native';
import {LatLng, Region} from 'react-native-maps';
import {PointTuple} from '../../contexts/TaskManager/types';

const {width, height} = Dimensions.get('screen');

export const ASPECT_RATIO = width / height;
export const LATITUDE_DELTA = 0.006339428281933124;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export const initialRegion = {
  latitude: 6.6170625,
  longitude: 3.3573079,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

export const getRegion = (
  point?: PointTuple,
  polygon?: LatLng[],
  aspectRatio = ASPECT_RATIO,
) => {
  let region: Region = {
    latitude: point?.[0] ?? 0,
    longitude: point?.[1] ?? 0,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  if (polygon) {
    let x = polygon.map((c) => c.latitude);
    let y = polygon.map((c) => c.longitude);

    let minX = Math.min.apply(null, x);
    let maxX = Math.max.apply(null, x);

    let minY = Math.min.apply(null, y);
    let maxY = Math.max.apply(null, y);

    region.latitude = (minX + maxX) / 2;
    region.longitude = (minY + maxY) / 2;
    region.latitudeDelta = aspectRatio / (minX + maxX);
    region.longitudeDelta = aspectRatio / (minY + maxY);
  }

  return region;
};
