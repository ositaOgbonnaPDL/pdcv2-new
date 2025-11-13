import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  StatusBar,
  useColorScheme,
} from 'react-native';
import BackgroundFetch, {TaskConfig} from 'react-native-background-fetch';
import EncryptedStorage from 'react-native-encrypted-storage';
import 'react-native-gesture-handler';
import {Colors, DefaultTheme, Provider} from 'react-native-paper';
import PushNotification from 'react-native-push-notification';
import SplashScreen from 'react-native-splash-screen';
import {QueryClientProvider} from 'react-query';
import NetworkState from './contexts/NetworkState';
import TaskManager from './contexts/TaskManager';
import manager from './contexts/TaskManager/machines/manager';
import TrackManager from './contexts/TrackManager';
import Form from './modules/Form/screens';
import Home from './modules/Home';
import Login from './modules/Login';
import Map from './modules/Map';
import PasswordChange from './modules/PasswordChange';
import Project from './modules/Project';
import ProjectViewer from './modules/ProjectViewer';
import Settings from './modules/Settings';
import Tracker from './modules/Tracker';
import {accent, primary, primaryDark} from './shared/colors';
import BackImage from './shared/components/BackImage';
import {queryClient} from './shared/query';
import authStore, {CREDENTIALS} from './shared/stores/auth';
import useSettings, {
  colorSchemeSelector,
  PREFERENCE,
} from './shared/stores/settings';
import {mapTintColor, resetHeaderStyle} from './shared/theme';
import {
  getAsyncItem,
  NAVIGATION_STATE,
  setAsyncItem,
  TASK_ID,
} from './shared/utils';

declare const global: {HermesInternal: null | {}};

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      primaryDark: string;
    }
  }
}

const Stack = createStackNavigator();

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    accent,
    primary,
    primaryDark,
    text: 'black',
    background: accent,
    surface: primaryDark,
  },
};

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    text: 'white',
    surface: '#B5B5B5',
    background: primaryDark,
  },
};

// const config: TaskConfig = {
//   delay: 0,
//   taskId: TASK_ID,
//   startOnBoot: true,
//   enableHeadless: true,
//   stopOnTerminate: false,
//   forceAlarmManager: true,
// };

const App = () => {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  const scheme = useSettings(colorSchemeSelector);
  const system = useSettings(({theme}) => theme.system);

  const isAuth = authStore((s) => s.isAuthenticated);
  const isFirstTimeLoggedIn = authStore((s) => s.firstTimeLoggedIn);

  const isDark = scheme === 'dark';
  const pTheme = isDark ? darkTheme : lightTheme;

  const {background} = pTheme.colors;

  useLayoutEffect(() => {
    Promise.all([
      getAsyncItem(PREFERENCE),
      EncryptedStorage.getItem(CREDENTIALS),
    ]).then(([pref, auth]) => {
      if (pref) useSettings.setState(pref as any);
      if (auth) authStore.getState().setAuth(JSON.parse(auth));
      SplashScreen?.hide?.();
    });
  }, []);

  useEffect(() => {
    if (isAuth) {
      BackgroundFetch.status();
      PushNotification.requestPermissions();
    }
  }, [isAuth]);

  // Update settings store whenever the `useColorScheme hook value
  // changes
  useEffect(() => {
    if (system) {
      useSettings.getState().setTheme({colorScheme});
    }
  }, [system, colorScheme]);

  // useEffect(() => {
  //   manager.subscribe(({context: {tasks}}) => {
  //     const remaining = mapToArray(tasks).filter(({state}) => {
  //       return state === TaskState.PENDING || state === TaskState.UPLOADING;
  //     });

  //     if (remaining.length <= 0) {
  //       console.log('stopped');
  //       BackgroundFetch.stop(TASK_ID);
  //     } else {
  //       console.log('scheduled');
  //       BackgroundFetch.scheduleTask(config);
  //     }
  //   });
  // }, []);

  useEffect(() => {
    manager.send('START');
  }, []);

  useEffect(() => {
    if (isAuth) {
      BackgroundFetch.configure(
        {
          startOnBoot: true,
          enableHeadless: true,
          stopOnTerminate: false,
          forceAlarmManager: true,
          minimumFetchInterval: 15,
        },
        (taskId) => {
          if (taskId === TASK_ID) manager.send('START');
          console.log('[App.tsx:BackgroundFetch] taskId: ', taskId);
          // BackgroundFetch.finish(taskId);
        },
        (taskId) => {
          // manager.send('STOP');
          console.log('[App.tsx:BackgroundFetch]: timed out');
          BackgroundFetch.finish(taskId);
        },
      );
      // .then((status) => {
      //   // BackgroundFetch.scheduleTask(config);

      //   console.log(
      //     'status',
      //     status,
      //     (() => {
      //       switch (status) {
      //         case BackgroundFetch.STATUS_AVAILABLE:
      //           return 'STATUS_AVAILABLE';
      //         case BackgroundFetch.STATUS_DENIED:
      //           return 'STATUS_DENIED';
      //         case BackgroundFetch.STATUS_RESTRICTED:
      //           return 'STATUS_RESTRICTED';
      //       }
      //     })(),
      //   );

      //   // BackgroundFetch.start();
      // });
    }
  }, [isAuth]);

  useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (isAuth && initialUrl === null) {
          // Only restore state if there's no deep link and user is authenticated
          const state = await getAsyncItem(NAVIGATION_STATE);
          if (state !== undefined) setInitialState(state as any);
        }
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady, isAuth]);

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <NetworkState>
      <TrackManager>
        <TaskManager>
          <QueryClientProvider client={queryClient}>
            <Provider theme={pTheme}>
              <StatusBar
                backgroundColor={isDark ? primaryDark : accent}
                barStyle={isDark ? 'light-content' : 'dark-content'}
              />

              <NavigationContainer
                initialState={initialState}
                onStateChange={(state) => {
                  setAsyncItem(NAVIGATION_STATE, state);
                }}>
                <Stack.Navigator
                  screenOptions={{
                    headerTitleAlign: 'left',
                    headerBackTitleVisible: false,
                    headerTintColor: isDark ? Colors.white : Colors.black,
                    headerStyle: {
                      ...(resetHeaderStyle as any),
                      backgroundColor: background,
                    },
                    cardStyle: {
                      backgroundColor: background,
                    },
                    headerBackImage: ({tintColor}) => (
                      <BackImage color={tintColor} />
                    ),
                  }}>
                  {isAuth ? (
                    isFirstTimeLoggedIn ? (
                      <Stack.Screen
                        name="PasswordChange"
                        component={PasswordChange}
                        options={{title: 'Change Password', headerShown: false}}
                      />
                    ) : (
                      <>
                        <Stack.Screen
                          name="Home"
                          component={Home}
                          options={{headerShown: false}}
                        />

                        <Stack.Screen
                          name="Map"
                          component={Map}
                          options={{headerShown: false}}
                        />

                        <Stack.Screen
                          name="Form"
                          component={Form}
                          options={({route: {params}}) => {
                            return {title: (params as any)?.project?.name};
                          }}
                        />

                        <Stack.Screen
                          name="Project"
                          component={Project}
                          options={({route: {params}}) => {
                            return {title: (params as any)?.project?.name};
                          }}
                        />

                        <Stack.Screen
                          name="Tracker"
                          component={Tracker}
                          options={{
                            headerTransparent: true,
                            headerBackTitleVisible: false,
                            headerTitleStyle: {display: 'none'},
                            headerTintColor: mapTintColor(scheme),
                          }}
                        />

                        <Stack.Screen name="Settings" component={Settings} />

                        <Stack.Screen
                          name="ProjectViewer"
                          component={ProjectViewer}
                          options={{headerShown: false}}
                        />
                      </>
                    )
                  ) : (
                    <Stack.Screen
                      name="Login"
                      component={Login}
                      options={{headerShown: false}}
                    />
                  )}
                </Stack.Navigator>
              </NavigationContainer>
            </Provider>
          </QueryClientProvider>
        </TaskManager>
      </TrackManager>
    </NetworkState>
  );
};

export default App;
