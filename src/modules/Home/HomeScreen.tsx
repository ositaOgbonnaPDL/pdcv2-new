import React from 'react';
import {AssignedProvider} from './context';
import HomeTabNavigator from '../../navigation/HomeTabNavigator';

/**
 * Home Screen - Main entry point after login
 *
 * This component wraps the HomeTabNavigator with the AssignedProvider
 * to provide assigned data context to both tabs (Projects and Assigned).
 */
export default function HomeScreen() {
  return (
    <AssignedProvider>
      <HomeTabNavigator />
    </AssignedProvider>
  );
}
