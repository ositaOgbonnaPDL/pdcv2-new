/**
 * Home Module
 * Wrapper for Home screens with Assigned data provider
 */

import React from 'react';
import AssignedProvider from '../../contexts/AssignedContext';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ProjectsScreen from './screens/ProjectsScreen';
import AssignedScreen from './screens/AssignedScreen';
import {useAssigned} from '../../contexts/AssignedContext';
import useSettingsStore, {colorSchemeSelector} from '../../stores/settingsStore';
import {useTheme, MD3Colors} from 'react-native-paper';

const Tab = createBottomTabNavigator();

const Tabs = () => {
  const {data} = useAssigned();
  const colorScheme = useSettingsStore(colorSchemeSelector);
  const {colors} = useTheme();

  const isDark = colorScheme === 'dark';
  const assigned = data?.filter((d: any) => !!d.dataProject)?.length ?? 0;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: isDark ? colors.background : MD3Colors.neutral100,
        },
        tabBarActiveTintColor: isDark ? MD3Colors.neutral100 : colors.primary,
        tabBarInactiveTintColor: isDark ? MD3Colors.neutral60 : MD3Colors.neutral40,
        headerShown: false,
      }}>
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({size, color}) => {
            // TODO: Add custom SVG icon
            return null;
          },
        }}
      />
      <Tab.Screen
        name="Assigned"
        component={AssignedScreen}
        options={{
          title: 'Assigned Data',
          tabBarBadge: assigned > 0 ? assigned : undefined,
          tabBarIcon: ({size, color}) => {
            // TODO: Add custom SVG icon
            return null;
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default function Home() {
  return (
    <AssignedProvider>
      <Tabs />
    </AssignedProvider>
  );
}
