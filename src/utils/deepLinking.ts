/**
 * Deep Linking Utilities
 * Handles deep link parsing, validation, and navigation
 */

import {Linking} from 'react-native';
import {DeepLinkPatterns} from '../navigation/linking';

/**
 * Deep link types
 */
export type DeepLinkType =
  | 'login'
  | 'password-change'
  | 'projects'
  | 'project-detail'
  | 'assigned'
  | 'settings'
  | 'form'
  | 'map'
  | 'tracker'
  | 'unknown';

/**
 * Parsed deep link data
 */
export interface DeepLinkData {
  type: DeepLinkType;
  url: string;
  params?: {
    projectId?: string;
    formId?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Get the initial URL when app is opened via deep link
 */
export const getInitialURL = async (): Promise<string | null> => {
  try {
    const url = await Linking.getInitialURL();
    console.log('[DeepLink] Initial URL:', url);
    return url;
  } catch (error) {
    console.error('[DeepLink] Error getting initial URL:', error);
    return null;
  }
};

/**
 * Check if app can open a URL
 */
export const canOpenURL = async (url: string): Promise<boolean> => {
  try {
    return await Linking.canOpenURL(url);
  } catch (error) {
    console.error('[DeepLink] Error checking if can open URL:', error);
    return false;
  }
};

/**
 * Open a URL (external)
 */
export const openURL = async (url: string): Promise<boolean> => {
  try {
    const canOpen = await canOpenURL(url);
    if (!canOpen) {
      console.warn('[DeepLink] Cannot open URL:', url);
      return false;
    }

    await Linking.openURL(url);
    console.log('[DeepLink] Opened URL:', url);
    return true;
  } catch (error) {
    console.error('[DeepLink] Error opening URL:', error);
    return false;
  }
};

/**
 * Open app settings
 */
export const openSettings = async (): Promise<void> => {
  try {
    await Linking.openSettings();
    console.log('[DeepLink] Opened app settings');
  } catch (error) {
    console.error('[DeepLink] Error opening settings:', error);
  }
};

/**
 * Parse a deep link URL
 */
export const parseDeepLink = (url: string): DeepLinkData => {
  console.log('[DeepLink] Parsing URL:', url);

  // Remove scheme prefix
  const urlWithoutScheme = url
    .replace(/^pdcv2:\/\//, '')
    .replace(/^https?:\/\/[^/]+\//, '');

  // Parse path and query parameters
  const [path, queryString] = urlWithoutScheme.split('?');
  const pathSegments = path.split('/').filter(Boolean);

  // Parse query parameters
  const queryParams: {[key: string]: string} = {};
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        queryParams[key] = decodeURIComponent(value);
      }
    });
  }

  // Determine link type and extract parameters
  let type: DeepLinkType = 'unknown';
  const params: DeepLinkData['params'] = {...queryParams};

  // Login
  if (path === 'login') {
    type = 'login';
  }
  // Password Change
  else if (path === 'password-change') {
    type = 'password-change';
  }
  // Projects List
  else if (path === 'app/projects' && pathSegments.length === 2) {
    type = 'projects';
  }
  // Project Detail
  else if (path.startsWith('app/projects/') && pathSegments.length === 3) {
    type = 'project-detail';
    params.projectId = pathSegments[2];
  }
  // Assigned Data
  else if (path === 'app/assigned') {
    type = 'assigned';
  }
  // Settings
  else if (path === 'app/settings') {
    type = 'settings';
  }
  // Form
  else if (path.startsWith('form/') && pathSegments.length === 2) {
    type = 'form';
    params.formId = pathSegments[1];
  }
  // Map
  else if (path === 'map') {
    type = 'map';
  }
  // Tracker
  else if (path === 'tracker') {
    type = 'tracker';
  }
  // Tracker with Project
  else if (path.startsWith('tracker/') && pathSegments.length === 2) {
    type = 'tracker';
    params.projectId = pathSegments[1];
  }

  const result: DeepLinkData = {
    type,
    url,
    params: Object.keys(params).length > 0 ? params : undefined,
  };

  console.log('[DeepLink] Parsed result:', result);
  return result;
};

/**
 * Validate a deep link
 */
export const isValidDeepLink = (url: string): boolean => {
  try {
    // Check if URL starts with our scheme or domain
    const isCustomScheme = url.startsWith('pdcv2://');
    const isUniversalLink =
      url.startsWith('https://pdcollector.app') ||
      url.startsWith('https://www.pdcollector.app');

    if (!isCustomScheme && !isUniversalLink) {
      return false;
    }

    // Try to parse it
    const parsed = parseDeepLink(url);
    return parsed.type !== 'unknown';
  } catch (error) {
    console.error('[DeepLink] Error validating URL:', error);
    return false;
  }
};

/**
 * Add URL change listener
 */
export const addURLChangeListener = (
  callback: (url: string) => void,
): (() => void) => {
  const subscription = Linking.addEventListener('url', ({url}) => {
    console.log('[DeepLink] URL changed:', url);
    callback(url);
  });

  return () => {
    console.log('[DeepLink] Removing URL listener');
    subscription.remove();
  };
};

/**
 * Build a deep link URL
 */
export const buildDeepLink = (
  type: DeepLinkType,
  params?: {[key: string]: string},
): string => {
  let path = '';

  switch (type) {
    case 'login':
      path = 'login';
      break;
    case 'password-change':
      path = 'password-change';
      break;
    case 'projects':
      path = 'app/projects';
      break;
    case 'project-detail':
      if (params?.projectId) {
        path = `app/projects/${params.projectId}`;
      }
      break;
    case 'assigned':
      path = 'app/assigned';
      break;
    case 'settings':
      path = 'app/settings';
      break;
    case 'form':
      if (params?.formId) {
        path = `form/${params.formId}`;
      }
      break;
    case 'map':
      path = 'map';
      break;
    case 'tracker':
      if (params?.projectId) {
        path = `tracker/${params.projectId}`;
      } else {
        path = 'tracker';
      }
      break;
    default:
      console.warn('[DeepLink] Unknown type:', type);
      return '';
  }

  if (!path) {
    console.warn('[DeepLink] Missing required params for type:', type);
    return '';
  }

  // Add query parameters
  const queryParams = {...params};
  // Remove params that were used in the path
  delete queryParams.projectId;
  delete queryParams.formId;

  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  const url = `pdcv2://${path}${queryString ? `?${queryString}` : ''}`;
  console.log('[DeepLink] Built URL:', url);
  return url;
};

/**
 * PDC-specific deep link helpers
 */

/**
 * Create a link to a project
 */
export const createProjectLink = (projectId: string): string => {
  return buildDeepLink('project-detail', {projectId});
};

/**
 * Create a link to a form
 */
export const createFormLink = (formId: string): string => {
  return buildDeepLink('form', {formId});
};

/**
 * Create a link to tracker with project
 */
export const createTrackerLink = (projectId?: string): string => {
  return buildDeepLink('tracker', projectId ? {projectId} : undefined);
};

/**
 * Share a deep link (using native share)
 * Requires additional setup for sharing
 */
export const shareDeepLink = async (
  url: string,
  message?: string,
): Promise<boolean> => {
  try {
    // Note: This would require react-native-share or similar package
    console.log('[DeepLink] Share:', url, message);
    // const Share = require('react-native-share');
    // await Share.open({
    //   message: message || 'Check out this link',
    //   url,
    // });
    return true;
  } catch (error) {
    console.error('[DeepLink] Error sharing:', error);
    return false;
  }
};

/**
 * Copy deep link to clipboard
 * Requires @react-native-clipboard/clipboard
 */
export const copyDeepLinkToClipboard = async (url: string): Promise<void> => {
  try {
    const Clipboard = await import('@react-native-clipboard/clipboard');
    Clipboard.default.setString(url);
    console.log('[DeepLink] Copied to clipboard:', url);
  } catch (error) {
    console.error('[DeepLink] Error copying to clipboard:', error);
  }
};
