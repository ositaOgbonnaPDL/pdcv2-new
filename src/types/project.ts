/**
 * Project and Field Types
 */

export type Feature = 'POINT' | 'POLYGON' | 'LINESTRING';

export type DependencyType = 'VALIDATE' | 'JUMP' | 'MATH' | 'HIDE';

export type Condition =
  | 'HAS_A_VALUE'
  | 'IS_EQUAL_TO'
  | 'IS_NOT_EQUAL_TO'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL_TO'
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL_TO';

export type InputTypes =
  | 'text'
  | 'number'
  | 'radio'
  | 'checkbox'
  | 'email'
  | 'password'
  | 'dropdown'
  | 'date'
  | 'audio'
  | 'select'
  | 'image';

export enum ImageSource {
  any = 'ANY',
  camera = 'CAMERA',
}

export type Dependency = {
  field: number;
  formula: string;
  tempField: string;
  condition: Condition;
  conditionValue: string;
  dependencyType: DependencyType;
  dependencyEvent: 'PRE' | 'POST';
};

export type Field = {
  id: number;
  name: string;
  static: boolean;
  duration: string;
  tempField: string;
  fieldOrder: number;
  defaultValue: string;
  inputType: InputTypes;
  imageSource: ImageSource;
  dependencies: Dependency[];
  options: {value: string}[];
  dependencyOption: 'AND' | 'OR';
  option: 'none' | 'required' | 'disabled';
};

export type Geofence = {
  id: number;
  name: string;
  client: number;
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][];
  };
};

export type Project = {
  id: number;
  name: string;
  client: number;
  fields: Field[];
  feature: Feature;
  copyright: string;
  createdAt: string;
  description: string;
  geofence: Geofence[];
  linkToProject: number;
  accuracyLevel: number;
  trackingStatus: 'disabled' | 'required' | 'optional' | null;

  // DC: Data Collection,
  // DV: Data Verification,
  // SV: Survey
  type: 'DC' | 'DV' | 'SV';
};

export type AssignedData = {
  id: number;
  geometry: any;
  dataProject: Project | null;
};
