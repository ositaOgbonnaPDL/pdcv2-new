/**
 * Form Validation Utilities
 * Provides validation functions for all field types
 */

import {ValidationRule, FormFieldValue, ValidationRuleType} from '../types/form';

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (basic international format)
 */
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

/**
 * URL validation regex
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Check if value is empty
 */
export const isEmpty = (value: FormFieldValue): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validate a single field value against a validation rule
 */
export const validateRule = (
  value: FormFieldValue,
  rule: ValidationRule,
): string | null => {
  const {type, value: ruleValue, message} = rule;

  // Skip validation if value is empty and rule is not REQUIRED
  if (type !== 'REQUIRED' && isEmpty(value)) {
    return null;
  }

  switch (type) {
    case 'REQUIRED':
      return isEmpty(value) ? message : null;

    case 'MIN':
      if (typeof value === 'number') {
        return value < ruleValue ? message : null;
      }
      return null;

    case 'MAX':
      if (typeof value === 'number') {
        return value > ruleValue ? message : null;
      }
      return null;

    case 'MINLENGTH':
      if (typeof value === 'string') {
        return value.length < ruleValue ? message : null;
      }
      if (Array.isArray(value)) {
        return value.length < ruleValue ? message : null;
      }
      return null;

    case 'MAXLENGTH':
      if (typeof value === 'string') {
        return value.length > ruleValue ? message : null;
      }
      if (Array.isArray(value)) {
        return value.length > ruleValue ? message : null;
      }
      return null;

    case 'PATTERN':
      if (typeof value === 'string') {
        const regex = new RegExp(ruleValue);
        return !regex.test(value) ? message : null;
      }
      return null;

    case 'EMAIL':
      if (typeof value === 'string') {
        return !EMAIL_REGEX.test(value) ? message : null;
      }
      return null;

    case 'PHONE':
      if (typeof value === 'string') {
        return !PHONE_REGEX.test(value) ? message : null;
      }
      return null;

    case 'URL':
      if (typeof value === 'string') {
        return !URL_REGEX.test(value) ? message : null;
      }
      return null;

    case 'DATE':
      if (value instanceof Date) {
        return isNaN(value.getTime()) ? message : null;
      }
      if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? message : null;
      }
      return message;

    case 'NUMBER':
      if (typeof value === 'number') {
        return isNaN(value) ? message : null;
      }
      if (typeof value === 'string') {
        return isNaN(parseFloat(value)) ? message : null;
      }
      return message;

    case 'INTEGER':
      if (typeof value === 'number') {
        return !Number.isInteger(value) ? message : null;
      }
      if (typeof value === 'string') {
        const num = parseInt(value, 10);
        return isNaN(num) || num.toString() !== value ? message : null;
      }
      return message;

    case 'POSITIVE':
      if (typeof value === 'number') {
        return value <= 0 ? message : null;
      }
      return null;

    case 'NEGATIVE':
      if (typeof value === 'number') {
        return value >= 0 ? message : null;
      }
      return null;

    default:
      return null;
  }
};

/**
 * Validate a field value against all its validation rules
 */
export const validateField = (
  value: FormFieldValue,
  rules: ValidationRule[] = [],
): string | null => {
  for (const rule of rules) {
    const error = validateRule(value, rule);
    if (error) {
      return error; // Return first error
    }
  }
  return null;
};

/**
 * Validate multiple fields
 */
export const validateFields = (
  fields: Array<{name: string; value: FormFieldValue; rules?: ValidationRule[]}>,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const error = validateField(field.value, field.rules);
    if (error) {
      errors[field.name] = error;
    }
  }

  return errors;
};

/**
 * Get validation rule by type from a list of rules
 */
export const getValidationRule = (
  rules: ValidationRule[],
  type: ValidationRuleType,
): ValidationRule | undefined => {
  return rules.find(rule => rule.type === type);
};

/**
 * Check if field is required
 */
export const isFieldRequired = (rules: ValidationRule[] = []): boolean => {
  return rules.some(rule => rule.type === 'REQUIRED');
};

/**
 * Format validation message with field name
 */
export const formatValidationMessage = (
  fieldName: string,
  message: string,
): string => {
  return message.replace('{field}', fieldName);
};

/**
 * Common validation rules factory
 */
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    type: 'REQUIRED',
    message,
  }),

  min: (value: number, message = `Value must be at least ${value}`): ValidationRule => ({
    type: 'MIN',
    value,
    message,
  }),

  max: (value: number, message = `Value must be at most ${value}`): ValidationRule => ({
    type: 'MAX',
    value,
    message,
  }),

  minLength: (
    length: number,
    message = `Must be at least ${length} characters`,
  ): ValidationRule => ({
    type: 'MINLENGTH',
    value: length,
    message,
  }),

  maxLength: (
    length: number,
    message = `Must be at most ${length} characters`,
  ): ValidationRule => ({
    type: 'MAXLENGTH',
    value: length,
    message,
  }),

  pattern: (pattern: string, message = 'Invalid format'): ValidationRule => ({
    type: 'PATTERN',
    value: pattern,
    message,
  }),

  email: (message = 'Invalid email address'): ValidationRule => ({
    type: 'EMAIL',
    message,
  }),

  phone: (message = 'Invalid phone number'): ValidationRule => ({
    type: 'PHONE',
    message,
  }),

  url: (message = 'Invalid URL'): ValidationRule => ({
    type: 'URL',
    message,
  }),

  number: (message = 'Must be a valid number'): ValidationRule => ({
    type: 'NUMBER',
    message,
  }),

  integer: (message = 'Must be a whole number'): ValidationRule => ({
    type: 'INTEGER',
    message,
  }),

  positive: (message = 'Must be a positive number'): ValidationRule => ({
    type: 'POSITIVE',
    message,
  }),

  negative: (message = 'Must be a negative number'): ValidationRule => ({
    type: 'NEGATIVE',
    message,
  }),
};
