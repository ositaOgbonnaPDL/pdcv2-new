import {AppState, AppStateStatus} from 'react-native';
import {Observable} from 'rxjs';

const appState = new Observable<AppStateStatus>((subscriber) => {
  const onChange = (state: AppStateStatus) => {
    subscriber.next(state);
  };

  AppState.addEventListener('change', onChange);

  return () => {
    AppState.removeEventListener('change', onChange);
  };
});

export default appState;
