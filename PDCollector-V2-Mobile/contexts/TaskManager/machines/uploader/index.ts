import {
  actions,
  assign,
  createMachine,
  send,
  sendParent,
  spawn,
  ActorRef,
  State as StateType,
} from 'xstate';
import {mapToArray} from '../../../../shared/utils';
import {Asset, TaskState} from '../../types';
import childProcess, {
  Context as ProcessContext,
  Events as ProcessEvents,
  States as ProcessStates,
} from './process';

export type ChildProcess = ActorRef<
  ProcessEvents,
  StateType<ProcessContext, ProcessEvents, ProcessStates>
>;

export type Context = {
  // container to track which child processes that
  // are done uploading their data.
  _doneMarker: string[];

  // files to upload
  assets: Map<string, Asset>;

  // errors reported by each child process during
  // upload
  errors: Map<string, Error>;

  childProcesses: Map<string, ChildProcess>;
};

export type States =
  | {value: 'idle'; context: Context}
  | {value: 'processing'; context: Context}
  | {value: 'done'; context: Context};

export type Events =
  | {type: 'START'}

  // Event to Retry any failed child process
  | {type: 'RETRY'; id: string}

  // child process events

  // child process notifies its parent that it has
  //started uploading its data.
  | {id: string; type: 'STARTED'}
  | {id: string; state: TaskState; error: any; type: 'ERROR'}
  | {id: string; state: TaskState; result: any; type: 'DONE'}
  | {id: string; state: TaskState; progress: number; type: 'PROGRESS'};

const {pure} = actions;

const machine = createMachine<Context, Events, States>(
  {
    id: 'queue',
    initial: 'idle',
    context: {
      _doneMarker: [],
      assets: new Map(),
      errors: new Map(),
      childProcesses: new Map(),
    },
    states: {
      idle: {
        on: {
          START: {
            target: 'processing',
            actions: 'spawnProcesses',
          },
        },
      },
      processing: {
        entry: 'startProcesses',

        always: {
          target: 'done',
          cond: 'isDone',
        },

        on: {
          PROGRESS: {
            actions: 'setProgress',
          },

          DONE: {
            actions: ['markProcess', 'setValue'],
          },

          ERROR: {
            actions: 'setError',
          },

          STARTED: {
            actions: 'removeError',
          },

          RETRY: {
            actions: 'sendProcessStart',
          },
        },
      },
      done: {
        type: 'final',
        entry: 'notifyDone',
      },
    },
  },
  {
    guards: {
      isDone: ({_doneMarker, childProcesses}) => {
        return _doneMarker.length >= childProcesses.size;
      },
    },
    actions: {
      // notify parent that all child processes are done uploading
      // their data.
      notifyDone: sendParent(({assets}) => {
        return {assets, type: 'DONE'};
      }),

      // start all child processes
      spawnProcesses: assign({
        childProcesses: ({assets}) => {
          const actors = mapToArray(assets).map((asset) => {
            const ctx = {...childProcess.context, ...asset};
            const actor = spawn(childProcess.withContext(ctx), asset.id);
            return [asset.id, actor] as const;
          });

          return new Map(actors);
        },
      }),

      // start individual child process
      sendProcessStart: send('START', {to: (_, {id}: any) => id}),

      startProcesses: pure(({assets}) => {
        return mapToArray(assets).map(({id}) => {
          return send('START', {to: id});
        });
      }),

      markProcess: assign({
        _doneMarker: ({_doneMarker}, {id}: any) => {
          return [..._doneMarker, id];
        },
      }),

      setValue: assign({
        assets: ({assets}, {id, state, result}: any) => {
          const _assets = new Map(assets);
          const asset = _assets.get(id);

          if (asset) {
            _assets.set(id, {
              ...asset,
              state,
              result,
            });
          }

          return _assets;
        },
      }),

      setProgress: assign({
        assets: ({assets}, {id, state, progress}: any) => {
          const _assets = new Map(assets);
          const asset = _assets.get(id);

          if (asset) {
            _assets.set(id, {
              ...asset,
              state,
              progress,
            });
          }

          return _assets;
        },
      }),

      setError: assign({
        errors: ({errors}, {id, error}: any) => {
          const err = new Map(errors);
          err.set(id, error);
          return err;
        },
      }),

      removeError: assign({
        errors: ({errors}, {id}: any) => {
          const err = new Map(errors);
          err.delete(id);
          return err;
        },
      }),
    },
  },
);

export default machine;
