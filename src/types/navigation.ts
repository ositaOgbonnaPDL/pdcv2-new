/**
 * Navigation type definitions for React Navigation 6
 */

export type RootStackParamList = {
  // Unauthenticated routes
  Login: undefined;

  // First-time login
  PasswordChange: undefined;

  // Authenticated routes
  Home: undefined;
  Map: {
    projectId?: string;
  };
  Form: {
    project?: any;
    data?: any;
    collectedGeometry?: any;
  };
  Project: {
    project?: any;
  };
  Tracker: {
    projectId?: string;
  };
  Settings: undefined;
  ProjectViewer: {
    project?: any;
  };
};

export type HomeTabParamList = {
  Projects: undefined;
  Assigned: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
