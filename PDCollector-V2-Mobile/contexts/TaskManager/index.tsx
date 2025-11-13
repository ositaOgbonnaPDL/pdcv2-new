import {useActor, useMachine} from '@xstate/react';
import {nanoid} from 'nanoid/non-secure';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {File} from '../../shared/types';
import manager, {Actor} from './machines/manager';
import {Asset, Task, Tasks, TaskState} from './types';

type ContextType = {
  tasks: Tasks;
  stop: () => void;
  start: () => void;
  getTask(id: Task['id']): Actor;
  spawnedTasks: Map<string, Actor>;
  createTask(
    task: Omit<Task, 'id' | 'state' | 'assets'> & {
      assets: Record<string, File>;
    },
  ): string;
};

export const ManagerContext = createContext<ContextType>({} as any);

export const useTaskManager = () => useContext(ManagerContext);

// const NotificationId = 1;

// const removeNotification = () => {
//   const id = NotificationId.toString();
//   PushNotification.cancelLocalNotifications({id});
//   PushNotification.removeDeliveredNotifications([id]);
// };

export default function TaskManager({children}: {children: ReactNode}) {
  const [state, send] = useActor(manager);
  const {tasks, spawnedTasks} = state.context;

  const getTask = useCallback<ContextType['getTask']>(
    (id) => spawnedTasks.get(id) as any,
    [spawnedTasks],
  );

  const stop = () => send('STOP' as never);

  const start = () => send('START' as never);

  const createTask = useCallback<ContextType['createTask']>(
    ({assets, client, projectId, ..._task}) => {
      const id = nanoid(10);

      const _assets = Object.keys(assets).map((id) => {
        const asset: Asset = {
          ...assets[id],
          id,
          client,
          projectId,
          progress: 0,
          state: TaskState.PENDING,
        };

        return [id, asset] as const;
      });

      const task: Task = {
        ..._task,
        id,
        client,
        projectId,
        assets: new Map(_assets),
        state: TaskState.PENDING,
      };

      send({task, type: 'ADD_TASK'} as never);

      return id;
    },
    [send, tasks],
  );

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      send({type: 'APP_STATE_CHANGE', state} as never);
    };

    AppState.addEventListener('change', onChange);

    return () => {
      AppState.removeEventListener('change', onChange);
    };
  }, [send]);

  return (
    <ManagerContext.Provider
      value={{
        stop,
        start,
        tasks,
        getTask,
        createTask,

        // @ts-ignore
        spawnedTasks,
      }}>
      {children}
    </ManagerContext.Provider>
  );
}
