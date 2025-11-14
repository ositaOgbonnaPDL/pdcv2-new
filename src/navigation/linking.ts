/**
 * Deep Linking Configuration for React Navigation
 * Handles URL schemes and universal links
 */

import {LinkingOptions} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';

/**
 * Deep linking prefixes
 * - Custom URL scheme: pdcv2://
 * - Universal links: https://pdcollector.app (when configured)
 */
const prefixes = [
  'pdcv2://',
  // Add universal link domains here when configured
  // 'https://pdcollector.app',
  // 'https://www.pdcollector.app',
];

/**
 * Linking configuration for React Navigation
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes,
  config: {
    screens: {
      // Auth Stack
      Login: {
        path: 'login',
      },
      PasswordChange: {
        path: 'password-change',
      },

      // Main App (Home Tabs)
      Home: {
        path: 'app',
      },

      // Map Screen
      Map: {
        path: 'map/:projectId?',
        parse: {
          projectId: (projectId: string | undefined) => projectId,
        },
      },

      // Form Screen
      Form: {
        path: 'form',
      },

      // Project Screen
      Project: {
        path: 'project',
      },

      // Tracker Screen
      Tracker: {
        path: 'tracker/:projectId?',
        parse: {
          projectId: (projectId: string | undefined) => projectId,
        },
      },

      // Settings Screen
      Settings: {
        path: 'settings',
      },

      // Project Viewer Screen
      ProjectViewer: {
        path: 'project-viewer',
      },
    },
  },

  /**
   * Custom URL handler (optional)
   * Use this to handle specific URL patterns before React Navigation
   */
  // getInitialURL: async () => {
  //   // Custom logic here
  //   const url = await Linking.getInitialURL();
  //   return url;
  // },

  /**
   * Subscribe to URL changes (optional)
   * Use this to handle URL changes while app is running
   */
  // subscribe: (listener) => {
  //   const onReceiveURL = ({url}: {url: string}) => listener(url);
  //
  //   // Listen to incoming links from deep linking
  //   const subscription = Linking.addEventListener('url', onReceiveURL);
  //
  //   return () => {
  //     subscription.remove();
  //   };
  // },
};

/**
 * Deep link URL patterns
 */
export const DeepLinkPatterns = {
  // Auth
  LOGIN: 'pdcv2://login',
  PASSWORD_CHANGE: 'pdcv2://password-change',

  // Projects
  PROJECTS: 'pdcv2://app/projects',
  PROJECT_DETAIL: (projectId: string) => `pdcv2://app/projects/${projectId}`,

  // Assigned Data
  ASSIGNED: 'pdcv2://app/assigned',

  // Settings
  SETTINGS: 'pdcv2://app/settings',

  // Form
  FORM: (formId: string) => `pdcv2://form/${formId}`,

  // Map
  MAP: 'pdcv2://map',

  // Tracker
  TRACKER: 'pdcv2://tracker',
  TRACKER_PROJECT: (projectId: string) => `pdcv2://tracker/${projectId}`,
} as const;

/**
 * Universal link URL patterns (HTTPS)
 * Uncomment when domain is configured
 */
// export const UniversalLinkPatterns = {
//   // Auth
//   LOGIN: 'https://pdcollector.app/login',
//   PASSWORD_CHANGE: 'https://pdcollector.app/password-change',
//
//   // Projects
//   PROJECTS: 'https://pdcollector.app/app/projects',
//   PROJECT_DETAIL: (projectId: string) => `https://pdcollector.app/app/projects/${projectId}`,
//
//   // Form
//   FORM: (formId: string) => `https://pdcollector.app/form/${formId}`,
// } as const;
