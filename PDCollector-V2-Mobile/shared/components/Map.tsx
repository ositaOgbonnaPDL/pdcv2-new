import React, {forwardRef, ReactNode} from 'react';
import MapView, {MapViewProps} from 'react-native-maps';
import useSettings, {colorSchemeSelector} from '../stores/settings';

type Map = MapViewProps & {
  children: ReactNode;
};

const Map = forwardRef<MapView, Map>(function Map(props, ref) {
  const colorScheme = useSettings(colorSchemeSelector);
  const style = colorScheme === 'dark' ? 'dark' : 'light';
  return <MapView {...props} ref={ref} userInterfaceStyle={style} />;
});

export default Map;
