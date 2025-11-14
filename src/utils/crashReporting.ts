/**
 * Crash Reporting Utilities
 * Handles crash reporting, error logging, and diagnostics
 */

import crashlytics from '@react-native-firebase/crashlytics';
import {Platform} from 'react-native';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';

/**
 * Custom error attributes
 */
export interface ErrorAttributes {
  [key: string]: string | number | boolean;
}

/**
 * Crashlytics service initialization status
 */
let isInitialized = false;

/**
 * Initialize crash reporting
 */
export const initializeCrashReporting = async (): Promise<void> => {
  try {
    // Enable crashlytics collection
    await crashlytics().setCrashlyticsCollectionEnabled(true);

    // Set initial attributes
    await crashlytics().setAttribute('platform', Platform.OS);
    await crashlytics().setAttribute('app_version', '2.0.0'); // Should be from app config

    isInitialized = true;
    console.log('[Crashlytics] Initialized successfully');
  } catch (error) {
    console.error('[Crashlytics] Initialization error:', error);
  }
};

/**
 * Check if crash reporting is enabled
 */
export const isCrashReportingEnabled = async (): Promise<boolean> => {
  try {
    return await crashlytics().isCrashlyticsCollectionEnabled();
  } catch (error) {
    console.error('[Crashlytics] Error checking if enabled:', error);
    return false;
  }
};

/**
 * Enable or disable crash reporting
 */
export const setCrashReportingEnabled = async (
  enabled: boolean,
): Promise<void> => {
  try {
    await crashlytics().setCrashlyticsCollectionEnabled(enabled);
    console.log(`[Crashlytics] Collection ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('[Crashlytics] Error setting enabled state:', error);
  }
};

/**
 * Log a non-fatal error
 */
export const logError = (error: Error, context?: string): void => {
  try {
    if (!isInitialized) {
      console.warn('[Crashlytics] Not initialized, skipping error log');
      return;
    }

    // Add context if provided
    if (context) {
      crashlytics().log(`Error context: ${context}`);
    }

    // Record the error
    crashlytics().recordError(error);

    console.log('[Crashlytics] Error logged:', error.message);
  } catch (err) {
    console.error('[Crashlytics] Error logging error:', err);
  }
};

/**
 * Log a message
 */
export const log = (message: string): void => {
  try {
    if (!isInitialized) {
      console.warn('[Crashlytics] Not initialized, skipping log');
      return;
    }

    crashlytics().log(message);
    console.log('[Crashlytics] Log:', message);
  } catch (error) {
    console.error('[Crashlytics] Error logging message:', error);
  }
};

/**
 * Set user identifier
 */
export const setUserId = async (userId: string): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Crashlytics] Not initialized, skipping set user ID');
      return;
    }

    await crashlytics().setUserId(userId);
    console.log(`[Crashlytics] User ID set: ${userId}`);
  } catch (error) {
    console.error('[Crashlytics] Error setting user ID:', error);
  }
};

/**
 * Set a custom attribute
 */
export const setAttribute = async (
  key: string,
  value: string | number | boolean,
): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Crashlytics] Not initialized, skipping set attribute');
      return;
    }

    await crashlytics().setAttribute(key, String(value));
    console.log(`[Crashlytics] Attribute set: ${key} = ${value}`);
  } catch (error) {
    console.error(`[Crashlytics] Error setting attribute ${key}:`, error);
  }
};

/**
 * Set multiple custom attributes
 */
export const setAttributes = async (
  attributes: ErrorAttributes,
): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Crashlytics] Not initialized, skipping set attributes');
      return;
    }

    await crashlytics().setAttributes(
      Object.entries(attributes).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: String(value),
        }),
        {},
      ),
    );

    console.log('[Crashlytics] Attributes set:', attributes);
  } catch (error) {
    console.error('[Crashlytics] Error setting attributes:', error);
  }
};

/**
 * Test crash (for testing crashlytics integration)
 * WARNING: This will crash the app!
 */
export const testCrash = (): void => {
  if (__DEV__) {
    console.warn('[Crashlytics] Test crash triggered (dev mode only)');
    crashlytics().crash();
  } else {
    console.warn('[Crashlytics] Test crash only works in development mode');
  }
};

/**
 * Force send unsent crash reports
 */
export const sendUnsentReports = async (): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Crashlytics] Not initialized, skipping send unsent reports');
      return;
    }

    await crashlytics().sendUnsentReports();
    console.log('[Crashlytics] Unsent reports sent');
  } catch (error) {
    console.error('[Crashlytics] Error sending unsent reports:', error);
  }
};

/**
 * Delete unsent crash reports
 */
export const deleteUnsentReports = async (): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Crashlytics] Not initialized, skipping delete unsent reports');
      return;
    }

    await crashlytics().deleteUnsentReports();
    console.log('[Crashlytics] Unsent reports deleted');
  } catch (error) {
    console.error('[Crashlytics] Error deleting unsent reports:', error);
  }
};

/**
 * Check if there are unsent reports
 */
export const checkForUnsentReports = async (): Promise<boolean> => {
  try {
    if (!isInitialized) {
      console.warn('[Crashlytics] Not initialized');
      return false;
    }

    return await crashlytics().checkForUnsentReports();
  } catch (error) {
    console.error('[Crashlytics] Error checking for unsent reports:', error);
    return false;
  }
};

/**
 * PDC-specific error logging
 */

/**
 * Log form submission error
 */
export const logFormError = (
  formName: string,
  formId: string,
  error: Error,
): void => {
  log(`Form error - ${formName} (${formId})`);
  setAttribute('form_name', formName);
  setAttribute('form_id', formId);
  logError(error, 'form_submission');
};

/**
 * Log upload error
 */
export const logUploadError = (
  uploadType: string,
  itemCount: number,
  error: Error,
): void => {
  log(`Upload error - ${uploadType} (${itemCount} items)`);
  setAttribute('upload_type', uploadType);
  setAttribute('item_count', itemCount);
  logError(error, 'data_upload');
};

/**
 * Log sync error
 */
export const logSyncError = (syncType: string, error: Error): void => {
  log(`Sync error - ${syncType}`);
  setAttribute('sync_type', syncType);
  logError(error, 'data_sync');
};

/**
 * Log location tracking error
 */
export const logLocationError = (
  projectId: string,
  error: Error,
): void => {
  log(`Location tracking error - Project ${projectId}`);
  setAttribute('project_id', projectId);
  logError(error, 'location_tracking');
};

/**
 * Log network error
 */
export const logNetworkError = (
  endpoint: string,
  method: string,
  statusCode?: number,
  error?: Error,
): void => {
  log(`Network error - ${method} ${endpoint} (${statusCode || 'unknown'})`);
  setAttribute('endpoint', endpoint);
  setAttribute('method', method);
  if (statusCode) {
    setAttribute('status_code', statusCode);
  }
  if (error) {
    logError(error, 'network_request');
  }
};

/**
 * Log authentication error
 */
export const logAuthError = (error: Error): void => {
  log('Authentication error');
  logError(error, 'authentication');
};

/**
 * Log database error
 */
export const logDatabaseError = (
  operation: string,
  table: string,
  error: Error,
): void => {
  log(`Database error - ${operation} on ${table}`);
  setAttribute('db_operation', operation);
  setAttribute('db_table', table);
  logError(error, 'database');
};

/**
 * Log media error
 */
export const logMediaError = (
  mediaType: 'photo' | 'audio',
  operation: 'capture' | 'upload' | 'compress',
  error: Error,
): void => {
  log(`Media error - ${operation} ${mediaType}`);
  setAttribute('media_type', mediaType);
  setAttribute('media_operation', operation);
  logError(error, 'media');
};

/**
 * Log permission error
 */
export const logPermissionError = (
  permissionType: string,
  error: Error,
): void => {
  log(`Permission error - ${permissionType}`);
  setAttribute('permission_type', permissionType);
  logError(error, 'permission');
};

/**
 * Global error handler setup
 */
export const setupGlobalErrorHandler = (): void => {
  const originalErrorHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    // Log to crashlytics
    if (isFatal) {
      log(`Fatal error: ${error.message}`);
      setAttribute('is_fatal', true);
    } else {
      setAttribute('is_fatal', false);
    }

    logError(error, 'global_error');

    // Call original handler
    if (originalErrorHandler) {
      originalErrorHandler(error, isFatal);
    }
  });

  console.log('[Crashlytics] Global error handler set up');
};
