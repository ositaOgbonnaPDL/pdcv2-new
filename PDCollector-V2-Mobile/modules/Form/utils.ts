import {File} from '../../shared/types';

export const isSet = <T = string>(x: any): x is Set<T> => {
  return x instanceof Set;
};

export const isFile = (x: any): x is File => {
  return Object.prototype.toString.call(x) === '[object Object]' && 'uri' in x;
};
