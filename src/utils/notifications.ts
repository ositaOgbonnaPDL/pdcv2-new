/**
 * Notification Utilities
 * Handles local and push notifications
 */

import PushNotification, {
  PushNotificationObject,
  ReceivedNotification,
} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native';
import {ensurePermission} from './permissions';

/**
 * Notification channel for Android
 */
export const NOTIFICATION_CHANNEL = {
  id: 'pdc-default-channel',
  name: 'PDC Notifications',
  description: 'Default notification channel for PDC',
  importance: 4, // IMPORTANCE_HIGH
  vibration: true,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#4CAF50',
  sound: 'default',
};

/**
 * Notification priority
 */
export type NotificationPriority = 'low' | 'default' | 'high' | 'max';

/**
 * Notification configuration
 */
export interface NotificationConfig {
  id?: number | string;
  title: string;
  message: string;
  channelId?: string;
  priority?: NotificationPriority;
  badge?: number;
  sound?: string;
  vibration?: boolean;
  largeIcon?: string;
  smallIcon?: string;
  bigText?: string;
  color?: string;
  data?: Record<string, any>;
  actions?: string[];
  invokeApp?: boolean;
  date?: Date;
  repeatType?: 'day' | 'week' | 'month' | 'year' | 'time';
  repeatTime?: number;
}

/**
 * Initialize notification system
 */
export const initializeNotifications = (): void => {
  // Configure notifications
  PushNotification.configure({
    // Called when Token is generated (iOS and Android)
    onRegister: function (token) {
      console.log('FCM Token:', token);
      // Store token for push notifications
    },

    // Called when a remote notification is received
    onNotification: function (notification: ReceivedNotification) {
      console.log('Notification received:', notification);

      // Process notification
      if (notification.userInteraction) {
        // User tapped on notification
        handleNotificationTap(notification);
      }

      // Required on iOS only
      if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    },

    // Called when user taps on a notification action
    onAction: function (notification) {
      console.log('Notification action:', notification.action);
      console.log('Notification:', notification);
    },

    // Called when the user fails to register for remote notifications
    onRegistrationError: function (err) {
      console.error('Registration error:', err.message, err);
    },

    // IOS ONLY: If `permissions` is omitted, it will request all permissions by default
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    popInitialNotification: true,

    // Request permissions on app start
    requestPermissions: Platform.OS === 'ios',
  });

  // Create default channel for Android
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: NOTIFICATION_CHANNEL.id,
        channelName: NOTIFICATION_CHANNEL.name,
        channelDescription: NOTIFICATION_CHANNEL.description,
        playSound: true,
        soundName: NOTIFICATION_CHANNEL.sound,
        importance: NOTIFICATION_CHANNEL.importance,
        vibrate: NOTIFICATION_CHANNEL.vibration,
        vibrationPattern: NOTIFICATION_CHANNEL.vibrationPattern,
      },
      created => console.log(`Channel created: ${created}`),
    );
  }
};

/**
 * Handle notification tap
 */
const handleNotificationTap = (notification: ReceivedNotification): void => {
  // Navigate to appropriate screen based on notification data
  const {data} = notification;

  if (data) {
    // Handle navigation based on notification type
    // This will be implemented when navigation is set up
    console.log('Navigate to:', data);
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const hasPermission = await ensurePermission('notifications');
      return hasPermission;
    } else {
      // Android 13+ requires permission
      if (Platform.Version >= 33) {
        const hasPermission = await ensurePermission('notifications');
        return hasPermission;
      }
      return true; // Android < 13 doesn't require permission
    }
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Show local notification
 */
export const showNotification = async (
  config: NotificationConfig,
): Promise<void> => {
  try {
    // Request permission first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    const notification: PushNotificationObject = {
      id: config.id,
      channelId: config.channelId || NOTIFICATION_CHANNEL.id,
      title: config.title,
      message: config.message,
      playSound: config.sound !== undefined,
      soundName: config.sound || 'default',
      number: config.badge,
      priority: config.priority || 'default',
      vibrate: config.vibration !== false,
      vibration: 300,
      largeIcon: config.largeIcon,
      smallIcon: config.smallIcon || 'ic_notification',
      bigText: config.bigText,
      color: config.color || '#4CAF50',
      userInfo: config.data,
      actions: config.actions,
      invokeApp: config.invokeApp !== false,
    };

    PushNotification.localNotification(notification);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

/**
 * Schedule notification
 */
export const scheduleNotification = async (
  config: NotificationConfig,
): Promise<void> => {
  try {
    // Request permission first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    const notification: PushNotificationObject = {
      id: config.id,
      channelId: config.channelId || NOTIFICATION_CHANNEL.id,
      title: config.title,
      message: config.message,
      date: config.date || new Date(Date.now() + 1000),
      playSound: config.sound !== undefined,
      soundName: config.sound || 'default',
      number: config.badge,
      priority: config.priority || 'default',
      vibrate: config.vibration !== false,
      vibration: 300,
      largeIcon: config.largeIcon,
      smallIcon: config.smallIcon || 'ic_notification',
      bigText: config.bigText,
      color: config.color || '#4CAF50',
      userInfo: config.data,
      actions: config.actions,
      repeatType: config.repeatType,
      repeatTime: config.repeatTime,
    };

    PushNotification.localNotificationSchedule(notification);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

/**
 * Cancel notification by ID
 */
export const cancelNotification = (id: string | number): void => {
  PushNotification.cancelLocalNotification(id);
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = (): void => {
  PushNotification.cancelAllLocalNotifications();
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = (): Promise<any[]> => {
  return new Promise(resolve => {
    PushNotification.getScheduledLocalNotifications(notifications => {
      resolve(notifications);
    });
  });
};

/**
 * Set badge count (iOS)
 */
export const setBadgeCount = (count: number): void => {
  if (Platform.OS === 'ios') {
    PushNotificationIOS.setApplicationIconBadgeNumber(count);
  } else {
    PushNotification.setApplicationIconBadgeNumber(count);
  }
};

/**
 * Get badge count (iOS)
 */
export const getBadgeCount = (): Promise<number> => {
  return new Promise(resolve => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.getApplicationIconBadgeNumber(count => {
        resolve(count);
      });
    } else {
      resolve(0);
    }
  });
};

/**
 * Clear badge (iOS)
 */
export const clearBadge = (): void => {
  setBadgeCount(0);
};

/**
 * Notification types for PDC app
 */
export const NotificationTypes = {
  UPLOAD_COMPLETE: 'upload_complete',
  UPLOAD_FAILED: 'upload_failed',
  UPLOAD_PROGRESS: 'upload_progress',
  LOCATION_TRACKING: 'location_tracking',
  FORM_REMINDER: 'form_reminder',
  SYNC_COMPLETE: 'sync_complete',
  SYNC_FAILED: 'sync_failed',
} as const;

/**
 * Show upload complete notification
 */
export const showUploadCompleteNotification = async (
  formName: string,
  count: number,
): Promise<void> => {
  await showNotification({
    id: NotificationTypes.UPLOAD_COMPLETE,
    title: 'Upload Complete',
    message: `${count} ${formName} form${count > 1 ? 's' : ''} uploaded successfully`,
    data: {type: NotificationTypes.UPLOAD_COMPLETE},
    priority: 'high',
    color: '#4CAF50',
  });
};

/**
 * Show upload failed notification
 */
export const showUploadFailedNotification = async (
  formName: string,
  error: string,
): Promise<void> => {
  await showNotification({
    id: NotificationTypes.UPLOAD_FAILED,
    title: 'Upload Failed',
    message: `Failed to upload ${formName}: ${error}`,
    data: {type: NotificationTypes.UPLOAD_FAILED},
    priority: 'high',
    color: '#F44336',
  });
};

/**
 * Show location tracking notification (foreground service)
 */
export const showLocationTrackingNotification = async (
  projectName: string,
): Promise<void> => {
  await showNotification({
    id: NotificationTypes.LOCATION_TRACKING,
    title: 'Tracking Location',
    message: `Collecting location data for ${projectName}`,
    data: {type: NotificationTypes.LOCATION_TRACKING},
    priority: 'low',
    color: '#2196F3',
    invokeApp: false,
  });
};

/**
 * Show sync complete notification
 */
export const showSyncCompleteNotification = async (
  itemCount: number,
): Promise<void> => {
  await showNotification({
    id: NotificationTypes.SYNC_COMPLETE,
    title: 'Sync Complete',
    message: `${itemCount} item${itemCount > 1 ? 's' : ''} synced successfully`,
    data: {type: NotificationTypes.SYNC_COMPLETE},
    priority: 'default',
    color: '#4CAF50',
  });
};
