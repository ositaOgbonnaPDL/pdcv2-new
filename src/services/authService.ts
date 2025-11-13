/**
 * Authentication Service
 * Handles login, token refresh, and role validation
 */

import axios from 'axios';
import useAuthStore from '../stores/authStore';
import {Credentials} from '../types';
import {baseURL} from '../utils/constants';

type RoleType = 'ROLE_FIELDWORKER';

type Role = {
  authority: RoleType;
};

type Roles = Role[];

type LoginCredentials = {
  username: string;
  password: string;
};

type LoginResponse = {
  token: string;
  refreshToken: string;
  roles: Roles;
  firstTimeLoggedIn?: boolean;
};

type RefreshTokenResponse = Omit<Credentials, 'username' | 'password' | 'rememberMe'>;

// Check if user has fieldworker role
const isFieldWorker = (roles: Roles): boolean => {
  return roles.some(({authority}) => authority === 'ROLE_FIELDWORKER');
};

const FIELDWORKER_ERROR = 'Only fieldworkers are allowed to use the mobile app.';

/**
 * Login with credentials
 */
export const login = async (credentials: LoginCredentials): Promise<Omit<LoginResponse, 'roles'>> => {
  try {
    const {data} = await axios.post<LoginResponse>(
      `${baseURL}/auth/signin`,
      credentials,
    );

    const {roles, ...rest} = data;

    // Validate user has fieldworker role
    if (!isFieldWorker(roles)) {
      throw new Error(FIELDWORKER_ERROR);
    }

    return rest;
  } catch (error: any) {
    const response = error.response?.data;
    const message = response?.message ?? response?.error;
    throw new Error(message ?? 'Authentication failed. Please try again.');
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  try {
    const state = useAuthStore.getState();
    const url = `${baseURL}/auth/refresh`;
    const params = {token: state.refreshToken};

    const {data} = await axios.post<RefreshTokenResponse>(url, null, {params});

    return data;
  } catch (error: any) {
    const response = error.response?.data;
    const message = response?.message ?? response?.error;
    throw new Error(message ?? 'Failed to refresh token.');
  }
};

/**
 * Logout (clear local state)
 */
export const logout = async (): Promise<void> => {
  const {logout} = useAuthStore.getState();
  logout();
};
