/**
 * Custom hook that only runs queries when user is authenticated
 */

import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
} from '@tanstack/react-query';
import useAuthStore from '../stores/authStore';

export default function useEnabledQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    ...options,
    enabled: options.enabled ?? isAuth,
  });
}
