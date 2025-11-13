import {useMachine} from '@xstate/react';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import tracker, {Context as TContext} from './tracker';
import useSettings from '../../shared/stores/settings';

export type ValuesType = Pick<TContext, 'track' | 'project' | 'error'> & {
  enabled: boolean;
};

type ActionsType = {
  stop(): void;
  clearError(): void;
  setTracking(
    _: Pick<Partial<ValuesType>, 'project'> & {
      enable: boolean;
    },
  ): void;
};

type Context = ValuesType & ActionsType;

export const Context = createContext<Context>({} as Context);

export const useTracker = () => useContext(Context);

function TrackManager({children}: {children: ReactNode}) {
  const accurracyEnabled = useSettings(
    ({tracking}) => tracking.accurracyEnabled,
  );

  const [current, send] = useMachine(tracker, {
    context: {
      track: [],
      error: null,
      accurracyEnabled,
      currentSegment: [],
    },
  });

  const {error, track, project, projectName} = current.context;

  const enabled = current.matches('enabled');

  const stop = useCallback(() => {
    send('STOP');
  }, [send]);

  const clearError = useCallback(() => {
    send('CLEAR_ERROR');
  }, [send]);

  const setTracking = useCallback<ActionsType['setTracking']>(
    ({enable, project}) => {
      const ev = {project, projectName, type: enable ? 'ENABLE' : 'DISABLE'};
      send(ev as any);
    },
    [send],
  );

  useEffect(() => {
    send({type: 'ENABLE_ACCURACY', value: accurracyEnabled});
  }, [send, accurracyEnabled]);

  return (
    <Context.Provider
      value={{
        stop,
        error,
        track,
        enabled,
        project,
        clearError,
        setTracking,
      }}>
      {children}
    </Context.Provider>
  );
}

export default TrackManager;
