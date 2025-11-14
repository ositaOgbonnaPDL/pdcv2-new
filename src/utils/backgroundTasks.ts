/**
 * Background Task Utilities
 * Handles background fetch and task execution
 */

import BackgroundFetch from 'react-native-background-fetch';
import {Platform} from 'react-native';

/**
 * Background task status
 */
export enum BackgroundTaskStatus {
  SUCCESS = BackgroundFetch.FETCH_RESULT_NEW_DATA,
  FAILED = BackgroundFetch.FETCH_RESULT_FAILED,
  NO_DATA = BackgroundFetch.FETCH_RESULT_NO_DATA,
}

/**
 * Background task configuration
 */
export interface BackgroundTaskConfig {
  minimumFetchInterval?: number; // in minutes (minimum 15 on iOS)
  stopOnTerminate?: boolean; // continue after app termination
  startOnBoot?: boolean; // start on device boot
  enableHeadless?: boolean; // Android only - run even when app is not running
  requiresBatteryNotLow?: boolean; // Android only
  requiresCharging?: boolean; // Android only
  requiresDeviceIdle?: boolean; // Android only
  requiresStorageNotLow?: boolean; // Android only
  requiredNetworkType?: 'NONE' | 'ANY' | 'CELLULAR' | 'WIFI' | 'NOT_ROAMING';
}

/**
 * Background task handler function
 */
export type BackgroundTaskHandler = (taskId: string) => Promise<BackgroundTaskStatus>;

/**
 * Registered background tasks
 */
const backgroundTasks = new Map<string, BackgroundTaskHandler>();

/**
 * Initialize background fetch
 */
export const initializeBackgroundFetch = async (
  config: BackgroundTaskConfig = {},
): Promise<void> => {
  try {
    const status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: config.minimumFetchInterval || 15,
        stopOnTerminate: config.stopOnTerminate ?? false,
        startOnBoot: config.startOnBoot ?? true,
        enableHeadless: config.enableHeadless ?? true,
        requiresBatteryNotLow: config.requiresBatteryNotLow ?? false,
        requiresCharging: config.requiresCharging ?? false,
        requiresDeviceIdle: config.requiresDeviceIdle ?? false,
        requiresStorageNotLow: config.requiresStorageNotLow ?? false,
        requiredNetworkType: config.requiredNetworkType
          ? BackgroundFetch[`NETWORK_TYPE_${config.requiredNetworkType}`]
          : BackgroundFetch.NETWORK_TYPE_NONE,
      },
      async taskId => {
        console.log('[BackgroundFetch] Task started:', taskId);

        try {
          // Execute registered task handler
          const handler = backgroundTasks.get(taskId);
          if (handler) {
            const result = await handler(taskId);
            BackgroundFetch.finish(taskId, result);
          } else {
            // Default behavior - check for all registered tasks
            await executeAllTasks(taskId);
            BackgroundFetch.finish(taskId, BackgroundTaskStatus.SUCCESS);
          }
        } catch (error) {
          console.error('[BackgroundFetch] Task error:', error);
          BackgroundFetch.finish(taskId, BackgroundTaskStatus.FAILED);
        }
      },
      error => {
        console.error('[BackgroundFetch] Failed to start:', error);
      },
    );

    console.log('[BackgroundFetch] Configured with status:', status);

    // Check current status
    const fetchStatus = await BackgroundFetch.status();
    console.log('[BackgroundFetch] Status:', fetchStatus);
  } catch (error) {
    console.error('[BackgroundFetch] Configuration error:', error);
  }
};

/**
 * Execute all registered background tasks
 */
const executeAllTasks = async (taskId: string): Promise<void> => {
  console.log(`[BackgroundFetch] Executing ${backgroundTasks.size} tasks`);

  for (const [name, handler] of backgroundTasks.entries()) {
    try {
      console.log(`[BackgroundFetch] Executing task: ${name}`);
      await handler(taskId);
    } catch (error) {
      console.error(`[BackgroundFetch] Task ${name} failed:`, error);
    }
  }
};

/**
 * Register a background task
 */
export const registerBackgroundTask = (
  taskName: string,
  handler: BackgroundTaskHandler,
): void => {
  backgroundTasks.set(taskName, handler);
  console.log(`[BackgroundFetch] Registered task: ${taskName}`);
};

/**
 * Unregister a background task
 */
export const unregisterBackgroundTask = (taskName: string): void => {
  backgroundTasks.delete(taskName);
  console.log(`[BackgroundFetch] Unregistered task: ${taskName}`);
};

/**
 * Schedule a one-time background task
 */
export const scheduleBackgroundTask = async (
  taskId: string,
  delay: number = 0, // in milliseconds
  periodic: boolean = false,
): Promise<void> => {
  try {
    await BackgroundFetch.scheduleTask({
      taskId,
      delay,
      periodic,
      forceAlarmManager: Platform.OS === 'android',
      stopOnTerminate: false,
      enableHeadless: true,
    });

    console.log(`[BackgroundFetch] Scheduled task: ${taskId}`);
  } catch (error) {
    console.error(`[BackgroundFetch] Failed to schedule task ${taskId}:`, error);
  }
};

/**
 * Stop background fetch
 */
export const stopBackgroundFetch = async (): Promise<void> => {
  try {
    await BackgroundFetch.stop();
    console.log('[BackgroundFetch] Stopped');
  } catch (error) {
    console.error('[BackgroundFetch] Failed to stop:', error);
  }
};

/**
 * Start background fetch
 */
export const startBackgroundFetch = async (): Promise<void> => {
  try {
    await BackgroundFetch.start();
    console.log('[BackgroundFetch] Started');
  } catch (error) {
    console.error('[BackgroundFetch] Failed to start:', error);
  }
};

/**
 * Get background fetch status
 */
export const getBackgroundFetchStatus = async (): Promise<number> => {
  try {
    return await BackgroundFetch.status();
  } catch (error) {
    console.error('[BackgroundFetch] Failed to get status:', error);
    return BackgroundFetch.STATUS_RESTRICTED;
  }
};

/**
 * Check if background fetch is available
 */
export const isBackgroundFetchAvailable = async (): Promise<boolean> => {
  const status = await getBackgroundFetchStatus();
  return status === BackgroundFetch.STATUS_AVAILABLE;
};

/**
 * Default background tasks for PDC
 */

/**
 * Upload pending data in background
 */
export const uploadPendingDataTask: BackgroundTaskHandler = async taskId => {
  console.log('[UploadTask] Starting upload of pending data');

  try {
    // Check network connectivity
    // Upload pending forms
    // Update sync status
    // This will be implemented when upload queue is ready

    console.log('[UploadTask] Upload complete');
    return BackgroundTaskStatus.SUCCESS;
  } catch (error) {
    console.error('[UploadTask] Upload failed:', error);
    return BackgroundTaskStatus.FAILED;
  }
};

/**
 * Sync data in background
 */
export const syncDataTask: BackgroundTaskHandler = async taskId => {
  console.log('[SyncTask] Starting data sync');

  try {
    // Fetch latest data from server
    // Update local database
    // Sync settings
    // This will be implemented when sync logic is ready

    console.log('[SyncTask] Sync complete');
    return BackgroundTaskStatus.SUCCESS;
  } catch (error) {
    console.error('[SyncTask] Sync failed:', error);
    return BackgroundTaskStatus.FAILED;
  }
};

/**
 * Clean up old data in background
 */
export const cleanupTask: BackgroundTaskHandler = async taskId => {
  console.log('[CleanupTask] Starting cleanup');

  try {
    // Delete old cache files
    // Remove uploaded data
    // Clean temporary files
    // This will be implemented when needed

    console.log('[CleanupTask] Cleanup complete');
    return BackgroundTaskStatus.SUCCESS;
  } catch (error) {
    console.error('[CleanupTask] Cleanup failed:', error);
    return BackgroundTaskStatus.FAILED;
  }
};

/**
 * Register default PDC background tasks
 */
export const registerDefaultBackgroundTasks = (): void => {
  registerBackgroundTask('upload-pending-data', uploadPendingDataTask);
  registerBackgroundTask('sync-data', syncDataTask);
  registerBackgroundTask('cleanup', cleanupTask);

  console.log('[BackgroundFetch] Registered default PDC tasks');
};

/**
 * Headless task (Android only)
 * This function runs even when the app is not running
 */
export const headlessTask = async (event: any): Promise<void> => {
  const {taskId, timeout} = event;

  console.log('[Headless] Task started:', taskId);

  if (timeout) {
    console.warn('[Headless] Task timeout');
    BackgroundFetch.finish(taskId, BackgroundTaskStatus.FAILED);
    return;
  }

  try {
    // Execute background tasks
    await executeAllTasks(taskId);
    BackgroundFetch.finish(taskId, BackgroundTaskStatus.SUCCESS);
  } catch (error) {
    console.error('[Headless] Task error:', error);
    BackgroundFetch.finish(taskId, BackgroundTaskStatus.FAILED);
  }
};
