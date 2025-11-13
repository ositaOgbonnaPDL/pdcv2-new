import {assign, createMachine} from 'xstate';

type Context = {
  error?: Error;
  currentTime: number;
};

type States =
  | {value: 'empty'; context: Context}
  | {value: 'recording'; context: Context}
  | {value: 'error'; context: Context}
  | {
      value: 'recorded' | {recorded: 'paused' | 'playing'};
      context: Context;
    };

type Events =
  | {
      type:
        | 'EMPTY'
        | 'ERROR'
        | `Record.${'start' | 'stop'}`
        | 'PLAY'
        | 'PAUSE'
        | 'STOP';
    }
  | {type: 'TIME_UPDATE'; time: number}
  | {type: `PERMISSION_${'BLOCKED' | 'UNAVAILABLE'}`};

const machine = createMachine<Context, Events, States>(
  {
    initial: 'empty',

    context: {
      currentTime: 0,
    },

    states: {
      empty: {
        entry: [
          // 'empty',
          assign({
            currentTime: (_) => 0,
          }),
        ],

        on: {
          'Record.start': 'recording',
        },
      },

      error: {
        on: {
          'Record.start': 'recording',
        },
      },

      recording: {
        on: {
          ERROR: 'error',

          'Record.stop': 'recorded',

          PERMISSION_BLOCKED: {
            target: 'error',
            actions: assign({
              error: (_) => new Error('Permissions required for recording'),
            }),
          },

          PERMISSION_UNAVAILABLE: {
            target: 'error',
            actions: assign({
              error: (_) => new Error('Your device does not support recording'),
            }),
          },

          TIME_UPDATE: {
            actions: 'updateTime',
          },
        },

        invoke: {
          src: 'recorder',
        },
      },

      recorded: {
        initial: 'paused',

        entry: 'onDone',

        on: {
          EMPTY: {
            target: 'empty',
            actions: 'empty',
          },
        },

        states: {
          paused: {
            on: {
              PLAY: 'playing',
            },
          },
          playing: {
            invoke: {
              src: 'player',
            },

            on: {
              STOP: 'paused',

              PAUSE: {
                target: 'paused',
                actions: 'pause',
              },

              TIME_UPDATE: {
                actions: 'updateTime',
              },
            },
          },
        },
      },
    },
  },
  {
    actions: {
      updateTime: assign({
        currentTime: (_, {time}: any) => time,
      }),
    },
  },
);

export default machine;
