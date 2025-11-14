/**
 * Analytics Utilities
 * Handles analytics event tracking, user properties, and screen views
 */

import analytics from '@react-native-firebase/analytics';
import {Platform} from 'react-native';

/**
 * Analytics event parameters
 */
export interface EventParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * User properties
 */
export interface UserProperties {
  user_id?: string;
  user_role?: string;
  project_id?: string;
  device_type?: string;
  app_version?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Analytics service initialization status
 */
let isInitialized = false;

/**
 * Initialize analytics
 */
export const initializeAnalytics = async (): Promise<void> => {
  try {
    // Set analytics collection enabled
    await analytics().setAnalyticsCollectionEnabled(true);

    // Set default parameters
    await analytics().setDefaultEventParameters({
      platform: Platform.OS,
      app_version: '2.0.0', // Should be from app config
    });

    isInitialized = true;
    console.log('[Analytics] Initialized successfully');
  } catch (error) {
    console.error('[Analytics] Initialization error:', error);
  }
};

/**
 * Log a custom event
 */
export const logEvent = async (
  eventName: string,
  params?: EventParams,
): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Analytics] Not initialized, skipping event:', eventName);
      return;
    }

    await analytics().logEvent(eventName, params);
    console.log(`[Analytics] Event logged: ${eventName}`, params);
  } catch (error) {
    console.error(`[Analytics] Error logging event ${eventName}:`, error);
  }
};

/**
 * Log screen view
 */
export const logScreenView = async (
  screenName: string,
  screenClass?: string,
): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Analytics] Not initialized, skipping screen view:', screenName);
      return;
    }

    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });

    console.log(`[Analytics] Screen view logged: ${screenName}`);
  } catch (error) {
    console.error(`[Analytics] Error logging screen view ${screenName}:`, error);
  }
};

/**
 * Set user ID
 */
export const setUserId = async (userId: string | null): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Analytics] Not initialized, skipping set user ID');
      return;
    }

    await analytics().setUserId(userId);
    console.log(`[Analytics] User ID set: ${userId}`);
  } catch (error) {
    console.error('[Analytics] Error setting user ID:', error);
  }
};

/**
 * Set user property
 */
export const setUserProperty = async (
  name: string,
  value: string | null,
): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Analytics] Not initialized, skipping set user property');
      return;
    }

    await analytics().setUserProperty(name, value);
    console.log(`[Analytics] User property set: ${name} = ${value}`);
  } catch (error) {
    console.error(`[Analytics] Error setting user property ${name}:`, error);
  }
};

/**
 * Set multiple user properties
 */
export const setUserProperties = async (
  properties: UserProperties,
): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Analytics] Not initialized, skipping set user properties');
      return;
    }

    for (const [key, value] of Object.entries(properties)) {
      if (value !== undefined) {
        await analytics().setUserProperty(
          key,
          value === null ? null : String(value),
        );
      }
    }

    console.log('[Analytics] User properties set:', properties);
  } catch (error) {
    console.error('[Analytics] Error setting user properties:', error);
  }
};

/**
 * Reset analytics data (useful on logout)
 */
export const resetAnalyticsData = async (): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Analytics] Not initialized, skipping reset');
      return;
    }

    await analytics().resetAnalyticsData();
    console.log('[Analytics] Analytics data reset');
  } catch (error) {
    console.error('[Analytics] Error resetting analytics data:', error);
  }
};

/**
 * Enable/disable analytics collection
 */
export const setAnalyticsEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await analytics().setAnalyticsCollectionEnabled(enabled);
    console.log(`[Analytics] Analytics collection ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('[Analytics] Error setting analytics enabled:', error);
  }
};

/**
 * PDC-specific analytics events
 */

/**
 * Log app open event
 */
export const logAppOpen = async (): Promise<void> => {
  await logEvent('app_open', {
    timestamp: Date.now(),
  });
};

/**
 * Log user login
 */
export const logLogin = async (method: string = 'username_password'): Promise<void> => {
  await logEvent('login', {
    method,
  });
};

/**
 * Log user logout
 */
export const logLogout = async (): Promise<void> => {
  await logEvent('logout');
};

/**
 * Log form submission
 */
export const logFormSubmit = async (
  formName: string,
  formId: string,
  duration?: number,
): Promise<void> => {
  await logEvent('form_submit', {
    form_name: formName,
    form_id: formId,
    duration_seconds: duration,
  });
};

/**
 * Log form save (draft)
 */
export const logFormSave = async (
  formName: string,
  formId: string,
): Promise<void> => {
  await logEvent('form_save', {
    form_name: formName,
    form_id: formId,
  });
};

/**
 * Log data upload
 */
export const logDataUpload = async (
  uploadType: string,
  count: number,
  success: boolean,
  error?: string,
): Promise<void> => {
  await logEvent('data_upload', {
    upload_type: uploadType,
    item_count: count,
    success,
    error_message: error,
  });
};

/**
 * Log data sync
 */
export const logDataSync = async (
  syncType: string,
  itemCount: number,
  success: boolean,
): Promise<void> => {
  await logEvent('data_sync', {
    sync_type: syncType,
    item_count: itemCount,
    success,
  });
};

/**
 * Log location tracking start
 */
export const logLocationTrackingStart = async (
  projectId: string,
  projectName: string,
): Promise<void> => {
  await logEvent('location_tracking_start', {
    project_id: projectId,
    project_name: projectName,
  });
};

/**
 * Log location tracking stop
 */
export const logLocationTrackingStop = async (
  projectId: string,
  duration: number,
  pointCount: number,
): Promise<void> => {
  await logEvent('location_tracking_stop', {
    project_id: projectId,
    duration_seconds: duration,
    point_count: pointCount,
  });
};

/**
 * Log media capture
 */
export const logMediaCapture = async (
  mediaType: 'photo' | 'audio',
  source: 'camera' | 'gallery' | 'recorder',
  fileSize?: number,
): Promise<void> => {
  await logEvent('media_capture', {
    media_type: mediaType,
    source,
    file_size_bytes: fileSize,
  });
};

/**
 * Log search action
 */
export const logSearch = async (
  searchTerm: string,
  resultCount: number,
): Promise<void> => {
  await logEvent('search', {
    search_term: searchTerm,
    result_count: resultCount,
  });
};

/**
 * Log project selection
 */
export const logProjectSelect = async (
  projectId: string,
  projectName: string,
): Promise<void> => {
  await logEvent('project_select', {
    project_id: projectId,
    project_name: projectName,
  });
};

/**
 * Log error event
 */
export const logErrorEvent = async (
  errorType: string,
  errorMessage: string,
  context?: string,
): Promise<void> => {
  await logEvent('app_error', {
    error_type: errorType,
    error_message: errorMessage,
    context,
  });
};
