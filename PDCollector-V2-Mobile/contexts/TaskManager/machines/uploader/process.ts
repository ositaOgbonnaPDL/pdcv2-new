import BackgroundService from 'react-native-background-actions';
import RNFS from 'react-native-fs';
import {Observable} from 'rxjs';
import {assign, createMachine, sendParent} from 'xstate';
import http from '../../../../shared/http';
import {NotFound} from '../../../../shared/utils';
import {Asset, TaskState} from '../../types';

export type Context = Asset;

export type States =
  | {value: 'idle'; context: Context}
  | {value: 'uploading'; context: Context}
  | {value: 'error'; context: Context}
  | {value: 'uploaded'; context: Context};

export type Events =
  | {type: 'START'}
  | {id: string; result: any; type: 'DONE'}
  | {id: string; progress: number; type: 'PROGRESS'};

const $service = ({id, uri, type, client, fileName, projectId}: Context) => {
  return new Observable<Events>((subscriber) => {
    if (uri.startsWith('http')) {
      subscriber.next({id, type: 'PROGRESS', progress: 100});
      subscriber.next({id, type: 'DONE', result: uri});
      subscriber.complete();
      return;
    }

    RNFS.exists(uri).then((exists) => {
      if (!exists) {
        return subscriber.error(new NotFound(`${fileName} not found`));
      }

      const file = {uri, type, name: fileName};
      const formData = new FormData();
      formData.append('file', file);

      const execTask = async () => {
        try {
          const {data} = await http.post('/mobile/file-upload', formData, {
            params: {projectId, clientId: client},
            onUploadProgress: ({total, loaded}) => {
              const progress = Math.round((loaded * 100) / total);
              subscriber.next({id, type: 'PROGRESS', progress});
            },
          });

          subscriber.next({id, type: 'DONE', result: data.data});
          subscriber.complete();
          RNFS.unlink(uri);
        } catch (err) {
          const rsp = (err as any).response?.data;
          subscriber.error(rsp ? new Error(rsp.message) : err);
        } finally {
          BackgroundService.stop();
        }
      };

      BackgroundService.start(execTask, {
        taskName: fileName,
        taskTitle: 'File upload',
        taskDesc: `${fileName} uploading`,
        taskIcon: {
          type: 'mipmap',
          name: 'ic_launcher',
        },
      });
    });

    return () => {
      BackgroundService.stop();
    };
  });
};

const DELAY = 4000;

const machine = createMachine<Context, Events, States>(
  {
    id: 'process',
    initial: 'idle',
    states: {
      idle: {
        on: {
          START: [
            {
              cond: 'isDone',
              target: 'uploaded',
            },
            {
              target: 'uploading',
            },
          ],
        },
      },
      uploading: {
        entry: ['setUploading', 'notifyStart'],

        on: {
          DONE: 'uploaded',

          PROGRESS: {
            actions: ['setProgress', 'notifyProgress'],
          },
        },

        invoke: {
          src: (ctx) => $service(ctx),
          onDone: 'uploaded',
          onError: {
            target: 'error',
            actions: 'notifyError',
          },
        },
      },
      error: {
        after: {
          [DELAY]: {
            target: 'uploading',
            meta: {
              summary: 'Restart upload after 2 minute',
            },
          },
        },

        on: {
          START: 'uploading',
        },
      },
      uploaded: {
        type: 'final',
        entry: ['setDone', 'notifyDone'],
      },
    },
  },
  {
    guards: {
      isDone: ({state}) => state === TaskState.DONE,
    },
    actions: {
      setDone: assign({
        state: (_) => TaskState.DONE,
      }),

      setUploading: assign({
        state: (_) => TaskState.UPLOADING,
      }),

      setProgress: assign({
        progress: (_, {progress}: any) => progress,
      }),

      notifyStart: sendParent(({id}) => {
        return {id, type: 'STARTED'};
      }),

      notifyError: sendParent(({id}, {data}: any) => {
        // console.log('process error', data);
        return {id, error: data, type: 'ERROR'};
      }),

      notifyDone: sendParent(({id}, {result}: any) => {
        return {id, result, type: 'DONE', state: TaskState.DONE};
      }),

      notifyProgress: sendParent(({id}, {progress}: any) => {
        return {id, progress, type: 'PROGRESS', state: TaskState.UPLOADING};
      }),
    },
  },
);

export default machine;
