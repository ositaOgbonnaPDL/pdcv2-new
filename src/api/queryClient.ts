/**
 * TanStack Query v5 Client Configuration
 */

import {QueryClient} from '@tanstack/react-query';

// Query keys for react-query
export const QUERY_KEYS = {
  PROJECTS: 'projects',
  ASSIGNED: 'assigned',
  TRACKS: 'tracks',
} as const;

// Create and configure the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});
