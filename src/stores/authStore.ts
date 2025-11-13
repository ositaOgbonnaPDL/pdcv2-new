/**
 * Authentication Store (Zustand v4)
 * Manages user authentication state with encrypted storage persistence
 */

import {create} from 'zustand';
import EncryptedStorage from 'react-native-encrypted-storage';
import {Credentials} from '../types';

export const CREDENTIALS = 'credentials';

export type AuthState = Credentials & {
  isAuthenticated: boolean;
  firstTimeLoggedIn?: boolean;
};

export type AuthActions = {
  logout: () => void;
  setAuth: (params: Partial<AuthState>) => void;
};

export type AuthStore = AuthState & AuthActions;

// Custom encrypted storage middleware for auth
const createEncryptedStorageMiddleware = (config: any) => (set: any, get: any, api: any) => {
  const store = config(
    async (args: any) => {
      set(args);

      const {token} = get();
      set({isAuthenticated: !!token});

      const {isAuthenticated, ...auth} = get();

      // Save to encrypted storage if authenticated and remember me is enabled
      if (isAuthenticated && auth.rememberMe) {
        try {
          await EncryptedStorage.setItem(CREDENTIALS, JSON.stringify(auth));
        } catch (error) {
          console.error('Failed to save credentials:', error);
        }
      }
    },
    get,
    api,
  );

  return store;
};

const useAuthStore = create<AuthStore>(
  createEncryptedStorageMiddleware((set: any, get: any) => ({
    // Initial state
    rememberMe: false,
    isAuthenticated: false,
    firstTimeLoggedIn: false,

    // Actions
    logout: async () => {
      set({
        token: null,
        username: undefined,
        password: undefined,
        rememberMe: false,
        refreshToken: null,
        isAuthenticated: false,
        firstTimeLoggedIn: false,
      });

      try {
        await EncryptedStorage.clear();
      } catch (error) {
        console.error('Failed to clear encrypted storage:', error);
      }
    },

    setAuth: (params: Partial<AuthState>) => {
      const old = get();
      set({...old, ...params});
    },
  })),
);

export default useAuthStore;
