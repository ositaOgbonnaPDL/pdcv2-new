import {StackNavigationOptions} from '@react-navigation/stack';
import {ColorSchemeName, Platform} from 'react-native';
import {Colors} from 'react-native-paper';

export const radius = 8;

export const largeTitle: StackNavigationOptions['headerTitleStyle'] = {
  fontSize: 30,
  fontWeight: '700',
};

export const resetHeaderStyle: StackNavigationOptions['headerStyle'] = {
  elevation: 0,
  shadowOpacity: 0,
  shadowColor: 'transparent',
  backgroundColor: 'transparent',
  shadowOffset: {width: 0, height: 0},
};

export const mapTintColor = (colorScheme: ColorSchemeName) => {
  return Platform.OS === 'android'
    ? Colors.black
    : colorScheme === 'dark'
    ? Colors.white
    : Colors.black;
};
