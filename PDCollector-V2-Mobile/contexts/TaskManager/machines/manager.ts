// import {NetInfoState} from '@react-native-community/netinfo';
import {filter} from 'fp-ts/lib/Array';
import {pipe} from 'fp-ts/lib/function';
import {length} from 'ramda';
import {AppStateStatus} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {
  actions,
  ActorRef,
  assign,
  interpret,
  createMachine,
  spawn,
  State as StateType,
} from 'xstate';
import {choose} from 'xstate/lib/actions';
import {getAsyncItem, NOTIFICATION_CHANNEL, TASKS} from '../../../shared/utils';
import {Task, Tasks, TaskState} from '../types';
import taskMachine, {
  Context as TaskContext,
  Events as TaskEvents,
  States as TaskStates,
} from './task';
import {convertToAssetMap} from './utils';

export type Actor = ActorRef<
  TaskEvents,
  StateType<TaskContext, TaskEvents, TaskStates>
>;

type Context = {
  tasks: Tasks;
  spawnedTasks: Map<string, Actor>;
};

type States =
  | {value: 'inactive'; context: Context}
  | {value: 'idle'; context: Context}
  | {value: 'local'; context: Context}
  | {value: 'spawning'; context: Context};

type Events =
  | {type: 'START' | 'STOP'}
  | {type: 'ADD_TASK'; task: Task}
  | {type: 'TASK_DONE' | 'TASK_START'; task: Task}
  | {type: 'APP_STATE_CHANGE'; state: AppStateStatus};
// | {type: 'NETWORK_STATE_CHANGE'; state: NetInfoState}

const {pure, stop} = actions;

const NotificationId = 1;

const machine = createMachine<Context, Events, States>(
  {
    id: 'task-manager',
    initial: 'inactive',

    // FIX: https://github.com/statelyai/xstate/issues/3223
    // @ts-ignore
    preserveActionOrder: true,
    context: {
      tasks: new Map(),
      spawnedTasks: new Map(),
    },

    on: {
      START: 'local',
    },

    states: {
      inactive: {
        entry: assign({
          tasks: (_) => new Map(),
          spawnedTasks: (_) => new Map(),
        }),
      },
      idle: {
        on: {
          ADD_TASK: {
            target: 'spawning',
            actions: 'setTask',
          },

          TASK_START: {
            actions: 'setTask',
          },

          TASK_DONE: {
            actions: 'setTask',
          },

          STOP: {
            target: 'inactive',
            actions: [
              'removeNotification',
              pure(({tasks}) => {
                return [...tasks.values()]
                  .filter((t) => t.state !== TaskState.DONE)
                  .map((t) => stop(t.id));
              }),
            ],
          },

          APP_STATE_CHANGE: {
            actions: choose([
              {
                actions: 'removeNotification',
                cond: (_, {state}) => state === 'active',
              },
              {
                cond: (_, {state}) => state === 'background',
                actions: ({tasks}) => {
                  const numOfPendingTasks = pipe(
                    [...tasks.values()],
                    filter((t) => t.state !== TaskState.DONE),
                    length,
                  );

                  PushNotification.setApplicationIconBadgeNumber(
                    numOfPendingTasks,
                  );

                  if (numOfPendingTasks > 0) {
                    PushNotification.localNotification({
                      id: NotificationId,
                      channelId: NOTIFICATION_CHANNEL,
                      message: `${numOfPendingTasks} ${
                        numOfPendingTasks > 1 ? 'uploads' : 'upload'
                      } pending`,
                    });
                  }
                },
              },
            ]),
          },
        },
      },

      local: {
        invoke: {
          src: 'getSavedTasks',
          onDone: [
            {
              target: 'spawning',
              actions: 'setTasks',
              cond: (_, {data}) => Object.values(data).length > 0,
            },
            {
              target: 'idle',
            },
          ],
        },
      },

      spawning: {
        always: {
          target: 'idle',
          actions: 'spawnTasks',
        },
      },
    },
  },
  {
    actions: {
      setTask: assign({
        tasks: ({tasks}, {task}: any) => {
          const newTasks = new Map(tasks);
          newTasks.set(task.id, task);
          return newTasks;
        },
      }),

      setTasks: assign({
        tasks: ({tasks}, {data = {}}: any) => {
          const newTasks = new Map(tasks);

          Object.keys(data).forEach((key) => {
            const task = data[key];
            newTasks.set(key, task);
          });

          return newTasks;
        },
      }),

      spawnTasks: assign({
        spawnedTasks: ({tasks, spawnedTasks}) => {
          const spawned = new Map(spawnedTasks);

          tasks.forEach((task) => {
            if (!spawned.has(task.id)) {
              const ctx = {
                ...taskMachine.context,
                ...task,
                retries: 2,
                // notified: false,
              };

              const actor = spawn(taskMachine.withContext(ctx as any), task.id);
              spawned.set(task.id, actor);
            }
          });

          return spawned;
        },
      }),

      removeNotification: (_) => {
        const id = NotificationId.toString();
        PushNotification.cancelLocalNotifications({id});
        PushNotification.removeDeliveredNotifications([id]);
      },
    },

    services: {
      getSavedTasks: async () => {
        type Tasks = Record<string, Task>;
        const tasks = await getAsyncItem<Tasks>(TASKS);

        const _tasks = Object.values(tasks ?? {}).map(
          ({id, assets, ...task}) => {
            const _assets = convertToAssetMap(assets);
            return [id, {...task, id, assets: _assets}];
          },
        );

        return Object.fromEntries(_tasks);
      },
    },
  },
);

export default interpret(machine).start();

// export default machine;
