/**
 * Project utility functions
 */

import {groupBy} from 'ramda';
import {Field, Project} from '../types/project';

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

/**
 * Create a map of fields by their ID for quick lookup
 */
export const createFieldsMap = (
  fields: Project['fields'],
): Record<Field['id'], Field> => {
  const mapped = fields.map((field) => [field.id, field] as const);
  return Object.fromEntries<Field>(mapped);
};

/**
 * Map to array converter
 */
export const mapToArray = <Key, Value>(x: Map<Key, Value>) => {
  return Array.from(x.values());
};
