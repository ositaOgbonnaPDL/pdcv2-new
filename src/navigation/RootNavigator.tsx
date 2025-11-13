import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {
  LoginScreen,
  PasswordChangeScreen,
  MapScreen,
  FormScreen,
  ProjectScreen,
  TrackerScreen,
  SettingsScreen,
  ProjectViewerScreen,
} from '../screens';
import HomeTabNavigator from './HomeTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated: boolean;
  isFirstTimeLoggedIn: boolean;
}

const RootNavigator: React.FC<RootNavigatorProps> = ({
  isAuthenticated,
  isFirstTimeLoggedIn,
}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerBackTitleVisible: false,
        headerShadowVisible: false,
      }}>
      {!isAuthenticated ? (
        // Unauthenticated stack
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : isFirstTimeLoggedIn ? (
        // First-time login stack
        <Stack.Screen
          name="PasswordChange"
          component={PasswordChangeScreen}
          options={{
            title: 'Change Password',
            headerShown: false,
          }}
        />
      ) : (
        // Authenticated stack
        <>
          <Stack.Screen
            name="Home"
            component={HomeTabNavigator}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Form"
            component={FormScreen}
            options={({route}) => ({
              title: route.params?.project?.name || 'Form',
            })}
          />
          <Stack.Screen
            name="Project"
            component={ProjectScreen}
            options={({route}) => ({
              title: route.params?.project?.name || 'Project',
            })}
          />
          <Stack.Screen
            name="Tracker"
            component={TrackerScreen}
            options={{
              headerTransparent: true,
              headerBackTitleVisible: false,
              title: '',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
            }}
          />
          <Stack.Screen
            name="ProjectViewer"
            component={ProjectViewerScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
