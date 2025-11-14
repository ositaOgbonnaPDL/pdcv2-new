/**
 * Application constants
 */

import prettyBytes from 'pretty-bytes';

// Storage keys
export const NAVIGATION_STATE = 'navigation';
export const CREDENTIALS = 'credentials';
export const PREFERENCE = 'preference';
export const TASKS = 'tasks';
export const DISCLOSURE = 'disclosure';
export const FAILED_TRACKS = 'failed_tracks';
export const TRACKER_PREFERENCE = 'tracker_preference';

// Query keys for TanStack Query
export const QUERY_KEYS = {
  PROJECTS: 'projects',
  ASSIGNED: 'assigned',
  TRACKS: 'tracks',
} as const;

// Notification
export const NOTIFICATION_CHANNEL = 'pdc';
export const TASK_ID = 'com.transistorsoft.datauploader';

// File size limit (20MB)
export const FILE_SIZE_LIMIT = 20000000;
export const prettySizeLimit = prettyBytes(FILE_SIZE_LIMIT);

// Placeholder image
export const placeholder = 'http://placehold.jp/500x500.png?text=PDCv2';

// API
export const baseURL = 'https://35.239.236.136';

// Project types
export const projectTypes = {
  SV: 'Survey',
  DC: 'Data Collection',
  DV: 'Data Verification',
};
