/**
 * Network utilities
 * Handles network connectivity detection and monitoring
 */

import NetInfo, {NetInfoState} from '@react-native-community/netinfo';

/**
 * Network connection type
 */
export type ConnectionType =
  | 'wifi'
  | 'cellular'
  | 'ethernet'
  | 'bluetooth'
  | 'wimax'
  | 'vpn'
  | 'none'
  | 'unknown';

/**
 * Network status
 */
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: ConnectionType;
  details: any;
}

/**
 * Get current network status
 */
export const getNetworkStatus = async (): Promise<NetworkStatus> => {
  const state = await NetInfo.fetch();

  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable,
    type: (state.type as ConnectionType) || 'unknown',
    details: state.details,
  };
};

/**
 * Check if device is connected to internet
 */
export const isConnected = async (): Promise<boolean> => {
  const status = await getNetworkStatus();
  return status.isConnected && status.isInternetReachable !== false;
};

/**
 * Subscribe to network status changes
 * Returns an unsubscribe function
 */
export const subscribeToNetworkStatus = (
  callback: (status: NetworkStatus) => void,
): (() => void) => {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    callback({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: (state.type as ConnectionType) || 'unknown',
      details: state.details,
    });
  });

  return unsubscribe;
};

/**
 * Configure NetInfo
 */
export const configureNetInfo = () => {
  NetInfo.configure({
    reachabilityUrl: 'https://clients3.google.com/generate_204',
    reachabilityTest: async (response) => response.status === 204,
    reachabilityLongTimeout: 60 * 1000, // 60s
    reachabilityShortTimeout: 5 * 1000, // 5s
    reachabilityRequestTimeout: 15 * 1000, // 15s
    reachabilityShouldRun: () => true,
    shouldFetchWiFiSSID: true,
  });
};
