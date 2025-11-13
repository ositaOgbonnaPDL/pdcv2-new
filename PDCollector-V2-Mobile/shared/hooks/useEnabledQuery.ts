import {
  QueryFunction,
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import authStore from '../stores/auth';

export default function useEnabledQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TQueryFnData>,
  options?: UseQueryOptions<TQueryFnData, TError, TData>,
): UseQueryResult<TData, TError> {
  const isAuth = authStore((s) => s.isAuthenticated);
  return useQuery(queryKey, queryFn, {
    ...options,
    enabled: options?.enabled ?? isAuth,
  });
}
