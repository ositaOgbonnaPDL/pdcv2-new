import * as E from 'fp-ts/Either';
import {flow} from 'fp-ts/lib/function';
// @ts-ignore
import {mapInFrames} from 'next-frame';
import {identity, map, prop, propEq, toLower, trim} from 'ramda';
import {match, select, when, __ as T} from 'ts-pattern';
import {Receiver, Sender} from 'xstate';
import * as z from 'zod';
import {Dependency, Field} from '../../shared/types/project';
import {isFile, isSet} from './utils';

type EventsToParent = (
  | {
      data: any;
      type: 'VALIDATION_SUCCESSFUL' | 'ACTIVATE_REQUEST_SUCCESSFUL';
    }
  | {
      reason: any;
      type: 'VALIDATION_FAILED' | 'ACTIVATE_REQUEST_FAILED';
    }
) & {id: number};

type EventsFromParent = {
  values: Record<number, any>;
  type: 'VALIDATE' | 'REQUEST_ACTIVATE';
};

const isCond = propEq('dependencyEvent', 'POST');

type Jump = {
  type: 'JUMP';
  to: Field['id'];
};

type Hide = {
  type: 'HIDE';
  target: Field['id'];
};

type Fail = {
  reason: string;
  type: 'VALIDATION_FAILED';
};

type Success = {
  type: 'VALIDATION_SUCCESSFUL';
};

type ResultEither = E.Either<Hide | Jump | Fail, Success>;

const returnRight = (): ResultEither => {
  return E.right({type: 'VALIDATION_SUCCESSFUL'});
};

export const resolveDependencies = ({
  values,
  fields,
  skipTypes = [],
  field: globalField,
}: {
  field: Field;
  values: Record<number, any>;
  fields: Record<Field['id'], Field>;
  skipTypes?: Dependency['dependencyType'][];
}) => {
  let computation: number | undefined;

  const {id: gFieldId, dependencies, dependencyOption} = globalField;

  return new Promise(async (resolve, reject) => {
    if (!dependencies || dependencies.length <= 0) {
      return resolve(undefined);
    }

    const deps = await mapInFrames(
      dependencies.filter((d) => !skipTypes.includes(d.dependencyType)),
      ({
        formula,
        // tempField,
        condition,
        conditionValue,
        dependencyType,
        dependencyEvent,
        ...rest
      }: Dependency) => {
        const field = fields[rest.field];

        let fieldId = gFieldId;
        let name = globalField.name;

        // swap field context based on dependencyEvent, we should be checking
        // against the "global field" if it's a POST event given the context
        // which we should be dealing with is the field itself and not other fields
        if (field && dependencyEvent === 'PRE') {
          [name, fieldId] = [field.name, field.id];
        }

        const value = values[fieldId];

        const val = match(value)
          .with(
            when((x) => isSet(x)),
            (v) => map(toLower, [...v]),
          )
          .with(when(isFile), prop('uri'))
          .with(T.string, flow(toLower, trim))
          .with(T, identity)
          .exhaustive();

        const condValue = conditionValue?.toLowerCase();

        const isHide = dependencyType === 'HIDE';
        const isJump = dependencyType === 'JUMP';
        const isMath = dependencyType === 'MATH';
        const isValidate = dependencyType === 'VALIDATE';

        let formulaStr = formula;

        if (isMath && formula) {
          const fieldTokens = formula.match(/#field\d/g);

          // create map of fieldToken to digit (tempField) in token
          // e.g {#field6: 6, #field7: 7, #field8: 8}
          const tokensMap = fieldTokens?.map((token) => {
            const digit = token.match(/\d/g);
            return [token, digit?.[0]];
          });

          if (tokensMap) {
            const tokens = Object.fromEntries(tokensMap);

            // replace formula tokens with their respective values
            // e.g values of {field3: 10, field6: 3, field7: 5} and
            // formula of #field3 + #field6 * #field7 would become 3 + 6 * 5
            fieldTokens?.forEach((token) => {
              const digit = tokens[token];
              const field = fields[digit];
              const value = values[field.id];
              formulaStr = formulaStr.replace(new RegExp(token, 'g'), value);
            });
          }

          // eslint-disable-next-line no-eval
          computation = eval(formulaStr);
        }

        const emptyMsg = `${name} cannot be left empty.`;

        const returnJump: Jump = {type: 'JUMP', to: rest.field};

        const returnHide: Hide = {type: 'HIDE', target: gFieldId};

        const returnDefaultFail: Fail = {
          reason: emptyMsg,
          type: 'VALIDATION_FAILED',
        };

        const returnFailEqual: Fail = {
          type: 'VALIDATION_FAILED',
          reason: `${name} should be ${conditionValue}`,
        };

        const returnFailNotEqual: Fail = {
          type: 'VALIDATION_FAILED',
          reason: `${name} should not be ${conditionValue}`,
        };

        const returnFailLessThan: Fail = {
          type: 'VALIDATION_FAILED',
          reason: `${name} should be less than ${conditionValue}`,
        };

        const returnFailGreaterThan: Fail = {
          type: 'VALIDATION_FAILED',
          reason: `${name} should be above ${conditionValue}`,
        };

        return match(condition)
          .with('HAS_A_VALUE', () => {
            if (
              val !== null ||
              val !== undefined ||
              (Array.isArray(val) && (val as []).length >= 0)
            ) {
              if (isJump) return E.left(returnJump);
              if (isHide) return E.left(returnHide);
            } else {
              if (isValidate) return E.left(returnDefaultFail);
            }

            return returnRight();
          })
          .with('IS_EQUAL_TO', () => {
            if (val === condValue) {
              if (isJump) return E.left(returnJump);
              if (isHide) return E.left(returnHide);
            } else {
              // make sure passed value does not matche value as specified in the dependency
              if (isValidate) return E.left(returnFailEqual);
            }

            return returnRight();
          })
          .with('IS_NOT_EQUAL_TO', () => {
            if (val !== condValue) {
              if (isJump) return E.left(returnJump);
              if (isHide) return E.left(returnHide);
            } else {
              // make sure passed value matches value as specified in the dependency
              if (isValidate) return E.left(returnFailNotEqual);
            }

            return returnRight();
          })
          .with('LESS_THAN', 'LESS_THAN_OR_EQUAL_TO', () => {
            if (val > condValue) {
              if (isValidate) return E.left(returnFailLessThan);
            } else {
              if (isJump) return E.left(returnJump);
              if (isHide) return E.left(returnHide);
            }

            return returnRight();
          })
          .with('GREATER_THAN', 'GREATER_THAN_OR_EQUAL_TO', () => {
            // switch (true) {
            //   case val <= condValue && type === 'GREATER_THAN_OR_EQUAL_TO':
            //   case val < condValue:
            //     if (isValidate) return E.left(returnFailGreaterThan);
            //     break;

            //   default:
            //     if (isJump) return E.left(returnJump);
            //     if (isHide) return E.left(returnHide);
            //     break;
            // }

            if (val < condValue) {
              if (isValidate) return E.left(returnFailGreaterThan);
            } else {
              if (isJump) return E.left(returnJump);
              if (isHide) return E.left(returnHide);
            }

            return returnRight();
          })
          .exhaustive();
      },
    );

    if (deps.length > 0) {
      if (dependencyOption === 'AND' && deps.every(E.isLeft)) {
        return reject(deps.find(E.isLeft)?.left);
      }

      if (dependencyOption === 'OR' && deps.some(E.isLeft)) {
        return reject(deps.find(E.isLeft)?.left);
      }
    }

    resolve(computation);
  });
};

const optionCheck = (option: Field['option'], value: any) => {
  if (
    option === 'required' &&
    (!value ||
      (isFile(value) && !value.uri) ||
      (isSet(value) && value.size <= 0))
  ) {
    throw 'This field is required';
  }
};

const isEmail = (v: unknown, message: string) => {
  try {
    z.string().email({message}).parse(v);
  } catch (error) {
    throw message;
  }
};

const isString = (v: unknown, msg: string) => {
  try {
    z.string().parse(v);
  } catch (error) {
    throw msg;
  }
};

const isNumber = (v: string, msg: string) => {
  try {
    z.number().parse(parseFloat(v));
  } catch (error) {
    throw msg;
  }
};

const typeCheck = (inputType: Field['inputType'], value: any) => {
  const msg = `Should be a ${inputType}`;

  switch (inputType) {
    case 'text':
    case 'password':
      return isString(value, msg);

    case 'email':
      return isEmail(value, 'Is not a valid email');

    case 'number':
      return isNumber(value, msg);
  }

  // return new Promise(async (resolve, reject) => {

  //   switch (inputType) {
  //     case 'text':
  //     case 'password':
  //       try {
  //         await z.string().parseAsync(value);
  //         return resolve(undefined);
  //       } catch (error) {
  //         return reject(msg);
  //       }

  //     case 'email':
  //       try {
  //         await z.string().email().parseAsync(value);
  //         return resolve(undefined);
  //       } catch (error) {
  //         return reject('Is not a valid email');
  //       }

  //     case 'number':
  //       try {
  //         await z.number().parseAsync(parseFloat(value));
  //         return resolve(undefined);
  //       } catch (error) {
  //         return reject(msg);
  //       }

  //     // default:
  //     //   resolve(undefined);
  //     //   break;
  //   }

  //   resolve(undefined);
  // });
};

// type Ctx = {};

// type States = {value: 'idle' | 'validating'; context: Ctx};

// type Events =
//   | {
//       values: Record<number, any>;
//       type: 'VALIDATE' | 'REQUEST_ACTIVATE';
//     }
//   | ((
//       | {
//           data: any;
//           type: 'VALIDATION_SUCCESSFUL' | 'ACTIVATE_REQUEST_SUCCESSFUL';
//         }
//       | {
//           reason: any;
//           type: 'VALIDATION_FAILED';
//         }
//     ) & {id: number});

// const _actor = (field: Field) => {
//   return createMachine<Ctx, Events, States>({
//     initial: 'idle',

//     states: {
//       idle: {
//         on: {
//           VALIDATE: {},
//         },
//       },
//       validating: {},
//     },
//   });
// };

const actor = ({field, fields}: {field: Field; fields: Field[]}) => {
  const {id} = field;

  const deps = field.dependencies ?? [];

  const conditions = deps.filter(isCond);

  const mappedFields = Object.fromEntries(
    fields.map((field) => [field.id, field]),
  );

  return (
    callback: Sender<EventsToParent>,
    onRecieve: Receiver<EventsFromParent>,
  ) => {
    onRecieve((event) => {
      match(event)
        .with({type: 'REQUEST_ACTIVATE', values: select()}, async (values) => {
          try {
            const data = await resolveDependencies({
              field,
              values,
              fields: mappedFields,
              skipTypes: ['VALIDATE'],
            });

            callback({id, data, type: 'ACTIVATE_REQUEST_SUCCESSFUL'});
          } catch (error) {
            const {type, ...d} = (error as any) ?? {};
            const nType = type ?? 'ACTIVATE_REQUEST_FAILED';
            callback({...d, id, reason: error, type: nType});
          }
        })
        .with({type: 'VALIDATE', values: select()}, (values) => {
          requestAnimationFrame(async () => {
            const value = values[id];

            try {
              optionCheck(field.option, value);

              typeCheck(field.inputType, value);

              const data = await resolveDependencies({
                values,
                fields: mappedFields,
                skipTypes: ['HIDE', 'JUMP', 'MATH'],
                field: {...field, dependencies: conditions},
              });

              callback({id, data, type: 'VALIDATION_SUCCESSFUL'});
            } catch (error) {
              console.log('error', error);

              const {type, ...d} = (error as any) ?? {};
              const nType = type ?? 'VALIDATION_FAILED';
              callback({...d, id, reason: error, type: nType});
            }
          });
        })
        .exhaustive();
    });

    return () => {};
  };
};

export default actor;
