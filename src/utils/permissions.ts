/**
 * Permission utilities
 * Handles requesting and checking permissions for camera, location, microphone, etc.
 */

import {Platform, Alert, Linking} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
  Permission,
  PermissionStatus,
} from 'react-native-permissions';

/**
 * Permission types
 */
export type PermissionType =
  | 'camera'
  | 'location'
  | 'locationAlways'
  | 'microphone'
  | 'photoLibrary'
  | 'notifications';

/**
 * Get platform-specific permission constant
 */
const getPermission = (type: PermissionType): Permission => {
  const isIOS = Platform.OS === 'ios';

  switch (type) {
    case 'camera':
      return isIOS ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

    case 'location':
      return isIOS
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    case 'locationAlways':
      return isIOS
        ? PERMISSIONS.IOS.LOCATION_ALWAYS
        : PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;

    case 'microphone':
      return isIOS
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

    case 'photoLibrary':
      return isIOS
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

    case 'notifications':
      return isIOS
        ? PERMISSIONS.IOS.NOTIFICATIONS
        : PERMISSIONS.ANDROID.POST_NOTIFICATIONS;

    default:
      throw new Error(`Unknown permission type: ${type}`);
  }
};

/**
 * Get user-friendly permission name
 */
const getPermissionName = (type: PermissionType): string => {
  switch (type) {
    case 'camera':
      return 'Camera';
    case 'location':
      return 'Location';
    case 'locationAlways':
      return 'Background Location';
    case 'microphone':
      return 'Microphone';
    case 'photoLibrary':
      return 'Photo Library';
    case 'notifications':
      return 'Notifications';
    default:
      return 'Permission';
  }
};

/**
 * Check if a permission is granted
 */
export const checkPermission = async (
  type: PermissionType,
): Promise<boolean> => {
  try {
    const permission = getPermission(type);
    const result = await check(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error(`Error checking ${type} permission:`, error);
    return false;
  }
};

/**
 * Request a permission
 */
export const requestPermission = async (
  type: PermissionType,
): Promise<boolean> => {
  try {
    const permission = getPermission(type);
    const result = await request(permission);

    if (result === RESULTS.GRANTED) {
      return true;
    }

    if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
      showPermissionAlert(type);
    }

    return false;
  } catch (error) {
    console.error(`Error requesting ${type} permission:`, error);
    return false;
  }
};

/**
 * Check and request permission if needed
 */
export const ensurePermission = async (
  type: PermissionType,
): Promise<boolean> => {
  const hasPermission = await checkPermission(type);

  if (hasPermission) {
    return true;
  }

  return await requestPermission(type);
};

/**
 * Show alert when permission is denied/blocked
 */
const showPermissionAlert = (type: PermissionType) => {
  const permissionName = getPermissionName(type);

  Alert.alert(
    `${permissionName} Permission Required`,
    `PDC needs ${permissionName.toLowerCase()} permission to function properly. Please enable it in settings.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => openSettings(),
      },
    ],
  );
};

/**
 * Request multiple permissions at once
 */
export const requestMultiplePermissions = async (
  types: PermissionType[],
): Promise<Record<PermissionType, boolean>> => {
  const results: Record<string, boolean> = {};

  for (const type of types) {
    results[type] = await requestPermission(type);
  }

  return results as Record<PermissionType, boolean>;
};

/**
 * Check multiple permissions at once
 */
export const checkMultiplePermissions = async (
  types: PermissionType[],
): Promise<Record<PermissionType, boolean>> => {
  const results: Record<string, boolean> = {};

  for (const type of types) {
    results[type] = await checkPermission(type);
  }

  return results as Record<PermissionType, boolean>;
};
