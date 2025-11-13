import React from 'react';
import {
  createSharedElementStackNavigator,
  SharedElementsConfig,
} from 'react-navigation-shared-element';
import BackImage from '../../shared/components/BackImage';
import useSettings, {colorSchemeSelector} from '../../shared/stores/settings';
import {mapTintColor} from '../../shared/theme';
import {sharedElementScreenOptions} from '../../shared/utils';
import Details from './screens/Details';
import Map from './screens/Map';

const Stack = createSharedElementStackNavigator();

export default function Projects() {
  const colorScheme = useSettings(colorSchemeSelector);

  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        ...sharedElementScreenOptions,
        headerTransparent: true,
        headerBackTitleVisible: false,
        headerTitleStyle: {display: 'none'},
        headerTintColor: mapTintColor(colorScheme),
        headerBackImage: ({tintColor}) => <BackImage color={tintColor} />,
      }}>
      <Stack.Screen name="Main" component={Map} />

      <Stack.Screen
        name="Details"
        component={Details}
        sharedElementsConfig={(route, _, showing) => {
          const {task} = route.params;
          const config: SharedElementsConfig = [
            {id: `map-${task.id}`, animation: 'fade'},
            {id: `header-${task.id}`, animation: 'fade'},
            {id: `content-${task.id}`, animation: 'fade'},
          ];

          if (route.name === 'Details' && showing) {
            // Open animation fades in image, title and description
            return config;
          } else {
            // Close animation only fades out image
            return config;
          }
        }}
      />
    </Stack.Navigator>
  );
}
