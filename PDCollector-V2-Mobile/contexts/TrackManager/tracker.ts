import BGLocation, {
  LocationAuthorizationAlert,
  PermissionRationale,
  ProviderChangeEvent,
} from 'react-native-background-geolocation-android';
import {assign, createMachine} from 'xstate';
import {displayName} from '../../app.json';
import authStore from '../../shared/stores/auth';
import {Project} from '../../shared/types/project';
import {baseURL} from '../../shared/utils';

// type definition for track expected by track submission API
type Track = {
  endedAt: string;
  session: string;
  startedAt: string;
  projectId: Project['id'];
  geometries: {
    type: 'LineString';
    coordinates: number[][];
  }[];
};

type LocationErr = {
  message: string;
  type: 'denied' | 'gps_off' | 'when_in_use';
};

export type Context = {
  startDate: Date;
  session: string;
  project: Project | null;
  track: [number, number][];
  accurracyEnabled: boolean;
  error?: LocationErr | null;
  currentSegment: Context['track'];
  projectName: Project['name'] | null;
};

type States =
  | {value: 'disabled'; context: Context}
  | {value: 'error'; context: Context & {error: Error}}
  | {value: 'enabled'; context: Context & {project: Project['id']}};

type Events =
  | {type: 'CLEAR_ERROR'}
  | {type: 'ENABLE'; project: Project}
  | {type: 'ERROR'; error: LocationErr}
  | {type: 'SUBMIT' | 'DISABLE' | 'STOP'}
  | {type: 'COORDS'; data: [number, number]}
  | {type: 'ENABLE_ACCURACY'; value: boolean};

const bgErrorMsg = `Background tracking not enabled, tracking will stop when you minize ${displayName}`;

const message = `${displayName} needs access to your background location to collect live track updates`;

const authorizationAlert: LocationAuthorizationAlert = {
  instructions: message,
  cancelButton: 'Cancel',
  settingsButton: 'Go to settings',
  titleWhenNotEnabled: 'Location permission is required for collecting tracks',
  titleWhenOff:
    'Location permission "Always" is required for collecting tracks when application is in the background',
};

const bgAuthorizationAlert: PermissionRationale = {
  title:
    "Allow {applicationName} to access to this device's location in the background?",
  message: `In order for ${displayName} to continue tracking in the background, please enable {backgroundPermissionOptionLabel} location permission to collect live track updates`,
  negativeAction: 'Cancel',
  positiveAction: 'Change to "{backgroundPermissionOptionLabel}"',
  // message:
  //   'In order to continue tracking in the background, please enable "{backgroundPermissionOptionLabel}" location permission',
};

const locationTemplate = '{"coordinates": [<%=longitude%>, <%=latitude%>]}';

const url = baseURL + '/tracks/submit';

const deniedError: LocationErr = {
  type: 'denied',
  message: 'Please allow location permission to collect tracks',
};

const machine = createMachine<Context, Events, States>(
  {
    id: 'tracker',
    initial: 'disabled',

    on: {
      STOP: 'disabled',

      DISABLE: 'disabled',

      ENABLE: {
        target: 'enabled',
        actions: 'setProject',
      },

      CLEAR_ERROR: {
        actions: 'clearError',
      },

      ENABLE_ACCURACY: {
        actions: assign({
          accurracyEnabled: (_, {value}) => value,
        }),
      },
    },

    states: {
      enabled: {
        entry: assign({track: (_) => []}),

        on: {
          ENABLE: {
            target: 'enabled',
            actions: ['setProject', 'clearTracks'],
          },

          DISABLE: 'disabled',

          COORDS: {
            actions: 'setTrack',
          },

          ERROR: [
            {
              actions: 'setError',
              cond: (_, {error}) => error.type === 'when_in_use',
            },
            {
              target: 'disabled',
              actions: 'setError',
            },
          ],
        },

        invoke: {
          src: ({project, accurracyEnabled}) => (send) => {
            const date = new Date().toJSON();
            const {token} = authStore.getState();
            const text = `Tracking is on for ${project?.name} project`;

            BGLocation.ready({
              url,
              // debug: true,
              isMoving: true,
              batchSync: true,
              locationTemplate,
              distanceFilter: 0,
              maxDaysToPersist: 2,
              autoSyncThreshold: 3,
              stopOnTerminate: true,
              // set the gometry type
              extras: {type: 'Point'},
              foregroundService: true,
              stopOnStationary: false,
              locationUpdateInterval: 200,
              httpRootProperty: 'geometries',
              showsBackgroundLocationIndicator: true,
              locationAuthorizationRequest: 'Always',
              notification: {
                text,
                sticky: true,
                title: 'Tracking',
                channelName: 'Tracker',
                priority: BGLocation.NOTIFICATION_PRIORITY_HIGH,
              },
              // logLevel: BgGeolocation.LOG_LEVEL_DEBUG,
              headers: {Authorization: `Bearer ${token}`},
              locationAuthorizationAlert: authorizationAlert,
              backgroundPermissionRationale: bgAuthorizationAlert,

              // values to be sent to the backend service
              params: {
                endedAt: date,
                startedAt: date,
                projectId: project?.id,
                session: Date.now().toString(),
              },
              ...(accurracyEnabled && {
                desiredAccuracy: BGLocation.DESIRED_ACCURACY_NAVIGATION,
              }),
            }).then(async (state) => {
              BGLocation.onEnabledChange((enabled) => {
                if (!enabled) send('DISABLE');
              });

              BGLocation.onLocation(
                ({coords}) => {
                  const {latitude, longitude} = coords;
                  send({type: 'COORDS', data: [latitude, longitude]});
                },
                (err) => {
                  if (err === 1 || err === 499) send('DISABLE');
                },
              );

              // const Logger = BGLocation.logger;

              // BGLocation.onHttp((response) => {
              //   Logger.uploadLog('http://192.168.1.24:2000')
              //     .then(() => {
              //       console.log('log uploaded');
              //     })
              //     .catch((error) => {
              //       console.log('log upload failed: ', error);
              //     });
              // });

              let lastProvider: ProviderChangeEvent;

              BGLocation.onProviderChange((e) => {
                const {gps, status} = e;

                if (
                  lastProvider?.status ===
                    BGLocation.AUTHORIZATION_STATUS_DENIED &&
                  status === BGLocation.AUTHORIZATION_STATUS_DENIED
                ) {
                  return send({type: 'ERROR', error: deniedError});
                }

                if (status === BGLocation.AUTHORIZATION_STATUS_WHEN_IN_USE) {
                  send({
                    type: 'ERROR',
                    error: {type: 'when_in_use', message: bgErrorMsg},
                  });
                }

                if (lastProvider?.gps && !gps) {
                  send({
                    type: 'ERROR',
                    error: {
                      type: 'gps_off',
                      message: 'Please switch on your gps to collect tracks',
                    },
                  });
                }

                lastProvider = e;
              });

              if (!state.enabled) {
                try {
                  await BGLocation.start();
                } catch (error) {
                  send({type: 'ERROR', error: deniedError});
                }
              }
            });

            return () => {
              BGLocation.sync();
              BGLocation.removeAllListeners();
              BGLocation.stop();
            };
          },
        },
      },
      disabled: {
        entry: 'clear',
      },
    },
  },
  {
    actions: {
      setTrack: assign({
        track: ({track}, {data}: any) => [...track, data],
        currentSegment: (_, {data}: any) => [..._.currentSegment, data],
      }),

      setProject: assign({
        project: (_, {project}: any) => project,
      }),

      clearTracks: assign({
        track: (_) => [],
        currentSegment: (_) => [],
      }),

      clear: assign({
        // error: (_) => null,
        project: (_) => null,
      }),

      setError: assign({error: (_, {error}: any) => error}),

      clearError: assign({error: (_) => null}),
    },
  },
);

export default machine;
