import EncryptedStorage from 'react-native-encrypted-storage';
import create, {GetState, SetState, StateCreator, StoreApi} from 'zustand';
import {Credentials} from '../types';

export const CREDENTIALS = 'credentials';

export type State = Credentials & {
  isAuthenticated: boolean;
  firstTimeLoggedIn?: boolean;
};

export type Actions = {
  logout: () => void;
  setAuth(params: Partial<State>): void;
};

export type Auth = State & Actions;

const saveMiddleware = <T extends Auth>(config: StateCreator<T>) => (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>,
) => {
  return config(
    async (args) => {
      set(args);

      const {token} = get();

      set({isAuthenticated: !!token});

      const {isAuthenticated, ...auth} = get();

      if (isAuthenticated && auth.rememberMe) {
        EncryptedStorage.setItem(CREDENTIALS, JSON.stringify(auth));
      }
    },
    get,
    api,
  );
};

const authStore = create<Auth>(
  saveMiddleware((set, get) => ({
    rememberMe: false,
    isAuthenticated: false,
    logout: () => {
      set({
        token: null,
        rememberMe: false,
        refreshToken: null,
        isAuthenticated: false,
      });

      EncryptedStorage.clear();
    },
    setAuth: (params) => {
      const old = get();
      set({...old, ...params});
    },
  })),
);

export default authStore;
