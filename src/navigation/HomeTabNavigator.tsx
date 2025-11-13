import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ProjectsScreen, AssignedScreen} from '../screens';
import {HomeTabParamList} from '../types/navigation';

const Tab = createBottomTabNavigator<HomeTabParamList>();

const HomeTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
      }}>
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Assigned"
        component={AssignedScreen}
        options={{
          title: 'Assigned Data',
          tabBarLabel: 'Assigned Data',
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeTabNavigator;
