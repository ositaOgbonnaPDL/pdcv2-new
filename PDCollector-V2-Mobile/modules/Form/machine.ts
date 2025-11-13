import * as A from 'fp-ts/Array';
import * as B from 'fp-ts/boolean';
import {pipe} from 'fp-ts/lib/function';
import * as R from 'fp-ts/Record';
import {ascend, join, prop, sort} from 'ramda';
import {LatLng} from 'react-native-maps';
import {ActorRef, assign, createMachine, send, spawn} from 'xstate';
import {pure} from 'xstate/lib/actions';
import {Feature, Field, Project} from '../../shared/types/project';
import actor from './actor';
import {isSet} from './utils';

type Context = {
  mocked: boolean;
  fields: Field[];
  feature: Feature;
  coordinates: LatLng[];
  skippedFields: number[];
  values: Record<number, any>;
  errors: Map<number, string>;
  geofence: Project['geofence'];
  collectedData?: Record<number, unknown>;
  // mappedFields: Record<Field['id'], Field>;
  actors: Record<string, ActorRef<any, any>>;

  doneMarker: Field['id'][];

  // mapping of fields and their dependants. for example
  //            field1
  //              |
  //   -----(Dependants)-------
  //   |           |          |
  // field2     field3     field4
  dependencyMapping: Record<Field['id'], Field['id'][]>;
};

type States =
  | {value: 'active'; context: Context}
  | {
      value:
        | 'validate'
        | {validate: 'maybeBailOut' | 'values' | 'feature' | 'geofence'};
      context: Context;
    }
  | {value: 'submitted'; context: Context};

type Events =
  | {type: 'SUBMIT'}
  | {type: 'CHANGE'; id: number; value: any}
  | {type: 'SET_COORDS'; coords: LatLng[]; mocked: boolean}
  | {type: 'CLEAR_ERROR'; id: number}

  // events from actor
  | ((
      | {type: 'JUMP'; from: Field['id']; to: Field['id']}
      | {type: 'VALIDATION_SUCCESSFUL'}
      | {data: any; type: 'VALIDATION_FAILED'}
      | {data: any; type: 'ACTIVATE_REQUEST_SUCCESSFUL'}
      | {type: 'HIDE'; target: Field['id']}
    ) & {id: Field['id']});

const byOrder = ascend(prop('fieldOrder'));

const machine = createMachine<Context, Events, States>(
  {
    id: 'machine',
    initial: 'active',

    entry: [
      'setInitialValues',
      'spawnActors',
      'orderFields',
      'createDependencyMapping',
    ],

    on: {
      SET_COORDS: {
        actions: assign({
          mocked: (_, {mocked}) => mocked,
          coordinates: (_, {coords}) => coords,
        }),
      },

      CLEAR_ERROR: {
        actions: 'removeError',
      },
    },

    states: {
      active: {
        on: {
          SUBMIT: 'validate',

          CHANGE: {
            actions: [
              'setValue',
              'removeError',
              pure(({values, dependencyMapping}, {id, value}) => {
                const newValues = {...values, [id]: value};
                const dependants = dependencyMapping[id] ?? [];

                return dependants.map((id) => {
                  return send(
                    {type: 'REQUEST_ACTIVATE', values: newValues},
                    {to: id.toString()},
                  );
                });
              }),
            ],
          },
          HIDE: {
            actions: assign({
              values: ({values}, {target}) => {
                delete values[target];
                return values;
              },
              skippedFields: ({skippedFields}, {target}) => {
                return [...new Set([...skippedFields, target])];
              },
            }),
          },
          JUMP: {
            actions: assign(({fields, values, skippedFields}, {id, to}) => {
              const currentIndex = fields.findIndex((f) => f.id === id);

              const targetIndex = fields.findIndex((f) => f.id === to);

              const skips = fields
                .slice(currentIndex + 1, targetIndex)
                .map(({id}) => id);

              skips.forEach((id) => {
                delete values[id];
              });

              return {
                values,
                skippedFields: [...new Set([...skippedFields, ...skips])],
              };
            }),
          },
          ACTIVATE_REQUEST_SUCCESSFUL: {
            actions: [
              'removeError',
              assign({
                skippedFields: ({skippedFields}, {id}) => {
                  return skippedFields.filter((n) => n !== id);
                },
                values: ({values}, {id, data}) => {
                  return {...values, [id]: data ?? values[id]};
                },
              }),
            ],
          },
        },
      },
      validate: {
        initial: 'maybeBailOut',

        states: {
          maybeBailOut: {
            // bail out if there are still errors from previous validation
            // event
            always: [
              {
                target: '#machine.active',
                actions: 'resolveErrorsNotif',
                cond: ({errors}) => errors.size > 0,
              },
              {
                target: 'values',
              },
            ],
          },

          values: {
            exit: assign({
              doneMarker: (_) => [],
              // errors: (_) => new Map(),
            }),

            entry: pure<Context, any>(({fields, values, skippedFields}) => {
              return fields
                .filter((f) => !skippedFields.includes(f.id))
                .map((f) => {
                  return send(
                    {values, type: 'VALIDATE'},
                    {to: f.id.toString()},
                  );
                });
            }),

            // on every event send from the child actors during
            // the validation process, move to state `idle` to begin
            // form submission. It's more like a tally system where we take
            // not of every item that passes by i.e actors
            always: [
              {
                target: '#machine.active',
                actions: 'resolveErrorsNotif',
                cond: ({errors, doneMarker, fields, skippedFields}) => {
                  const length = fields.length - skippedFields.length;
                  return doneMarker.length >= length && errors.size > 0;
                },
              },
              {
                target: 'idle',
                cond: ({doneMarker, fields, skippedFields}) => {
                  const length = fields.length - skippedFields.length;
                  return doneMarker.length >= length;
                },
              },
            ],

            on: {
              VALIDATION_FAILED: {
                actions: [
                  'setError',
                  assign({
                    doneMarker: ({doneMarker}, {id}: any) => [
                      ...doneMarker,
                      id,
                    ],
                  }),
                ],
              },
              VALIDATION_SUCCESSFUL: {
                actions: assign({
                  doneMarker: ({doneMarker}, {id}: any) => [...doneMarker, id],
                }),
              },
            },
          },
          idle: {
            always: [
              {
                target: 'feature',
                cond: ({feature}) => Boolean(feature),
              },
              {
                target: '#machine.submitted',
              },
            ],
          },
          feature: {
            invoke: {
              src: 'checkFeature',
              onDone: '#machine.submitted',
              onError: {
                target: '#machine.active',
                actions: 'notifyFeatureError',
              },
            },
          },
        },
      },
      submitted: {
        type: 'final',
        entry: ['sanitizeData', 'pipeSets', 'submit'],
      },
    },
  },
  {
    actions: {
      createDependencyMapping: assign({
        dependencyMapping: ({fields}) => {
          let mapping = {} as Context['dependencyMapping'];

          for (let i = 0; i < fields.length; i++) {
            const {id, dependencies} = fields[i];

            for (let j = 0; j < dependencies.length; j++) {
              const {field} = dependencies[j];
              mapping[field] = [...(mapping[field] ?? []), id];
            }
          }

          return mapping;
        },
      }),

      pipeSets: assign({
        values({values}) {
          const newValues = pipe(
            values,
            R.keys,
            A.map((id) => {
              const val = values[+id];
              return pipe(
                val,
                isSet,
                B.match(
                  () => val,
                  () => pipe(val, Array.from, join('|')),
                ),
                (x) => [id, x],
              );
            }),
          );

          return Object.fromEntries(newValues);
        },
      }),

      sanitizeData: assign({
        values({values, skippedFields}) {
          let newValues = {...values};

          Object.keys(values).forEach((key) => {
            const id = parseInt(key, 10);
            const value = values[id];

            if (skippedFields.includes(id) || !value) {
              delete newValues[id];
            }
          });

          return newValues;
        },
      }),

      setValue: assign({
        values: ({values}, {id, value}: any) => {
          return {...values, [id]: value};
        },
      }),

      setError: assign({
        errors: ({errors}, {id, reason}: any) => {
          const err = new Map(errors);
          err.set(id, reason);
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

      setInitialValues: assign(({fields}) => {
        const values = Object.fromEntries(
          fields.map(({id, inputType, defaultValue}) => {
            return [
              id,
              inputType === 'image' || inputType === 'audio'
                ? {uri: defaultValue}
                : defaultValue,
            ];
          }),
        );

        return {values};
      }),

      orderFields: assign({
        fields: ({fields}) => sort(byOrder, fields),
      }),

      spawnActors: assign({
        actors: ({fields}) => {
          const spawnedActors = fields.map((field) => {
            const {id} = field;
            return [id, spawn(actor({field, fields}) as any, String(id))];
          });

          return Object.fromEntries(spawnedActors);
        },
      }),
    },
    services: {
      checkFeature: ({coordinates}) => {
        return new Promise((resolve, reject) => {
          if (coordinates.length <= 0) return reject();
          resolve(undefined);
        });
      },
    },
  },
);

export default machine;
