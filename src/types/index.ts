/**
 * Shared type definitions
 */

export type Credentials = {
  username?: string;
  password?: string;
  rememberMe: boolean;
  token?: string | null;
  refreshToken?: string | null;
};

export type File = {
  uri: string;
  type: string;
  fileName: string;
};

export type RoleType = 'ROLE_FIELDWORKER';

export type Role = {
  authority: RoleType;
};

export type Roles = Role[];
