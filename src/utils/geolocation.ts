/**
 * Geolocation utilities
 * Handles location tracking and coordinates
 */

import Geolocation, {
  GeolocationResponse,
  GeolocationError,
  GeolocationConfiguration,
} from 'react-native-geolocation-service';
import {Platform} from 'react-native';
import {ensurePermission} from './permissions';

/**
 * Location coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

/**
 * Location options
 */
export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  showLocationDialog?: boolean;
  forceLocationManager?: boolean;
}

/**
 * Default location options
 */
const defaultOptions: LocationOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
  distanceFilter: 0,
  showLocationDialog: true,
  forceLocationManager: false,
};

/**
 * Configure geolocation
 */
export const configureGeolocation = (config?: GeolocationConfiguration) => {
  Geolocation.setRNConfiguration(
    config || {
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
    },
  );
};

/**
 * Get current position
 */
export const getCurrentPosition = async (
  options: LocationOptions = {},
): Promise<Coordinates | null> => {
  try {
    // Check location permission
    const hasPermission = await ensurePermission('location');
    if (!hasPermission) {
      return null;
    }

    const opts = {...defaultOptions, ...options};

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: GeolocationResponse) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          };
          resolve(coords);
        },
        (error: GeolocationError) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        opts,
      );
    });
  } catch (error) {
    console.error('Error getting current position:', error);
    return null;
  }
};

/**
 * Watch position changes
 * Returns a watchId that can be used to clear the watch
 */
export const watchPosition = (
  callback: (coords: Coordinates) => void,
  errorCallback?: (error: GeolocationError) => void,
  options: LocationOptions = {},
): number => {
  const opts = {...defaultOptions, ...options};

  const watchId = Geolocation.watchPosition(
    (position: GeolocationResponse) => {
      const coords: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      };
      callback(coords);
    },
    (error: GeolocationError) => {
      console.error('Watch position error:', error);
      if (errorCallback) {
        errorCallback(error);
      }
    },
    opts,
  );

  return watchId;
};

/**
 * Clear position watch
 */
export const clearWatch = (watchId: number): void => {
  Geolocation.clearWatch(watchId);
};

/**
 * Calculate distance between two coordinates in meters
 * Uses Haversine formula
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates,
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (coords: Coordinates): string => {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
};

/**
 * Request location authorization (iOS only)
 */
export const requestAuthorization = async (): Promise<string> => {
  if (Platform.OS === 'ios') {
    return await Geolocation.requestAuthorization('whenInUse');
  }
  return 'granted';
};
