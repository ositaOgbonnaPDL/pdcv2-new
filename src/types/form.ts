/**
 * Form Types and Interfaces
 * Defines the structure for the dynamic form engine
 */

/**
 * Field types supported by the form engine
 */
export type FieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'EMAIL'
  | 'PHONE'
  | 'TEXTAREA'
  | 'SELECT'
  | 'MULTISELECT'
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'CHECKBOX'
  | 'RADIO'
  | 'IMAGE'
  | 'IMAGES'
  | 'AUDIO'
  | 'POINT'
  | 'POLYGON'
  | 'LINESTRING'
  | 'SIGNATURE'
  | 'BARCODE'
  | 'QR';

/**
 * Field validation rule types
 */
export type ValidationRuleType =
  | 'REQUIRED'
  | 'MIN'
  | 'MAX'
  | 'MINLENGTH'
  | 'MAXLENGTH'
  | 'PATTERN'
  | 'EMAIL'
  | 'PHONE'
  | 'URL'
  | 'DATE'
  | 'NUMBER'
  | 'INTEGER'
  | 'POSITIVE'
  | 'NEGATIVE'
  | 'CUSTOM';

/**
 * Field dependency action types
 */
export type DependencyActionType = 'HIDE' | 'SHOW' | 'ENABLE' | 'DISABLE' | 'VALIDATE' | 'CALCULATE';

/**
 * Field dependency condition operators
 */
export type ConditionOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN_OR_EQUAL'
  | 'IN'
  | 'NOT_IN'
  | 'EMPTY'
  | 'NOT_EMPTY';

/**
 * Validation rule
 */
export interface ValidationRule {
  type: ValidationRuleType;
  value?: any;
  message: string;
  condition?: string; // For conditional validation
}

/**
 * Field option (for select, radio, checkbox)
 */
export interface FieldOption {
  label: string;
  value: string | number;
  metadata?: Record<string, any>;
}

/**
 * Field dependency condition
 */
export interface DependencyCondition {
  fieldId: string;
  operator: ConditionOperator;
  value?: any;
  logicalOperator?: 'AND' | 'OR'; // For chaining multiple conditions
}

/**
 * Field dependency
 */
export interface FieldDependency {
  id: string;
  action: DependencyActionType;
  conditions: DependencyCondition[];
  calculation?: string; // For CALCULATE action - expression to evaluate
  validationRule?: ValidationRule; // For VALIDATE action
}

/**
 * Form field definition
 */
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  helpText?: string;

  // Validation
  validationRules?: ValidationRule[];

  // Options (for select, radio, multiselect, checkbox)
  options?: FieldOption[];

  // Dependencies
  dependencies?: FieldDependency[];

  // Field-specific configuration
  config?: {
    // Text/Number
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;
    multiline?: boolean;
    numberOfLines?: number;

    // Date/Time
    minDate?: Date | string;
    maxDate?: Date | string;
    dateFormat?: string;

    // Image/Audio
    maxFiles?: number;
    maxFileSize?: number; // in bytes
    quality?: number; // 0-1
    allowCamera?: boolean;
    allowGallery?: boolean;

    // Geometry
    geometryType?: 'Point' | 'Polygon' | 'LineString';
    allowMultiple?: boolean;

    // Select
    searchable?: boolean;
    multiple?: boolean;

    // Custom
    [key: string]: any;
  };

  // UI
  hidden?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  order?: number;

  // Metadata
  metadata?: Record<string, any>;
}

/**
 * Form section (for grouping fields)
 */
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  order?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * Form definition
 */
export interface FormDefinition {
  id: string;
  name: string;
  version: string;
  description?: string;
  sections: FormSection[];
  metadata?: Record<string, any>;
}

/**
 * Form field value
 */
export type FormFieldValue = string | number | boolean | string[] | number[] | Date | File | File[] | null | undefined;

/**
 * Form data (field values)
 */
export interface FormData {
  [fieldId: string]: FormFieldValue;
}

/**
 * Form validation error
 */
export interface FormValidationError {
  fieldId: string;
  fieldName: string;
  message: string;
  rule?: ValidationRuleType;
}

/**
 * Form submission data
 */
export interface FormSubmission {
  formId: string;
  formVersion: string;
  data: FormData;
  submittedAt: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Form state
 */
export interface FormState {
  definition: FormDefinition;
  data: FormData;
  errors: FormValidationError[];
  touched: Record<string, boolean>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  fieldStates: Record<string, FieldState>;
}

/**
 * Individual field state
 */
export interface FieldState {
  value: FormFieldValue;
  error?: string;
  touched: boolean;
  hidden: boolean;
  disabled: boolean;
  readonly: boolean;
}

/**
 * Geometry types for map fields
 */
export interface Point {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Polygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // Array of rings, each ring is array of [lon, lat]
}

export interface LineString {
  type: 'LineString';
  coordinates: [number, number][]; // Array of [lon, lat]
}

export type Geometry = Point | Polygon | LineString;

/**
 * Image/Audio file metadata
 */
export interface MediaFile {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
  width?: number;
  height?: number;
  duration?: number; // for audio/video
  timestamp?: Date;
}
