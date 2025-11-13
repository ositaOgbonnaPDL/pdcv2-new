/**
 * @format
 */

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {AppRegistry} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import PushNotification from 'react-native-push-notification';
import App from './App';
import {name as appName} from './app.json';
import manager from './contexts/TaskManager/machines/manager';
import authStore from './shared/stores/auth';
import {NOTIFICATION_CHANNEL} from './shared/utils';

authStore.subscribe(({isAuthenticated}) => {
  if (isAuthenticated) {
    manager.send('START');
  } else {
    manager.send('STOP');
  }
});

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: (notification) => {
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },
});

PushNotification.createChannel({
  channelId: NOTIFICATION_CHANNEL, // (required)
  channelName: 'Pending uploads', // (required)
});

// ReactNativeForegroundService.register();

AppRegistry.registerComponent(appName, () => App);

let headlessTask = async ({taskId, timeout}) => {
  if (timeout) {
    // This task has exceeded its allowed running-time.
    // You must stop what you're doing immediately finish(taskId)
    manager.send('STOP');
    console.log('[BackgroundFetch] Headless TIMEOUT:', taskId);
    BackgroundFetch.finish(taskId);
    return;
  }

  manager.send('START');

  console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

  // Perform an example HTTP request.
  // Important:  await asychronous tasks when using HeadlessJS.
  // let response = await fetch('http://192.169.1.8:3000/');
  // let responseJson = await response.json();
  // console.log('[BackgroundFetch HeadlessTask] response: ', responseJson);

  // Required:  Signal to native code that your task is complete.
  // If you don't do this, your app could be terminated and/or assigned
  // battery-blame for consuming too much time in background.
  // BackgroundFetch.finish(taskId);
};

// Register your BackgroundFetch HeadlessTask
BackgroundFetch.registerHeadlessTask(headlessTask);
