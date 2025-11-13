import {ColorSchemeName} from 'react-native';
import create, {
  GetState,
  SetState,
  StateCreator,
  StateSelector,
  StoreApi,
} from 'zustand';
import {setAsyncItem} from '../utils';

export type Themes = ColorSchemeName | 'system';

export enum ImageQuality {
  LOW = 0.4,
  MEDIUM = 0.7,
  HIGH = 1,
}

export type ValuesType = {
  theme: {
    system?: boolean;
    colorScheme?: ColorSchemeName;
  };
  media: {
    canSave: boolean;
    quality: ImageQuality;
  };
  tracking: {
    accurracyEnabled: boolean;
  };
};

export type ActionsType = {
  setTheme(theme: ValuesType['theme']): void;
  setMedia(media: Partial<ValuesType['media']>): void;
  setTracking(media: Partial<ValuesType['tracking']>): void;
};

export type Context = ValuesType & ActionsType;

export const PREFERENCE = 'preference';

const saveMiddleware = <T extends Context>(config: StateCreator<T>) => (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>,
) =>
  config(
    (args) => {
      set(args);
      setAsyncItem(PREFERENCE, get());
    },
    get,
    api,
  );

const useSettingsStore = create<Context>(
  saveMiddleware((set, get) => ({
    theme: {
      system: true,
      colorScheme: 'dark',
    },
    media: {
      canSave: false,
      quality: ImageQuality.LOW,
    },
    tracking: {
      accurracyEnabled: true,
    },

    setMedia: (media) => {
      set({media: {...get().media, ...media}});
    },

    setTracking: (tracking) => {
      set({tracking: {...get().tracking, ...tracking}});
    },

    setTheme: (theme) => {
      set({theme: {...get().theme, ...theme}});
    },
  })),
);

export const colorSchemeSelector: StateSelector<
  Context,
  ValuesType['theme']['colorScheme']
> = ({theme}) => theme.colorScheme;

export default useSettingsStore;
