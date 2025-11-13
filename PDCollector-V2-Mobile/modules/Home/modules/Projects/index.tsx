import {TransitionPresets} from '@react-navigation/stack';
import {TransitionSpec} from '@react-navigation/stack/lib/typescript/src/types';
import React from 'react';
import {Colors, useTheme} from 'react-native-paper';
import {
  createSharedElementStackNavigator,
  SharedElementsConfig,
} from 'react-navigation-shared-element';
import useSettings, {
  colorSchemeSelector,
} from '../../../../shared/stores/settings';
import {largeTitle, resetHeaderStyle} from '../../../../shared/theme';
import ProjectList from './screens/List';
import ProjectPopup from './screens/Popup';

const iosTransitionSpec: TransitionSpec = {
  animation: 'spring',
  config: {
    tension: 280,
    friction: 60,
  },
};

const Stack = createSharedElementStackNavigator();

export default function Projects() {
  const {background} = useTheme().colors;
  const colorScheme = useSettings(colorSchemeSelector);

  const isDark = colorScheme === 'dark';

  return (
    <Stack.Navigator
      // mode="modal"
      initialRouteName="Projects"
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: largeTitle,
        headerTintColor: isDark ? Colors.white : Colors.black,
        headerStyle: {
          ...(resetHeaderStyle as any),
          backgroundColor: background,
        },
        gestureEnabled: false,
        ...TransitionPresets.ModalSlideFromBottomIOS,
        transitionSpec: {
          open: iosTransitionSpec,
          close: iosTransitionSpec,
        },

        cardStyle: {backgroundColor: 'transparent'},

        cardStyleInterpolator: ({current: {progress}}) => ({
          cardStyle: {
            opacity: progress,
          },
        }),
      }}>
      <Stack.Screen name="Projects" component={ProjectList} />

      <Stack.Screen
        name="Popup"
        component={ProjectPopup}
        options={{headerShown: false}}
        sharedElementsConfig={({name, params}, _, showing) => {
          const {id} = params;

          const config: SharedElementsConfig = [
            {id: `project-${id}`, animation: 'fade'},
          ];

          if (name === 'Popup' && showing) {
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
