import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Colors, useTheme} from 'react-native-paper';
import House from '../../assets/svg/sf/house.fill.svg';
import PersonBage from '../../assets/svg/sf/person.badge.clock.fill.svg';
import useSettings, {colorSchemeSelector} from '../../shared/stores/settings';
import AssignedProvider, {useAssigned} from './context/Assigned';
import Assigned from './modules/Assigned';
import Projects from './modules/Projects';

const Tab = createBottomTabNavigator();

const Tabs = () => {
  const {data} = useAssigned();

  const colorScheme = useSettings(colorSchemeSelector);
  const {primary, background, primaryDark} = useTheme().colors;

  const isDark = colorScheme === 'dark';
  const assigned = data?.filter((d: any) => !!d.dataProject)?.length ?? 0;

  return (
    <Tab.Navigator
      sceneContainerStyle={{backgroundColor: background}}
      tabBarOptions={{
        keyboardHidesTabBar: true,
        activeTintColor: isDark ? Colors.white : primary,
        style: {backgroundColor: isDark ? primaryDark : Colors.white},
      }}>
      <Tab.Screen
        name="Projects"
        component={Projects}
        options={{
          title: 'Home',
          tabBarIcon: ({size, color}) => (
            <House width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Assigned"
        component={Assigned}
        options={{
          title: 'Assigned Data',
          tabBarBadge: assigned > 0 ? assigned : undefined,
          tabBarIcon: ({size, color}) => (
            <PersonBage width={size} height={size} color={color} />
          ),
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
