import {
  ActorRef,
  assign,
  createMachine,
  spawn,
  State as StateType,
} from 'xstate';
import {send, sendParent} from 'xstate/lib/actions';
import {post} from '../../../shared/http';
import {
  getAsyncItem,
  isPointTuple,
  mapToArray,
  setAsyncItem,
  TASKS,
} from '../../../shared/utils';
import {Asset, PointTuple, Task, TaskState} from '../types';
import assetUploader, {
  Context as UploaderContext,
  Events as UploaderEvents,
  States as UploaderStates,
} from './uploader';

type UploaderRef = ActorRef<
  UploaderEvents,
  StateType<UploaderContext, UploaderEvents, UploaderStates>
>;

export type Context = Task & {
  result?: any;
  error?: Error;
  retries: number;
  assetUploader: UploaderRef;
};

export type States =
  | {value: 'idle'; context: Context}
  | {value: {submitting: 'assets'} | {submitting: 'data'}; context: Context}
  | {value: 'submitted'; context: Context}
  | {value: 'error'; context: Context};

export type Events = {type: 'RETRY' | 'DONE'};

type Data = {
  projectId: number;
  isMocked: boolean;
  collectedAt: Date;
  geometry: Task['geometry'];
  fieldsAndValues: Record<string, any>;
};

const submitData = post<Data, any>('/mobile/projects/submit');

export const swapPoint = ([lat, lng]: PointTuple): PointTuple => [lng, lat];

const maxBackoff = 60 * 1000; // default 1 minute

const machine = createMachine<Context, Events, States>(
  {
    id: 'task',
    initial: 'idle',
    entry: 'spawnUploader',

    preserveActionOrder: true,

    states: {
      idle: {
        always: [
          {
            cond: 'isDone',
            target: 'submitted',
            actions: 'notifyParentDone',
          },
          {
            target: 'submitting',
            actions: 'setStatePending',
          },
        ],
      },
      submitting: {
        initial: 'assets',

        entry: ['saveTask', 'notifyParentStart'],

        states: {
          assets: {
            entry: 'startUploader',

            on: {
              DONE: {
                target: 'data',
                actions: ['setAssets', 'saveTask'],
              },
            },
          },
          data: {
            entry: 'setStateUploading',

            invoke: {
              src: 'submit',
              onDone: {
                target: '#task.submitted',
                actions: [
                  'notifyParentDone',
                  'saveTask',
                  assign({
                    state: (_) => TaskState.DONE,
                    result: (_, {data}) => data.data,
                  }),
                ],
              },
              onError: {
                target: '#task.error',
                actions: ['setError', 'setStatePending'],
              },
            },
          },
        },
      },
      submitted: {
        type: 'final',
        entry: 'saveTask',
      },
      error: {
        entry: assign({
          retries: ({retries}) => retries + 1,
        }),

        on: {
          RETRY: 'submitting.data',
        },

        after: {
          errorBackoffDelay: 'submitting.data',
        },
      },
    },
  },
  {
    delays: {
      errorBackoffDelay: ({retries}) => {
        const delay = 3000 * 2 ** retries;
        return Math.min(delay, maxBackoff);
      },
    },
    guards: {
      isDone: ({state}) => state === TaskState.DONE,
    },
    actions: {
      startUploader: send('START', {to: 'uploader'}),

      setError: assign({error: (_, {data}: any) => data}),

      setStatePending: assign({state: (_) => TaskState.PENDING}),

      setStateUploading: assign({state: (_) => TaskState.UPLOADING}),

      notifyParentStart: sendParent((ctx) => ({
        type: 'TASK_START',
        task: {...ctx, state: TaskState.PENDING},
      })),

      notifyParentDone: sendParent((ctx) => ({
        type: 'TASK_DONE',
        task: {...ctx, state: TaskState.DONE},
      })),

      setAssets: assign({
        assets: (_, {assets}: any) => assets,
        data: ({data}, e) => {
          const _data = {...data};
          const assets = (e as any).assets as Map<string, Asset>;
          assets.forEach(({id, result}) => (_data[id] = result));
          return _data;
        },
      }),

      saveTask: async ({error: _, assets, assetUploader: __, ...task}) => {
        const _assets = Object.fromEntries(
          mapToArray(assets).map((asset) => {
            return [asset.id, asset];
          }),
        );

        const tasks = await getAsyncItem<Record<string, Task>>(TASKS);

        setAsyncItem(TASKS, {
          ...(tasks ?? {}),
          [task.id]: {...task, assets: _assets},
        });
      },

      spawnUploader: assign({
        assetUploader: ({assets}) => {
          const ctx = {...assetUploader.context, assets} as any;
          const actor = spawn(assetUploader.withContext(ctx), 'uploader');
          return actor;
        },
      }),
    },

    services: {
      submit({data, collectedOn, isMocked, geometry, projectId}) {
        const {coordinates} = geometry;

        const swappedGeo = isPointTuple(coordinates)
          ? swapPoint(coordinates)
          : ([coordinates[0].map(swapPoint)] as const);

        return submitData({
          isMocked,
          projectId,
          fieldsAndValues: data,
          collectedAt: collectedOn,
          geometry: {
            ...geometry,
            coordinates: swappedGeo as any,
          },
        });
      },
    },
  },
);

export default machine;
