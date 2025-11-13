import Geolocation, {
  GeoPosition,
  GeoWatchOptions,
} from 'react-native-geolocation-service';
import {Observable} from 'rxjs';

const watchPosition = (options: GeoWatchOptions) => {
  return new Observable<GeoPosition>((subscriber) => {
    const id = Geolocation.watchPosition(
      (coords) => {
        subscriber.next(coords);
      },
      (err) => {
        subscriber.error(err);
      },
      {
        showLocationDialog: true,
        forceRequestLocation: true,
        accuracy: {
          android: 'high',
          ios: 'bestForNavigation',
        },
        ...options,
      },
    );

    return () => {
      Geolocation.clearWatch(id);
    };
  });
};

export default watchPosition;
