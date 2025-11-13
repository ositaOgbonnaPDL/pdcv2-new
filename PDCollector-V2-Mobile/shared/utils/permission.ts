import {Platform} from 'react-native';
import {
  Permission,
  PERMISSIONS,
  PermissionStatus,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';

export const LOCATION_BLOCKED = 'Location permission blocked';

export const LOCATION_DENIED = 'Location permission denied';

export const LOCATION_UNAVAILABLE = 'Your device does not have gps capability';

export const permissions = Platform.select<Permission[]>({
  ios: [PERMISSIONS.IOS.LOCATION_ALWAYS, PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
  android: [
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
  ],
}) as Permission[];

export class PermissionError extends Error {
  constructor(msg: string | undefined, public status?: PermissionStatus) {
    super(msg);
  }
}

export const checkPermission = async () => {
  const stats = await requestMultiple(permissions);

  if (Platform.OS === 'ios') {
    const always = stats[PERMISSIONS.IOS.LOCATION_ALWAYS];
    const inUse = stats[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE];

    if (always === RESULTS.UNAVAILABLE || inUse === RESULTS.UNAVAILABLE) {
      throw new PermissionError(LOCATION_UNAVAILABLE, RESULTS.UNAVAILABLE);
    }

    if (inUse === RESULTS.BLOCKED) {
      throw new PermissionError(LOCATION_BLOCKED, RESULTS.BLOCKED);
    }

    if (inUse === RESULTS.DENIED) {
      throw new PermissionError(LOCATION_DENIED, RESULTS.DENIED);
    }
  } else {
    const fine = stats[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
    const coarse = stats[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION];

    if (coarse === RESULTS.UNAVAILABLE || fine === RESULTS.UNAVAILABLE) {
      throw new PermissionError(LOCATION_UNAVAILABLE, RESULTS.UNAVAILABLE);
    }

    if (coarse === RESULTS.BLOCKED && fine === RESULTS.BLOCKED) {
      throw new PermissionError(LOCATION_BLOCKED, RESULTS.BLOCKED);
    }

    if (coarse === RESULTS.DENIED) {
      throw new PermissionError(LOCATION_DENIED, RESULTS.BLOCKED);
    }
  }
};
