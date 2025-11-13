import {assign, createMachine} from 'xstate';
import {ValuesType} from '../../contexts/TrackManager';
import {Project} from '../../shared/types/project';

export enum TStates {
  On = 'on',
  Off = 'off',
}

type Ctx = {
  project: Project;
  tracking: ValuesType;
};

type States = {value: TStates; context: Ctx};

type Events =
  | {type: 'ENABLE' | 'DISABLE' | 'CONTINUE' | 'ON' | 'OFF'}
  | {type: 'SET'; tracking: Ctx['tracking']};

const machine = createMachine<Ctx, Events, States>({
  id: 'machine',

  initial: 'off',

  on: {
    ENABLE: {
      target: 'on',
      actions: 'on',
    },

    SET: {
      actions: assign({
        tracking: (_, {tracking}) => tracking,
      }),
    },
  },

  states: {
    [TStates.On]: {
      on: {
        OFF: 'off',
        DISABLE: {
          target: 'off',
          actions: 'off',
        },
      },
    },

    [TStates.Off]: {
      initial: 'idle',

      on: {
        ENABLE: [
          {
            target: '.consent',
            cond: ({tracking, project}) => {
              return tracking.enabled && tracking.project?.id !== project.id;
            },
          },
          {
            target: 'on',
            actions: 'on',
          },
        ],
      },

      states: {
        idle: {
          on: {
            ON: '#machine.on',
          },
        },

        consent: {
          on: {
            DISABLE: 'idle',
            CONTINUE: {
              target: '#machine.on',
            },
          },

          invoke: {
            src: 'notifySwitching',
          },
        },
      },
    },
  },
});

export default machine;
