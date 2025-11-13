import {
  check as checkPermission,
  request as requestPermission,
  Permission,
  RESULTS,
  Rationale,
} from 'react-native-permissions';

export class PermissionDenied extends Error {}

export class PermissionBlocked extends Error {}

export class PermissionUnavailable extends Error {}

export const check = async (permission: Permission) => {
  const status = await checkPermission(permission);

  if (status === RESULTS.DENIED) {
    throw new PermissionDenied('Permission denied');
  }

  if (status === RESULTS.BLOCKED) {
    throw new PermissionBlocked('Permission blocked');
  }

  if (status === RESULTS.UNAVAILABLE) {
    throw new PermissionUnavailable('Permission not available');
  }

  return status;
};

export const request = (permission: Permission, rationale: Rationale) => {
  return new Promise(async (resolve, reject) => {
    try {
      const status = await check(permission);
      resolve(status);
    } catch (error) {
      if (error instanceof PermissionDenied) {
        const status = await requestPermission(permission, rationale);
        return resolve(status);
      }

      reject(error);
    }
  });
};
