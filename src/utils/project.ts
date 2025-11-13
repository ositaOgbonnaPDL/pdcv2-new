/**
 * Project utility functions
 */

import {groupBy} from 'ramda';
import {Field} from '../types/project';

/**
 * Groups fields by their input type (image, audio, other)
 */
export const groupByType = groupBy<Field>(({inputType}) => {
  switch (inputType) {
    case 'image':
    case 'audio':
      return inputType;

    default:
      return 'other';
  }
});
