/**
 * Form Utilities
 * Helper functions for form handling, dependencies, and calculations
 */

import {
  FormField,
  FormData,
  FormFieldValue,
  DependencyCondition,
  ConditionOperator,
  FieldDependency,
  FormDefinition,
  FormSection,
} from '../types/form';

/**
 * Evaluate a dependency condition
 */
export const evaluateCondition = (
  condition: DependencyCondition,
  formData: FormData,
): boolean => {
  const fieldValue = formData[condition.fieldId];
  const {operator, value} = condition;

  switch (operator) {
    case 'EQUALS':
      return fieldValue === value;

    case 'NOT_EQUALS':
      return fieldValue !== value;

    case 'CONTAINS':
      if (typeof fieldValue === 'string') {
        return fieldValue.includes(String(value));
      }
      if (Array.isArray(fieldValue)) {
        return (fieldValue as any[]).includes(value);
      }
      return false;

    case 'NOT_CONTAINS':
      if (typeof fieldValue === 'string') {
        return !fieldValue.includes(String(value));
      }
      if (Array.isArray(fieldValue)) {
        return !(fieldValue as any[]).includes(value);
      }
      return true;

    case 'GREATER_THAN':
      if (typeof fieldValue === 'number' && typeof value === 'number') {
        return fieldValue > value;
      }
      return false;

    case 'LESS_THAN':
      if (typeof fieldValue === 'number' && typeof value === 'number') {
        return fieldValue < value;
      }
      return false;

    case 'GREATER_THAN_OR_EQUAL':
      if (typeof fieldValue === 'number' && typeof value === 'number') {
        return fieldValue >= value;
      }
      return false;

    case 'LESS_THAN_OR_EQUAL':
      if (typeof fieldValue === 'number' && typeof value === 'number') {
        return fieldValue <= value;
      }
      return false;

    case 'IN':
      if (Array.isArray(value)) {
        return value.includes(fieldValue);
      }
      return false;

    case 'NOT_IN':
      if (Array.isArray(value)) {
        return !value.includes(fieldValue);
      }
      return true;

    case 'EMPTY':
      return (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    case 'NOT_EMPTY':
      return !(
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    default:
      return false;
  }
};

/**
 * Evaluate all conditions in a dependency
 */
export const evaluateDependency = (
  dependency: FieldDependency,
  formData: FormData,
): boolean => {
  if (!dependency.conditions || dependency.conditions.length === 0) {
    return true;
  }

  // Default to AND logic if not specified
  const logicalOp = dependency.conditions[0]?.logicalOperator || 'AND';

  if (logicalOp === 'AND') {
    return dependency.conditions.every(condition =>
      evaluateCondition(condition, formData),
    );
  } else {
    // OR
    return dependency.conditions.some(condition =>
      evaluateCondition(condition, formData),
    );
  }
};

/**
 * Check if a field should be hidden based on dependencies
 */
export const isFieldHidden = (
  field: FormField,
  formData: FormData,
): boolean => {
  if (!field.dependencies || field.dependencies.length === 0) {
    return field.hidden || false;
  }

  for (const dependency of field.dependencies) {
    if (dependency.action === 'HIDE') {
      if (evaluateDependency(dependency, formData)) {
        return true;
      }
    } else if (dependency.action === 'SHOW') {
      if (!evaluateDependency(dependency, formData)) {
        return true;
      }
    }
  }

  return field.hidden || false;
};

/**
 * Check if a field should be disabled based on dependencies
 */
export const isFieldDisabled = (
  field: FormField,
  formData: FormData,
): boolean => {
  if (!field.dependencies || field.dependencies.length === 0) {
    return field.disabled || false;
  }

  for (const dependency of field.dependencies) {
    if (dependency.action === 'DISABLE') {
      if (evaluateDependency(dependency, formData)) {
        return true;
      }
    } else if (dependency.action === 'ENABLE') {
      if (!evaluateDependency(dependency, formData)) {
        return true;
      }
    }
  }

  return field.disabled || false;
};

/**
 * Calculate field value based on dependency calculation
 */
export const calculateFieldValue = (
  calculation: string,
  formData: FormData,
): FormFieldValue => {
  try {
    // Replace field references with actual values
    let expression = calculation;

    // Find all field references like {fieldId}
    const fieldRefs = calculation.match(/\{([^}]+)\}/g);

    if (fieldRefs) {
      fieldRefs.forEach(ref => {
        const fieldId = ref.slice(1, -1); // Remove { }
        const value = formData[fieldId];
        const numberValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
        expression = expression.replace(ref, String(numberValue));
      });
    }

    // Evaluate the expression safely
    // Note: In production, use a safer evaluation method like math.js
    // This is a simplified version
    const result = eval(expression);

    return typeof result === 'number' ? result : null;
  } catch (error) {
    console.error('Error calculating field value:', error);
    return null;
  }
};

/**
 * Get all fields from form definition as a flat array
 */
export const getAllFields = (form: FormDefinition): FormField[] => {
  return form.sections.flatMap(section => section.fields);
};

/**
 * Get field by ID from form definition
 */
export const getFieldById = (
  form: FormDefinition,
  fieldId: string,
): FormField | undefined => {
  return getAllFields(form).find(field => field.id === fieldId);
};

/**
 * Get section by ID from form definition
 */
export const getSectionById = (
  form: FormDefinition,
  sectionId: string,
): FormSection | undefined => {
  return form.sections.find(section => section.id === sectionId);
};

/**
 * Sort fields by order
 */
export const sortFieldsByOrder = (fields: FormField[]): FormField[] => {
  return [...fields].sort((a, b) => (a.order || 0) - (b.order || 0));
};

/**
 * Sort sections by order
 */
export const sortSectionsByOrder = (sections: FormSection[]): FormSection[] => {
  return [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
};

/**
 * Get visible fields (not hidden)
 */
export const getVisibleFields = (
  fields: FormField[],
  formData: FormData,
): FormField[] => {
  return fields.filter(field => !isFieldHidden(field, formData));
};

/**
 * Get required fields
 */
export const getRequiredFields = (fields: FormField[]): FormField[] => {
  return fields.filter(field => field.required === true);
};

/**
 * Initialize form data with default values
 */
export const initializeFormData = (form: FormDefinition): FormData => {
  const data: FormData = {};

  getAllFields(form).forEach(field => {
    if (field.defaultValue !== undefined) {
      data[field.id] = field.defaultValue;
    }
  });

  return data;
};

/**
 * Get form completion percentage
 */
export const getFormCompletionPercentage = (
  form: FormDefinition,
  formData: FormData,
): number => {
  const visibleFields = getVisibleFields(getAllFields(form), formData);
  const requiredFields = getRequiredFields(visibleFields);

  if (requiredFields.length === 0) {
    return 100;
  }

  const completedFields = requiredFields.filter(field => {
    const value = formData[field.id];
    return value !== null && value !== undefined && value !== '';
  });

  return Math.round((completedFields.length / requiredFields.length) * 100);
};

/**
 * Check if form is complete (all required fields filled)
 */
export const isFormComplete = (
  form: FormDefinition,
  formData: FormData,
): boolean => {
  return getFormCompletionPercentage(form, formData) === 100;
};

/**
 * Get field label with required indicator
 */
export const getFieldLabel = (field: FormField): string => {
  return field.required ? `${field.label} *` : field.label;
};

/**
 * Format field value for display
 */
export const formatFieldValue = (
  value: FormFieldValue,
  field: FormField,
): string => {
  if (value === null || value === undefined) {
    return '';
  }

  switch (field.type) {
    case 'DATE':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      return String(value);

    case 'TIME':
      if (value instanceof Date) {
        return value.toLocaleTimeString();
      }
      return String(value);

    case 'DATETIME':
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      return String(value);

    case 'CHECKBOX':
    case 'RADIO':
    case 'SELECT':
      if (field.options) {
        const option = field.options.find(opt => opt.value === value);
        return option ? option.label : String(value);
      }
      return String(value);

    case 'MULTISELECT':
      if (Array.isArray(value) && field.options) {
        return value
          .map(val => {
            const option = field.options!.find(opt => opt.value === val);
            return option ? option.label : String(val);
          })
          .join(', ');
      }
      return String(value);

    default:
      return String(value);
  }
};
