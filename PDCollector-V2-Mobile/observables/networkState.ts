import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {Observable} from 'rxjs';

const networkState = new Observable<NetInfoState>((subscriber) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    subscriber.next(state);
  });

  return unsubscribe;
});

export default networkState;
